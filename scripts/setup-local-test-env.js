#!/usr/bin/env node

/**
 * This script sets up a local testing environment
 * by creating a mock configuration for Cognito
 * and creating test users for automated tests.
 * 
 * Usage:
 * node scripts/setup-local-test-env.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_PATH = path.join(__dirname, '..', 'e2e', 'config', 'test-config.js');
const ENV_FRONTEND_PATH = path.join(__dirname, '..', 'frontend', '.env');
const ENV_BACKEND_PATH = path.join(__dirname, '..', 'backend', '.env');

// Test user credentials
const TEST_USER = {
  username: 'test_automation_user',
  email: 'test_automation@example.com',
  password: 'Test@12345', 
  givenName: 'Test',
  familyName: 'Automation'
};

// Mock Cognito configuration
const MOCK_COGNITO = {
  region: 'us-east-1',
  userPoolId: 'us-east-1_mockedUserPoolId',
  clientId: 'mockedClientId',
  identityPoolId: 'us-east-1:mocked-identity-pool-id'
};

function setupE2ETestConfig() {
  console.log('Setting up E2E test configuration...');
  
  const template = `// Test configuration for E2E tests with local mock environment
module.exports = {
  // Base URLs
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:4000/api',
  
  // AWS Cognito configuration (mocked)
  cognito: {
    region: '${MOCK_COGNITO.region}',
    userPoolId: '${MOCK_COGNITO.userPoolId}',
    clientId: '${MOCK_COGNITO.clientId}',
  },
  
  // Test user credentials
  testUser: {
    username: '${TEST_USER.username}',
    email: '${TEST_USER.email}',
    password: '${TEST_USER.password}',
    givenName: '${TEST_USER.givenName}',
    familyName: '${TEST_USER.familyName}'
  },
  
  // Timeouts
  timeouts: {
    defaultWait: 5000,
    pageLoad: 10000,
    networkRequest: 8000
  }
};`;

  // Create directory if it doesn't exist
  const configDir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Write config file
  fs.writeFileSync(CONFIG_PATH, template);
  console.log(`Created E2E test configuration at ${CONFIG_PATH}`);
}

function setupFrontendEnv() {
  console.log('Setting up frontend environment...');
  
  const template = `REACT_APP_COGNITO_REGION=${MOCK_COGNITO.region}
REACT_APP_COGNITO_USER_POOL_ID=${MOCK_COGNITO.userPoolId}
REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID=${MOCK_COGNITO.clientId}
REACT_APP_COGNITO_IDENTITY_POOL_ID=${MOCK_COGNITO.identityPoolId}
REACT_APP_API_BASE_URL=http://localhost:4000/api
REACT_APP_WEBSOCKET_URL=ws://localhost:4000
`;

  fs.writeFileSync(ENV_FRONTEND_PATH, template);
  console.log(`Created frontend environment at ${ENV_FRONTEND_PATH}`);
}

function setupBackendEnv() {
  console.log('Setting up backend environment...');
  
  const template = `PORT=4000
AWS_REGION=${MOCK_COGNITO.region}
COGNITO_USER_POOL_ID=${MOCK_COGNITO.userPoolId}
COGNITO_CLIENT_ID=${MOCK_COGNITO.clientId}
`;

  fs.writeFileSync(ENV_BACKEND_PATH, template);
  console.log(`Created backend environment at ${ENV_BACKEND_PATH}`);
}

function createDirectories() {
  // Create scripts directory
  const scriptsDir = path.dirname(__filename);
  const e2eDir = path.join(__dirname, '..', 'e2e');
  const dirsToCreate = [
    path.join(e2eDir, 'config'), 
    path.join(e2eDir, 'features'), 
    path.join(e2eDir, 'step_definitions'),
    path.join(e2eDir, 'support'),
    path.join(e2eDir, 'utils')
  ];
  
  dirsToCreate.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

function run() {
  try {
    createDirectories();
    setupE2ETestConfig();
    setupFrontendEnv();
    setupBackendEnv();
    
    console.log('\nLocal test environment setup complete!');
    console.log('\nNext steps:');
    console.log('1. Start the application: npm start');
    console.log('2. Run the E2E tests: npm run test:e2e');
    console.log('or');
    console.log('Run both with: npm run test:e2e:with-app');
  } catch (error) {
    console.error('Error setting up local test environment:', error);
    process.exit(1);
  }
}

// Run the script
run();