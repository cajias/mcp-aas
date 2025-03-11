import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

/**
 * A temporary solution to break circular dependencies
 */
export class McpDummyStack extends cdk.Stack {
  public readonly sourceBucket: s3.Bucket;
  
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Create S3 bucket for source lists and tool catalog
    this.sourceBucket = new s3.Bucket(this, 'McpToolCrawlerBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production
      autoDeleteObjects: true, // NOT recommended for production
    });
    
    // Output the bucket name
    new cdk.CfnOutput(this, 'SourceBucketName', {
      value: this.sourceBucket.bucketName,
      description: 'S3 Bucket for source lists and tool catalog',
    });
  }
}