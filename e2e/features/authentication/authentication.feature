Feature: User Authentication
  As a user of the MCP-aaS platform
  I want to be able to register, login, and manage my account
  So that I can access and use MCP tools securely

  Background:
    Given I am on the homepage

  Scenario: User Registration
    When I navigate to the register page
    And I fill in the registration form with valid details
    And I submit the registration form
    Then I should see the verification form
    When I enter a valid verification code
    And I submit the verification form
    Then I should be redirected to the login page
    And I should see a success message

  Scenario: User Login
    When I navigate to the login page
    And I enter valid login credentials
    And I submit the login form
    Then I should be redirected to the dashboard
    And I should see my user information

  Scenario: Password Reset
    When I navigate to the login page
    And I click on the forgot password link
    Then I should see the forgot password form
    When I enter my username
    And I submit the forgot password form
    Then I should see the reset password form
    When I enter a valid verification code
    And I enter a new password
    And I confirm the new password
    And I submit the reset password form
    Then I should see a password reset success message

  Scenario: User Logout
    Given I am logged in
    When I click on the logout button
    Then I should be redirected to the homepage
    And I should not be authenticated