// Test configuration for E2E tests with local mock environment
module.exports = {
  // Base URLs
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:4000/api',
  
  // AWS Cognito configuration (mocked)
  cognito: {
    region: 'us-east-1',
    userPoolId: 'us-east-1_mockedUserPoolId',
    clientId: 'mockedClientId',
  },
  
  // Test user credentials
  testUser: {
    username: 'test_automation_user',
    email: 'test_automation@example.com',
    password: 'Test@12345',
    givenName: 'Test',
    familyName: 'Automation'
  },
  
  // Timeouts
  timeouts: {
    defaultWait: 5000,
    pageLoad: 10000,
    networkRequest: 8000
  }
};