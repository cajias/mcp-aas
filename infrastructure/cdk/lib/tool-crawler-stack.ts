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

export class ToolCrawlerStack extends cdk.Stack {
  public readonly sourceBucket: s3.Bucket;
  public readonly sourceListKey: string = 'sources.yaml';
  public readonly toolCatalogKey: string = 'tools.json';
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    // Create S3 bucket for source lists and tool catalog
    this.sourceBucket = new s3.Bucket(this, 'McpToolCrawlerBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
      autoDeleteObjects: true, // NOT recommended for production
    });

    // Create Lambda execution role
    const lambdaExecutionRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant Lambda access to S3 and DynamoDB
    this.sourceBucket.grantReadWrite(lambdaExecutionRole);
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
      S3_BUCKET_NAME: this.sourceBucket.bucketName,
      S3_SOURCE_LIST_KEY: this.sourceListKey,
      DYNAMODB_SOURCES_TABLE: sourcesTable.tableName,
      DYNAMODB_CRAWLERS_TABLE: crawlersTable.tableName,
      DYNAMODB_CRAWL_RESULTS_TABLE: crawlResultsTable.tableName,
      LOG_LEVEL: 'INFO',
    };

    // Create Lambda functions for the workflow
    const sourceInitializerFunction = new lambda.Function(this, 'SourceInitializerFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 'source_initializer.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      layers: [toolCrawlerLayer],
    });

    const sourcesFunction = new lambda.Function(this, 'SourcesFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 'sources.handler',
      environment: lambdaEnv,
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
      layers: [toolCrawlerLayer],
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

    // Create the S3 event source for triggering the Step Function
    const s3EventHandler = new lambda.Function(this, 'S3EventHandler', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 's3_event_handler.handler',
      environment: {
        ...lambdaEnv,
        STATE_MACHINE_ARN: 'TO_BE_UPDATED',  // Will be updated after Step Function creation
      },
      role: lambdaExecutionRole,
      timeout: cdk.Duration.seconds(30),
    });

    // Add S3 event source to the Lambda function
    s3EventHandler.addEventSource(new eventsources.S3EventSource(this.sourceBucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{ prefix: this.sourceListKey }],
    }));

    // Create Step Function definition from JSON
    // Read the Step Function definition from the JSON file
    const stepFunctionJsonPath = path.join(__dirname, '../../../mcp-tool-crawler-py/infrastructure/step-functions/mcp-tool-crawler.json');
    const stepFunctionDefinition = JSON.parse(fs.readFileSync(stepFunctionJsonPath, 'utf8'));

    // Replace placeholders in the definition with actual ARNs
    const definitionString = JSON.stringify(stepFunctionDefinition)
      .replace('${SourceInitializerFunction}', sourceInitializerFunction.functionArn)
      .replace('${SourcesFunction}', sourcesFunction.functionArn)
      .replace('${CrawlerGeneratorFunction}', crawlerGeneratorFunction.functionArn)
      .replace('${SaveCrawlerStrategyFunction}', saveCrawlerStrategyFunction.functionArn)
      .replace('${RunGeneratedCrawlerFunction}', runGeneratedCrawlerFunction.functionArn)
      .replace('${RunKnownCrawlerFunction}', runKnownCrawlerFunction.functionArn)
      .replace('${RecordCrawlResultFunction}', recordCrawlResultFunction.functionArn)
      .replace('${ProcessCatalogFunction}', processCatalogFunction.functionArn)
      .replace('${NotificationFunction}', notificationFunction.functionArn);

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

    // Create the Step Function state machine
    this.stateMachine = new sfn.StateMachine(this, 'ToolCrawlerStateMachine', {
      definitionString,
      stateMachineType: sfn.StateMachineType.STANDARD,
      role: stateMachineRole,
    });

    // Update the S3 event handler to know about the state machine ARN
    s3EventHandler.addEnvironment('STATE_MACHINE_ARN', this.stateMachine.stateMachineArn);

    // Grant permission to the S3 event handler to start the step function execution
    this.stateMachine.grantStartExecution(s3EventHandler);

    // CloudFormation outputs
    new cdk.CfnOutput(this, 'SourceBucketName', {
      value: this.sourceBucket.bucketName,
      description: 'S3 Bucket for source lists and tool catalog',
    });

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