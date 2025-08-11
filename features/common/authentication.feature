Feature: User Authentication
  As a user
  I want to securely authenticate to the platform
  So that I can access my characters and campaigns

  Background:
    Given the authentication service is available
    And the database is accessible

  Scenario: Successful user registration with email
    Given I am on the registration page
    When I enter "player@example.com" as my email
    And I enter "SecurePass123!" as my password
    And I confirm my password as "SecurePass123!"
    And I accept the terms of service
    And I click the register button
    Then I should receive a verification email
    And my account should be created with "FREE" tier
    And I should be redirected to the email verification page

  Scenario: Successful login with email and password
    Given I have a verified account with email "player@example.com"
    And I am on the login page
    When I enter "player@example.com" as my email
    And I enter my correct password
    And I click the login button
    Then I should be authenticated successfully
    And I should see my dashboard
    And my session should be valid for 24 hours

  Scenario: Login with invalid credentials
    Given I am on the login page
    When I enter "player@example.com" as my email
    And I enter an incorrect password
    And I click the login button
    Then I should see an error message "Invalid email or password"
    And I should remain on the login page
    And the login attempt should be logged

  Scenario: Password reset request
    Given I have an account with email "player@example.com"
    And I am on the login page
    When I click "Forgot Password?"
    And I enter "player@example.com" as my email
    And I click "Send Reset Link"
    Then I should receive a password reset email
    And the reset link should be valid for 1 hour
    And I should see a confirmation message

  Scenario: Social login with Google
    Given I am on the login page
    When I click "Sign in with Google"
    And I authorize the application in Google
    Then I should be authenticated successfully
    And my account should be created if it doesn't exist
    And I should see my dashboard

  Scenario: Multi-factor authentication setup
    Given I am logged in as "player@example.com"
    And I am on the security settings page
    When I click "Enable Two-Factor Authentication"
    And I scan the QR code with my authenticator app
    And I enter the verification code
    And I click "Confirm"
    Then MFA should be enabled for my account
    And I should receive backup codes
    And future logins should require MFA

  Scenario: Session timeout
    Given I am logged in as "player@example.com"
    And my session has been inactive for 24 hours
    When I try to access a protected resource
    Then I should be redirected to the login page
    And I should see a message "Your session has expired"
    And I should need to authenticate again

  Scenario: Account deletion
    Given I am logged in as "player@example.com"
    And I am on the account settings page
    When I click "Delete Account"
    And I confirm by typing "DELETE"
    And I enter my password
    And I click "Permanently Delete Account"
    Then I should receive a confirmation email
    And my account should be marked for deletion
    And my data should be exported and sent to my email
    And my account should be deleted after 30 days