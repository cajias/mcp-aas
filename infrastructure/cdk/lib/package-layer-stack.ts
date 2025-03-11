import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class PackageLayerStack extends cdk.Stack {
  public readonly lambdaLayer: lambda.LayerVersion;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Lambda Layer for dependencies
    this.lambdaLayer = new lambda.LayerVersion(this, 'ToolCrawlerDepsLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../mcp-tool-crawler-py/src/lambda_functions/lambda-package'), {
        bundling: {
          image: cdk.DockerImage.fromRegistry('public.ecr.aws/sam/build-python3.9:latest'),
          command: [
            'bash', '-c', [
              'pip install -r requirements.txt -t /asset-output/python',
              'cp *.py /asset-output/',
            ].join(' && '),
          ],
        },
      }),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
      description: 'Tool Crawler Python dependencies',
    });

    // Output layer ARN
    new cdk.CfnOutput(this, 'LambdaLayerArn', {
      value: this.lambdaLayer.layerVersionArn,
      description: 'ARN of the Lambda Layer with Python dependencies',
      exportName: 'ToolCrawlerDepsLayerArn',
    });
  }
}