#!/usr/bin/env node

/**
 * This script fetches the Cognito configuration from AWS CloudFormation
 * and updates the E2E test configuration file
 * 
 * Usage:
 * node scripts/update-e2e-config.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const STACK_NAME = 'McpAasAuthStack';
const CONFIG_PATH = path.join(__dirname, '..', 'e2e', 'config', 'test-config.js');

// Function to execute AWS CLI commands
function executeAwsCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

async function updateConfig() {
  try {
    console.log('Fetching Cognito configuration from CloudFormation...');
    
    // Get the CloudFormation outputs
    const cfnOutputs = await executeAwsCommand(
      `aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query 'Stacks[0].Outputs'`
    );
    
    const outputs = JSON.parse(cfnOutputs);
    
    // Extract the Cognito details
    const userPoolId = outputs.find(o => o.OutputKey === 'UserPoolId')?.OutputValue;
    const userPoolClientId = outputs.find(o => o.OutputKey === 'UserPoolClientId')?.OutputValue;
    const identityPoolId = outputs.find(o => o.OutputKey === 'IdentityPoolId')?.OutputValue;
    
    if (!userPoolId || !userPoolClientId || !identityPoolId) {
      throw new Error('Could not find all required Cognito outputs in CloudFormation stack');
    }
    
    console.log('Retrieved Cognito configuration:');
    console.log(`- User Pool ID: ${userPoolId}`);
    console.log(`- Client ID: ${userPoolClientId}`);
    console.log(`- Identity Pool ID: ${identityPoolId}`);
    
    // Read the current config file
    const configFile = fs.readFileSync(CONFIG_PATH, 'utf8');
    
    // Update the configuration
    const updatedConfig = configFile
      .replace(/userPoolId: ['"].*?['"]/, `userPoolId: '${userPoolId}'`)
      .replace(/clientId: ['"].*?['"]/, `clientId: '${userPoolClientId}'`);
    
    // Write the updated config back to file
    fs.writeFileSync(CONFIG_PATH, updatedConfig);
    
    console.log(`Updated E2E test configuration at ${CONFIG_PATH}`);
  } catch (error) {
    console.error('Failed to update E2E configuration:', error);
    process.exit(1);
  }
}

// Run the script
updateConfig();