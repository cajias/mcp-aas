const AWS = require('aws-sdk');
const config = require('../config/test-config');

class CognitoUtils {
  constructor() {
    this.cognito = new AWS.CognitoIdentityServiceProvider({
      region: config.cognito.region
    });
  }

  /**
   * Find a user in Cognito by username
   */
  async findUser(username) {
    try {
      const params = {
        UserPoolId: config.cognito.userPoolId,
        Username: username
      };
      
      const user = await this.cognito.adminGetUser(params).promise();
      return user;
    } catch (error) {
      if (error.code === 'UserNotFoundException') {
        return null;
      }
      throw error;
    }
  }
  
  /**
   * Create a test user if it doesn't exist
   */
  async createTestUserIfNeeded() {
    const { username, email, password, givenName, familyName } = config.testUser;
    
    try {
      // Check if user already exists
      const existingUser = await this.findUser(username);
      
      if (existingUser) {
        console.log(`Test user ${username} already exists`);
        return existingUser;
      }
      
      // Create the user
      const createParams = {
        UserPoolId: config.cognito.userPoolId,
        Username: username,
        TemporaryPassword: password,
        MessageAction: 'SUPPRESS', // Don't send welcome email
        UserAttributes: [
          {
            Name: 'email',
            Value: email
          },
          {
            Name: 'email_verified',
            Value: 'true'
          },
          {
            Name: 'given_name',
            Value: givenName
          },
          {
            Name: 'family_name',
            Value: familyName
          }
        ]
      };
      
      await this.cognito.adminCreateUser(createParams).promise();
      console.log(`Created test user ${username}`);
      
      // Set permanent password (skip the force change password)
      const setPassParams = {
        UserPoolId: config.cognito.userPoolId,
        Username: username,
        Password: password,
        Permanent: true
      };
      
      await this.cognito.adminSetUserPassword(setPassParams).promise();
      console.log(`Set permanent password for test user ${username}`);
      
      return await this.findUser(username);
    } catch (error) {
      console.error('Error creating test user:', error);
      throw error;
    }
  }
  
  /**
   * Delete a user from Cognito
   */
  async deleteUser(username) {
    try {
      const params = {
        UserPoolId: config.cognito.userPoolId,
        Username: username
      };
      
      await this.cognito.adminDeleteUser(params).promise();
      console.log(`Deleted user ${username}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${username}:`, error);
      return false;
    }
  }
  
  /**
   * Get authentication tokens for a user for testing
   */
  async authenticateUser(username, password) {
    try {
      const params = {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        ClientId: config.cognito.clientId,
        UserPoolId: config.cognito.userPoolId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password
        }
      };
      
      const authResult = await this.cognito.adminInitiateAuth(params).promise();
      return authResult.AuthenticationResult;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }
}

module.exports = new CognitoUtils();