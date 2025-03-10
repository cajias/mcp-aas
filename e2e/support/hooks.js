const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const config = require('../config/test-config');

// Local testing - No real Cognito user creation needed
BeforeAll(async function() {
  console.log('Using local mock environment for testing');
});

// Clean up after all tests
AfterAll(async function() {
  console.log('Test cleanup completed');
});

// Initialize browser and page before each scenario
Before(async function() {
  await this.init();
  
  // Make the test config available in the world
  this.config = config;
});

// Close browser after each scenario
After(async function() {
  await this.cleanup();
});