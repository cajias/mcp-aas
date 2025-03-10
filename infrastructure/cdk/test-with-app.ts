import * as cdk from 'aws-cdk-lib';
import { CdkStack } from './lib/cdk-stack';
import { AuthStack } from './lib/auth-stack';

const app = new cdk.App();

// Define environment 
const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Create the authentication stack
new AuthStack(app, 'McpAasAuthStack', {
  env,
  description: 'Authentication resources for MCP-aaS',
});

// Create the main application stack
new CdkStack(app, 'McpAasStack', {
  env,
  description: 'Main stack for MCP-aaS',
});

console.log('Available stacks:', app.node.children.map((child: any) => child.node.id));