@authentication @mobile
Feature: Mobile Authentication
  As a Traveller RPG player using a mobile device
  I want to authenticate securely
  So that I can access my character data and game features

  Background:
    Given the app is launched
    And I am on the welcome screen

  @critical @smoke
  Scenario: Successful login with valid credentials
    Given I see the login form
    When I enter valid credentials
      | username | john.doe@example.com |
      | password | SecurePass123!       |
    And I tap the login button
    Then I should see the main dashboard
    And I should see my player profile
    And the authentication token should be stored

  @critical
  Scenario: Login failure with invalid credentials
    Given I see the login form
    When I enter invalid credentials
      | username | wrong@example.com |
      | password | WrongPassword     |
    And I tap the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login screen
    And no authentication token should be stored

  @registration
  Scenario: New user registration with mobile verification
    Given I am on the welcome screen
    When I tap "Create Account"
    And I fill in the registration form
      | email     | newuser@example.com |
      | password  | NewPass123!         |
      | confirm   | NewPass123!         |
      | username  | newuser             |
    And I tap "Register"
    Then I should see "Verification code sent to your email"
    And I should see the verification screen

  @registration @verification
  Scenario: Email verification process
    Given I have completed registration
    And I am on the verification screen
    When I receive a verification code
    And I enter the verification code "123456"
    And I tap "Verify"
    Then I should see "Account verified successfully"
    And I should be logged in automatically
    And I should see the main dashboard

  @biometric @security
  Scenario: Enable biometric authentication
    Given I am logged in
    And I am on the security settings screen
    When I toggle "Enable Biometric Authentication"
    And I provide my biometric data
    Then biometric authentication should be enabled
    And I should see "Biometric authentication enabled"

  @biometric @login
  Scenario: Login with biometric authentication
    Given biometric authentication is enabled
    And I have logged out
    And I am on the login screen
    When I tap "Use Biometric Login"
    And I provide valid biometric authentication
    Then I should be logged in successfully
    And I should see the main dashboard

  @logout @security
  Scenario: Secure logout process
    Given I am logged in
    When I navigate to the profile menu
    And I tap "Logout"
    And I confirm the logout
    Then I should be logged out
    And the authentication token should be cleared
    And I should see the welcome screen