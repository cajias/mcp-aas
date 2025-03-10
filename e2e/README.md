# End-to-End Testing for MCP-aaS

This directory contains end-to-end tests for the MCP-aaS platform using Cucumber.js and Playwright.

## Overview

The tests cover critical user flows:
- User registration
- Email verification
- User login
- Password reset
- User logout

## Test Status

These tests are currently **not passing** because:

1. They require the application to be running locally
2. The authentication system needs Cognito credentials
3. Some DOM elements in the tests don't match the current UI implementation

To make these tests pass, you need to:
1. Start the application (`npm start`)
2. Update the selectors in the step definitions to match your actual UI
3. Consider using mock authentication for local testing

## Test Structure

- `features/`: Contains Cucumber feature files written in Gherkin
  - `authentication/`: Authentication-related features
- `step_definitions/`: Contains step implementation files
- `support/`: Contains support files, hooks, and world setup

## Running Tests

### Prerequisites

- Node.js 18+
- MCP-aaS application running locally (both frontend and backend)

### Running Tests in Headless Mode

```bash
npm run test:e2e
```

### Running Tests with Browser UI

```bash
npm run test:e2e:ui
```

## Test Reports

After running the tests, a HTML report will be generated at the root of the project:
- `cucumber-report.html`: HTML report with test results

## Notes for Development

### Mocking External Services

In these tests, we mock interactions with AWS Cognito to avoid actual API calls during testing. In a real environment with staging resources, you could connect to actual AWS services.

### Adding New Tests

1. Create a new `.feature` file in the appropriate directory under `features/`
2. Implement step definitions in `.js` files under `step_definitions/`
3. If needed, add custom world extensions in `support/`

### Test Data

Test data is currently defined within the step definition files. For more extensive testing, consider moving test data to separate fixtures files.