# End-to-End Testing for MCP-aaS

This guide explains how to run end-to-end tests for the MCP-aaS platform. There are two primary ways to run the tests:

1. With real AWS Cognito integration
2. With a local mock environment

## Prerequisites

1. Node.js 18+ installed
2. The project dependencies installed (`npm install`)
3. For real AWS integration: 
   - AWS CLI configured with appropriate permissions
   - AWS CDK deployed with the Cognito stack

## Setting Up Test Configuration

### Option 1: Local Mock Environment (No AWS Required)

This option sets up a local test environment with mock Cognito configuration:

```bash
# This will create all configuration files for local testing
npm run test:e2e:setup-local
```

This script will:
1. Create the necessary directory structure
2. Create a mock Cognito configuration
3. Set up environment files for the frontend and backend
4. Configure everything for local testing

### Option 2: Real AWS Integration

If you want to run tests against real AWS Cognito, update the test configuration with your actual Cognito details:

```bash
# This will fetch Cognito details from the deployed CloudFormation stack
npm run test:e2e:update-config
```

This script will:
1. Query AWS CloudFormation for the Cognito User Pool ID, Client ID, and Identity Pool ID
2. Update the E2E test configuration file at `e2e/config/test-config.js`

## Running the Tests

### Option 1: Running Tests with Automated App Launch

This option will start the application locally and then run the tests:

```bash
npm run test:e2e:with-app
```

This command:
1. Starts the frontend and backend servers
2. Waits for the application to be available at http://localhost:3000
3. Runs the Cucumber E2E tests

### Option 2: Running Tests Against Already Running App

If you already have the application running:

```bash
# Run headless tests (for CI environments)
npm run test:e2e

# Run tests with browser UI visible (for debugging)
npm run test:e2e:ui
```

## Test Coverage

The E2E tests cover the following authentication flows:

1. **User Registration**
   - Form submission
   - Email verification
   - Success redirection

2. **User Login**
   - Credential validation
   - Session creation
   - Redirection to dashboard

3. **Password Reset**
   - Request flow
   - Code verification
   - New password entry

4. **User Logout**
   - Session termination
   - Redirection to homepage

## Modifying the Tests

The tests are written using Cucumber.js and Playwright. The main components are:

- **Feature files**: `e2e/features/authentication/*.feature`
- **Step definitions**: `e2e/step_definitions/*.js`
- **Support code**: `e2e/support/*.js`
- **Configuration**: `e2e/config/test-config.js`

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify AWS credentials have correct permissions
   - Check Cognito configuration in `e2e/config/test-config.js`
   - Ensure the test user exists in Cognito

2. **Test Failures**
   - Check browser console for errors
   - Verify UI selectors match your actual implementation
   - Run tests with UI visible to debug (`npm run test:e2e:ui`)

3. **Timeout Issues**
   - Increase timeout settings in `e2e/config/test-config.js`
   - Check network connectivity and response times

## CI/CD Integration

For CI/CD pipelines, you should:

1. Set up AWS credentials as environment variables
2. Update test configuration using the script
3. Run tests in headless mode
4. Capture and publish test reports

Example GitHub Actions workflow:

```yaml
steps:
  - uses: actions/checkout@v3
  - name: Use Node.js
    uses: actions/setup-node@v3
    with:
      node-version: 18
  - name: Install dependencies
    run: npm ci
  - name: Update E2E test configuration
    run: npm run test:e2e:update-config
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      AWS_REGION: us-east-1
  - name: Run E2E tests
    run: npm run test:e2e
  - name: Upload test report
    uses: actions/upload-artifact@v3
    with:
      name: cucumber-report
      path: cucumber-report.html
```