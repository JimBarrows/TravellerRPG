Feature: User Registration
  As a new user
  I want to register for an account
  So that I can access the Traveller RPG platform

  Background:
    Given the authentication system is available
    And I am on the registration page

  Scenario: Successful registration with email
    When I enter "john.doe@example.com" as my email
    And I enter "SecurePass123!" as my password
    And I confirm "SecurePass123!" as my password confirmation
    And I enter "John Doe" as my display name
    And I accept the terms and conditions
    And I submit the registration form
    Then I should see a verification email sent message
    And a verification email should be sent to "john.doe@example.com"
    And my account should be created with status "unverified"

  Scenario: Email verification
    Given I have registered with email "john.doe@example.com"
    And I received a verification email with code "123456"
    When I enter the verification code "123456"
    And I submit the verification form
    Then my account status should change to "verified"
    And I should be automatically logged in
    And I should be redirected to the dashboard

  Scenario: Registration with weak password
    When I enter "john.doe@example.com" as my email
    And I enter "weak" as my password
    And I confirm "weak" as my password confirmation
    And I submit the registration form
    Then I should see an error "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
    And my account should not be created

  Scenario: Registration with mismatched passwords
    When I enter "john.doe@example.com" as my email
    And I enter "SecurePass123!" as my password
    And I confirm "DifferentPass123!" as my password confirmation
    And I submit the registration form
    Then I should see an error "Passwords do not match"
    And my account should not be created

  Scenario: Registration with existing email
    Given a user already exists with email "existing@example.com"
    When I enter "existing@example.com" as my email
    And I enter "SecurePass123!" as my password
    And I confirm "SecurePass123!" as my password confirmation
    And I submit the registration form
    Then I should see an error "An account with this email already exists"
    And no duplicate account should be created

  Scenario: Registration with social provider (Google)
    When I click on "Sign up with Google"
    And I authenticate with Google using valid credentials
    And I grant permissions to the application
    Then my account should be created with the Google profile information
    And I should be automatically logged in
    And I should be redirected to complete my profile

  Scenario: Registration with social provider (Apple)
    When I click on "Sign up with Apple"
    And I authenticate with Apple using valid credentials
    And I choose to share my email
    Then my account should be created with the Apple profile information
    And I should be automatically logged in
    And I should be redirected to complete my profile