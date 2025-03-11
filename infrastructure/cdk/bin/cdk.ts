#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { AuthStack } from '../lib/auth-stack';
import { ToolCrawlerStack } from '../lib/tool-crawler-stack';

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

// Create the tool crawler stack
new ToolCrawlerStack(app, 'McpToolCrawlerStack', {
  env,
  description: 'MCP Tool Crawler with S3-triggered Step Function',
});

// Synthesize the app into CloudFormation templates
app.synth();