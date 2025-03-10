const { setWorldConstructor } = require('@cucumber/cucumber');
const playwright = require('playwright');
const config = require('../config/test-config');

class CustomWorld {
  constructor() {
    // Initialize properties to store browser, context, and page
    this.browser = null;
    this.context = null;
    this.page = null;
    
    // Store the config
    this.config = config;
  }

  // Method to initialize browser before each scenario
  async init() {
    try {
      // Increase timeout for browser launch
      this.browser = await playwright.chromium.launch({
        headless: process.env.HEADLESS !== 'false', // Run in headless mode unless specified otherwise
        slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
        timeout: 30000, // 30 seconds timeout for browser launch
      });
      
      this.context = await this.browser.newContext({
        // Add viewport size
        viewport: { width: 1280, height: 720 },
        // Add timeout for navigations
        navigationTimeout: 30000, // Longer timeout
      });
      
      // Create a new page with timeout settings
      this.page = await this.context.newPage();
      
      // Set default timeout for Playwright actions
      this.page.setDefaultTimeout(30000); // 30 seconds timeout
      
      console.log('Browser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  // Method to cleanup browser after each scenario
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
  
  // Helper to go to the base URL
  async goToBaseUrl() {
    await this.page.goto(this.config.baseUrl);
  }
  
  // Helper to go to a specific path
  async goToPath(path) {
    await this.page.goto(`${this.config.baseUrl}${path}`);
  }
}

setWorldConstructor(CustomWorld);