#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { AuthStack } from '../lib/auth-stack';
import { ToolCrawlerStack } from '../lib/tool-crawler-stack';
import { McpDummyStack } from '../lib/dummy-stack';
import { EventHandlerStack } from '../lib/event-handler-stack';
import { PackageLayerStack } from '../lib/package-layer-stack';

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

// Create the S3 bucket stack
const dummyStack = new McpDummyStack(app, 'McpDummyStack', {
  env,
  description: 'S3 bucket for MCP Tool Crawler',
});

// Create the tool crawler stack
const toolCrawlerStack = new ToolCrawlerStack(app, 'McpToolCrawlerStack', {
  env,
  description: 'MCP Tool Crawler with S3-triggered Step Function',
});

// Create the Lambda layer stack
const packageLayerStack = new PackageLayerStack(app, 'McpPackageLayerStack', {
  env,
  description: 'Lambda layers for MCP Tool Crawler',
});

// Create the event handler stack - must be deployed after the tool crawler stack
const eventHandlerStack = new EventHandlerStack(app, 'McpEventHandlerStack', {
  env,
  description: 'Event handlers for MCP Tool Crawler',
});

// Add dependencies to ensure correct deployment order
eventHandlerStack.addDependency(toolCrawlerStack);
toolCrawlerStack.addDependency(packageLayerStack);

// Synthesize the app into CloudFormation templates
app.synth();