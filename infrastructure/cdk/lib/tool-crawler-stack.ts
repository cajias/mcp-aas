import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import * as fs from 'fs';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';

export class ToolCrawlerStack extends cdk.Stack {
  public readonly sourceListKey: string = 'sources.yaml';
  public readonly toolCatalogKey: string = 'tools.json';
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import Lambda layer from the package layer stack
    const lambdaLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      'ImportedLambdaLayer',
      cdk.Fn.importValue('ToolCrawlerDepsLayerArn')
    );
    
    // Import S3 bucket from the dummy stack
    const sourceBucket = s3.Bucket.fromBucketName(
      this, 
      'ImportedSourceBucket', 
      'mcpdummystack-mcptoolcrawlerbucket79188e62-n40jilnp0est'
    );

    // Create DynamoDB Tables
    const sourcesTable = new dynamodb.Table(this, 'SourcesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
    });

    const crawlersTable = new dynamodb.Table(this, 'CrawlersTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
    });

    const crawlResultsTable = new dynamodb.Table(this, 'CrawlResultsTable', {
      partitionKey: { name: 'source_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
    });

    // Create Lambda execution role
    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant Lambda access to S3 and DynamoDB
    sourceBucket.grantReadWrite(lambdaExecutionRole);
    sourcesTable.grantReadWriteData(lambdaExecutionRole);
    crawlersTable.grantReadWriteData(lambdaExecutionRole);
    crawlResultsTable.grantReadWriteData(lambdaExecutionRole);

    // Define Lambda layers
    const layerCode = lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py'));
    const toolCrawlerLayer = new lambda.LayerVersion(this, 'ToolCrawlerLayer', {
      code: layerCode,
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
      description: 'Tool Crawler Python dependencies',
    });

    // Environment variables for Lambda functions
    const lambdaEnv = {
      S3_BUCKET_NAME: sourceBucket.bucketName,
      S3_SOURCE_LIST_KEY: this.sourceListKey,
      DYNAMODB_SOURCES_TABLE: sourcesTable.tableName,
      DYNAMODB_CRAWLERS_TABLE: crawlersTable.tableName,
      DYNAMODB_CRAWL_RESULTS_TABLE: crawlResultsTable.tableName,
      LOG_LEVEL: 'INFO',
    };

    // Create Lambda functions for the workflow
    const sourceInitializerFunction = new lambda.Function(this, 'SourceInitializerFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions/lambda-package')),
      handler: 'source_initializer.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      layers: [lambdaLayer],
    });

    const sourcesFunction = new lambda.Function(this, 'SourcesFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions/lambda-package')),
      handler: 'sources.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      layers: [lambdaLayer],
    });

    const crawlerGeneratorFunction = new lambda.Function(this, 'CrawlerGeneratorFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 'crawler_generator.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.minutes(5),
      layers: [toolCrawlerLayer],
    });

    const saveCrawlerStrategyFunction = new lambda.Function(this, 'SaveCrawlerStrategyFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 'save_crawler_strategy.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      layers: [toolCrawlerLayer],
    });

    const runGeneratedCrawlerFunction = new lambda.Function(this, 'RunGeneratedCrawlerFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 'run_generated_crawler.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.minutes(5),
      layers: [toolCrawlerLayer],
    });

    const runKnownCrawlerFunction = new lambda.Function(this, 'RunKnownCrawlerFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 'run_known_crawler.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.minutes(5),
      layers: [toolCrawlerLayer],
    });

    const recordCrawlResultFunction = new lambda.Function(this, 'RecordCrawlResultFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 'record_crawl_result.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      layers: [toolCrawlerLayer],
    });

    const processCatalogFunction = new lambda.Function(this, 'ProcessCatalogFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 'process_catalog.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.minutes(5),
      layers: [toolCrawlerLayer],
    });

    const notificationFunction = new lambda.Function(this, 'NotificationFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 'notification.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      layers: [toolCrawlerLayer],
    });

    // S3 event handler will be in a separate stack

    // Create Step Function definition
    // Create Step Function state machine role
    const stateMachineRole = new iam.Role(this, 'StateMachineExecutionRole', {
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    });

    // Grant permissions to invoke Lambda functions
    sourceInitializerFunction.grantInvoke(stateMachineRole);
    sourcesFunction.grantInvoke(stateMachineRole);
    crawlerGeneratorFunction.grantInvoke(stateMachineRole);
    saveCrawlerStrategyFunction.grantInvoke(stateMachineRole);
    runGeneratedCrawlerFunction.grantInvoke(stateMachineRole);
    runKnownCrawlerFunction.grantInvoke(stateMachineRole);
    recordCrawlResultFunction.grantInvoke(stateMachineRole);
    processCatalogFunction.grantInvoke(stateMachineRole);
    notificationFunction.grantInvoke(stateMachineRole);
    
    // Define the individual steps using the CDK constructs
    const initializeSourcesTask = new tasks.LambdaInvoke(this, 'InitializeSources', {
      lambdaFunction: sourceInitializerFunction,
      comment: 'Initialize sources from S3 sources.yaml or from configuration',
      payloadResponseOnly: true,
    });
    
    const getSourcesToCrawlTask = new tasks.LambdaInvoke(this, 'GetSourcesToCrawl', {
      lambdaFunction: sourcesFunction,
      payloadResponseOnly: true,
    });
    
    const checkSourcesExistChoice = new sfn.Choice(this, 'CheckSourcesExist');
    const noSourcesToProcess = new sfn.Pass(this, 'NoSourcesToProcess', {
      result: sfn.Result.fromObject({
        status: 'success',
        message: 'No sources to crawl',
      }),
    });
    
    const mapSourcesToProcess = new sfn.Map(this, 'MapSourcesToProcess', {
      maxConcurrency: 5,
      itemsPath: '$.sources',
    });
    
    const checkCrawlerStrategy = new sfn.Choice(this, 'CheckCrawlerStrategy');
    
    const generateCrawlerStrategy = new tasks.LambdaInvoke(this, 'GenerateCrawlerStrategy', {
      lambdaFunction: crawlerGeneratorFunction,
      comment: 'This is where AI generates a crawler for unknown sources',
      payloadResponseOnly: true,
    });
    
    const saveCrawlerStrategy = new tasks.LambdaInvoke(this, 'SaveCrawlerStrategy', {
      lambdaFunction: saveCrawlerStrategyFunction,
      payloadResponseOnly: true,
    });
    
    const runGeneratedCrawler = new tasks.LambdaInvoke(this, 'RunGeneratedCrawler', {
      lambdaFunction: runGeneratedCrawlerFunction,
      payloadResponseOnly: true,
      retryOnServiceExceptions: true,
    });
    
    const runKnownCrawler = new tasks.LambdaInvoke(this, 'RunKnownCrawler', {
      lambdaFunction: runKnownCrawlerFunction,
      payloadResponseOnly: true,
      retryOnServiceExceptions: true,
    });
    
    const recordCrawlSuccess = new tasks.LambdaInvoke(this, 'RecordCrawlSuccess', {
      lambdaFunction: recordCrawlResultFunction,
      payloadResponseOnly: true,
    });
    
    const recordCrawlFailure = new tasks.LambdaInvoke(this, 'RecordCrawlFailure', {
      lambdaFunction: recordCrawlResultFunction,
      payloadResponseOnly: true,
    });
    
    const processCatalog = new tasks.LambdaInvoke(this, 'ProcessCatalog', {
      lambdaFunction: processCatalogFunction,
      payloadResponseOnly: true,
    });
    
    const notifyCrawlComplete = new tasks.LambdaInvoke(this, 'NotifyCrawlComplete', {
      lambdaFunction: notificationFunction,
      payloadResponseOnly: true,
    });
    
    // Build the workflow
    initializeSourcesTask.next(getSourcesToCrawlTask);
    
    getSourcesToCrawlTask.next(checkSourcesExistChoice);
    
    checkSourcesExistChoice
      .when(sfn.Condition.isPresent('$.sources'), mapSourcesToProcess)
      .otherwise(noSourcesToProcess);
      
    // Set up map state for processing sources
    const mapDefinition = checkCrawlerStrategy
      .when(sfn.Condition.booleanEquals('$.hasKnownCrawler', true), runKnownCrawler)
      .otherwise(generateCrawlerStrategy);
      
    generateCrawlerStrategy.next(saveCrawlerStrategy);
    saveCrawlerStrategy.next(runGeneratedCrawler);
    
    // Add retry and error handling for crawlers
    runGeneratedCrawler.addRetry({
      maxAttempts: 2,
      interval: cdk.Duration.seconds(2),
      backoffRate: 2,
    });
    
    runGeneratedCrawler.addCatch(recordCrawlFailure, {
      resultPath: '$.error',
    });
    
    runKnownCrawler.addRetry({
      maxAttempts: 2,
      interval: cdk.Duration.seconds(2),
      backoffRate: 2,
    });
    
    runKnownCrawler.addCatch(recordCrawlFailure, {
      resultPath: '$.error',
    });
    
    runGeneratedCrawler.next(recordCrawlSuccess);
    runKnownCrawler.next(recordCrawlSuccess);
    
    mapSourcesToProcess.iterator(mapDefinition);
    
    mapSourcesToProcess.next(processCatalog);
    processCatalog.next(notifyCrawlComplete);
    
    // Create the Step Function state machine
    this.stateMachine = new sfn.StateMachine(this, 'ToolCrawlerStateMachine', {
      definition: initializeSourcesTask,
      stateMachineType: sfn.StateMachineType.STANDARD,
      role: stateMachineRole,
    });

    // Export the state machine ARN for the event handler stack
    new cdk.CfnOutput(this, 'StateMachineArnExport', {
      value: this.stateMachine.stateMachineArn,
      exportName: 'McpToolCrawlerStateMachineArn',
    });

    // CloudFormation outputs
    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: this.stateMachine.stateMachineArn,
      description: 'Tool Crawler Step Function ARN',
    });

    new cdk.CfnOutput(this, 'SourcesTableName', {
      value: sourcesTable.tableName,
      description: 'DynamoDB table for sources',
    });
  }
}