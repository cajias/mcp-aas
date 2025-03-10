import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // Empty stack
  }
}

const app = new cdk.App();
new MyStack(app, 'MinimalTestStack');
app.synth();