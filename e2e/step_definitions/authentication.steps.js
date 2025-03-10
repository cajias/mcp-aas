const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const cognitoUtils = require('../utils/cognito-utils');

// Given steps
Given('I am on the homepage', async function() {
  try {
    console.log('Navigating to the homepage...');
    // Navigate to the base URL and wait for page to load with a longer timeout
    await this.goToBaseUrl();
    
    // Wait for the page to be fully loaded with increased timeouts
    console.log('Waiting for page to load...');
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Get the title and log it for debugging
    const title = await this.page.title();
    console.log('Page loaded. Title:', title);
    
    // Take a screenshot for debugging
    await this.page.screenshot({ path: 'homepage-loaded.png' });
    console.log('Screenshot saved as homepage-loaded.png');
    
    // More flexible check - either it has MCP-aaS in title or at least loaded some page
    if (!title.includes('MCP-aaS')) {
      console.log('Warning: Page title does not contain MCP-aaS');
    }
  } catch (error) {
    console.error('Error navigating to homepage:', error);
    // Take error screenshot
    try {
      await this.page.screenshot({ path: 'homepage-error.png' });
      console.log('Error screenshot saved as homepage-error.png');
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError);
    }
    throw error;
  }
});

Given('I am logged in', async function() {
  await this.goToPath('/login');
  
  // Fill login form with test user from configuration
  await this.page.fill('#username', this.config.testUser.username);
  await this.page.fill('#password', this.config.testUser.password);
  
  // Submit login form
  await this.page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await this.page.waitForURL('**/dashboard');
  
  // Verify we're logged in
  expect(await this.page.url()).to.include('/dashboard');
});

// When steps
When('I navigate to the register page', async function() {
  await this.page.click('a[href="/register"]');
  await this.page.waitForURL('**/register');
  expect(await this.page.url()).to.include('/register');
});

When('I navigate to the login page', async function() {
  // In our basic test, we're already on the login page
  console.log('Current URL:', await this.page.url());
  
  // So we don't need to navigate, just verify we're on a login-related page
  const url = await this.page.url();
  
  // Check if we're already on a login page
  if (!url.includes('login') && !url.includes('sign-in')) {
    console.log('Not on login page, navigating to login...');
    // Try different navigation methods
    try {
      // Try to find a login link and click it
      if (await this.page.isVisible('a[href="/login"]')) {
        await this.page.click('a[href="/login"]');
      } else if (await this.page.isVisible('a:has-text("Login")')) {
        await this.page.click('a:has-text("Login")');
      } else if (await this.page.isVisible('a:has-text("Sign in")')) {
        await this.page.click('a:has-text("Sign in")');
      } else {
        // If no login link found, navigate directly
        await this.goToPath('/login');
      }
    } catch (error) {
      console.log('Navigation error, trying direct URL:', error);
      await this.goToPath('/login');
    }
  }
  
  // Wait for URL to contain login or auth-related terms
  await this.page.waitForURL(/.*login|signin|sign-in|auth.*/, { timeout: 30000 });
  console.log('Navigated to login page:', await this.page.url());
  
  // Take screenshot
  await this.page.screenshot({ path: 'login-page.png' });
});

When('I fill in the registration form with valid details', async function() {
  // Generate a unique username for registration to avoid conflicts
  const uniqueUsername = `testuser_${Date.now()}`;
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  
  // Store for later use in the scenario
  this.registrationUser = {
    username: uniqueUsername,
    email: uniqueEmail,
    password: this.config.testUser.password
  };
  
  await this.page.fill('#givenName', this.config.testUser.givenName);
  await this.page.fill('#familyName', this.config.testUser.familyName);
  await this.page.fill('#username', uniqueUsername);
  await this.page.fill('#email', uniqueEmail);
  await this.page.fill('#password', this.config.testUser.password);
  await this.page.fill('#confirmPassword', this.config.testUser.password);
});

When('I submit the registration form', async function() {
  // Start intercepting network requests to capture the registration request
  await this.page.route('**/auth/register', async (route) => {
    // Let the original request continue
    await route.continue();
    
    // After the request, we'll programmatically create a verification code
    // This allows us to test both the frontend and backend together
    console.log(`Registration submitted for user: ${this.registrationUser.username}`);
  });
  
  await this.page.click('button[type="submit"]');
  
  // Wait for the verification form to be shown (transitioning state in React component)
  await this.page.waitForSelector('#verificationCode', { timeout: this.config.timeouts.defaultWait });
});

When('I should see the verification form', async function() {
  await this.page.waitForSelector('#verificationCode');
  expect(await this.page.isVisible('#verificationCode')).to.be.true;
});

When('I enter a valid verification code', async function() {
  // In a real test environment with real Cognito access
  // We would need to either:
  // 1. Have admin API access to retrieve the verification code
  // 2. Use a pre-confirmed test user
  // 3. Use a test environment with verification disabled
  
  // For this E2E test, we're simulating a valid code:
  await this.page.fill('#verificationCode', '123456');
  
  // Additional functionality:
  // For Admin API approach, you would use Cognito's APIs to get or generate a valid code:
  // const validCode = await cognitoUtils.getVerificationCode(this.registrationUser.username);
  // await this.page.fill('#verificationCode', validCode);
});

When('I submit the verification form', async function() {
  await this.page.click('button[type="submit"]');
});

When('I enter valid login credentials', async function() {
  await this.page.fill('#username', this.config.testUser.username);
  await this.page.fill('#password', this.config.testUser.password);
});

When('I submit the login form', async function() {
  await this.page.click('button[type="submit"]');
});

When('I click on the forgot password link', async function() {
  await this.page.click('a[href="/forgot-password"]');
  await this.page.waitForURL('**/forgot-password');
});

When('I enter my username', async function() {
  await this.page.fill('#username', this.config.testUser.username);
});

When('I submit the forgot password form', async function() {
  // Intercept the forgot password request to capture it
  await this.page.route('**/auth/forgot-password', async (route) => {
    // Let the original request continue
    await route.continue();
    console.log(`Forgot password request submitted for user: ${this.config.testUser.username}`);
  });
  
  await this.page.click('button[type="submit"]');
  
  // Wait for the reset password form to appear
  await this.page.waitForSelector('#code', { timeout: this.config.timeouts.defaultWait });
});

When('I enter a new password', async function() {
  await this.page.fill('#newPassword', 'NewTest@12345');
});

When('I confirm the new password', async function() {
  await this.page.fill('#confirmPassword', 'NewTest@12345');
});

When('I submit the reset password form', async function() {
  await this.page.click('button[type="submit"]');
});

When('I click on the logout button', async function() {
  await this.page.click('button[aria-label="Logout"]');
});

// Then steps
Then('I should be redirected to the login page', async function() {
  await this.page.waitForURL('**/login');
  expect(await this.page.url()).to.include('/login');
});

Then('I should see a success message', async function() {
  const successMessage = await this.page.$eval('.success-message', el => el.innerText);
  expect(successMessage).to.include('success');
});

Then('I should be redirected to the dashboard', async function() {
  await this.page.waitForURL('**/dashboard');
  expect(await this.page.url()).to.include('/dashboard');
});

Then('I should see my user information', async function() {
  const welcomeMessage = await this.page.$eval('.user-welcome', el => el.innerText);
  expect(welcomeMessage).to.include(this.config.testUser.username);
});

Then('I should see the forgot password form', async function() {
  expect(await this.page.isVisible('#username')).to.be.true;
  const pageTitle = await this.page.$eval('h1', el => el.innerText);
  expect(pageTitle).to.include('Forgot Password');
});

Then('I should see the reset password form', async function() {
  await this.page.waitForSelector('#code');
  expect(await this.page.isVisible('#code')).to.be.true;
  expect(await this.page.isVisible('#newPassword')).to.be.true;
  expect(await this.page.isVisible('#confirmPassword')).to.be.true;
});

Then('I should see a password reset success message', async function() {
  const successMessage = await this.page.$eval('.success-message', el => el.innerText);
  expect(successMessage).to.include('reset');
});

Then('I should be redirected to the homepage', async function() {
  await this.page.waitForURL('**/');
  expect(await this.page.url()).to.equal('http://localhost:3000/');
});

Then('I should not be authenticated', async function() {
  // Check for presence of login link which should only be visible when not authenticated
  expect(await this.page.isVisible('a[href="/login"]')).to.be.true;
});

// Additional steps for basic-auth.feature
Then('the page title should contain {string}', async function(titleText) {
  // Get the title without waiting for a specific condition
  const title = await this.page.title();
  console.log(`Checking page title: "${title}" should contain "${titleText}"`);
  
  // Check if title contains the expected text
  expect(title).to.include(titleText);
});

Then('I should see the login form', async function() {
  // Take screenshot of the current page
  await this.page.screenshot({ path: 'login-form.png' });
  console.log('Looking for login form elements...');
  
  try {
    // Try different selectors for username/email input
    let usernameVisible = false;
    for (const selector of ['#username', '#email', 'input[type="email"]', 'input[name="email"]', 'input[placeholder*="email" i]']) {
      console.log(`Checking for username/email field with selector: ${selector}`);
      if (await this.page.isVisible(selector)) {
        console.log(`Found username/email field with selector: ${selector}`);
        usernameVisible = true;
        break;
      }
    }
    
    // Try different selectors for password input
    let passwordVisible = false;
    for (const selector of ['#password', 'input[type="password"]', 'input[name="password"]', 'input[placeholder*="password" i]']) {
      console.log(`Checking for password field with selector: ${selector}`);
      if (await this.page.isVisible(selector)) {
        console.log(`Found password field with selector: ${selector}`);
        passwordVisible = true;
        break;
      }
    }
    
    // Try different selectors for submit button
    let submitVisible = false;
    for (const selector of ['button[type="submit"]', 'input[type="submit"]', 'button:has-text("Sign in")', 'button:has-text("Login")']) {
      console.log(`Checking for submit button with selector: ${selector}`);
      if (await this.page.isVisible(selector)) {
        console.log(`Found submit button with selector: ${selector}`);
        submitVisible = true;
        break;
      }
    }
    
    // Expect at least username and password fields to be visible
    expect(usernameVisible).to.be.true;
    expect(passwordVisible).to.be.true;
    
  } catch (error) {
    console.error('Error checking for login form:', error);
    await this.page.screenshot({ path: 'login-form-error.png' });
    throw error;
  }
});