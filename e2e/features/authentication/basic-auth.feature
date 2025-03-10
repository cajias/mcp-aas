Feature: Basic Authentication Test
  As a developer
  I want to verify the authentication flow works at a basic level
  So that I can debug timeout issues

  Scenario: Basic Navigation Test
    Given I am on the homepage
    Then the page title should contain "Langfuse"
    When I navigate to the login page
    Then I should see the login form