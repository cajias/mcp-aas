# MCP-aaS Infrastructure

This directory contains the AWS CDK infrastructure code for the MCP-aaS platform. It defines all the AWS resources required to run the application, including authentication with AWS Cognito.

## Architecture

The infrastructure is separated into multiple stacks:

- **Auth Stack**: AWS Cognito User Pool, Identity Pool, and related resources for authentication
- **Main Stack**: Core application infrastructure resources

## Authentication Setup

The authentication infrastructure uses:

- **AWS Cognito User Pool**: For user registration, authentication, and account management
- **AWS Cognito Identity Pool**: To provide AWS credentials for authenticated users
- **OAuth 2.0 / OpenID Connect**: For standard authentication flows

## Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed globally (`npm install -g aws-cdk`)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Deploy to AWS:
```bash
npx cdk deploy McpAasAuthStack
# or to deploy all stacks:
npx cdk deploy --all
```

4. To get the Cognito configuration for your frontend:
```bash
aws cloudformation describe-stacks --stack-name McpAasAuthStack --query 'Stacks[0].Outputs'
```

## Useful Commands

* `npm run build`   compile TypeScript to JS
* `npm run watch`   watch for changes and compile
* `npm run test`    run the Jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
* `npx cdk destroy` destroy the stack from AWS
