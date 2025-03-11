import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as path from 'path';

export class EventHandlerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import S3 bucket from the dummy stack
    const sourceBucket = s3.Bucket.fromBucketName(
      this, 
      'ImportedSourceBucket', 
      'mcpdummystack-mcptoolcrawlerbucket79188e62-n40jilnp0est'
    );
    
    // Get the ARN from parameter store or SSM
    const stateMachineArn = cdk.Fn.importValue('McpToolCrawlerStateMachineArn');
    
    // Create Lambda execution role for the S3 event handler
    const lambdaRole = new iam.Role(this, 'S3EventHandlerRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });
    
    // Grant permission to invoke the step function
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['states:StartExecution'],
      resources: [stateMachineArn],
    }));
    
    // Environment variables
    const lambdaEnv = {
      STATE_MACHINE_ARN: stateMachineArn,
      S3_SOURCE_LIST_KEY: 'sources.yaml',
    };
    
    // Create the S3 event handler Lambda
    const s3EventHandler = new lambda.Function(this, 'S3EventHandler', {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions')),
      handler: 's3_event_handler.handler',
      environment: lambdaEnv,
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
    });
    
    // Add S3 event notification
    sourceBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(s3EventHandler),
      { prefix: 'sources.yaml' }
    );
  }
}