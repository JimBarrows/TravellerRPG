Feature: User Registration and Email Verification
  As a new user
  I want to register for an account with email verification
  So that I can securely access the Traveller RPG platform

  Background:
    Given I am on the registration page
    And the authentication service is available

  Scenario: Successful user registration with valid information
    When I enter a valid email "player@example.com"
    And I enter a display name "Test Player"
    And I enter a strong password "StrongPass123!"
    And I confirm the password correctly
    And I accept the terms and conditions
    And I submit the registration form
    Then I should see a verification code entry form
    And I should see a message indicating verification code was sent to my email

  Scenario: User enters invalid email format
    When I enter an invalid email "invalid-email"
    And I enter a display name "Test Player"
    And I enter a strong password "StrongPass123!"
    And I confirm the password correctly
    And I accept the terms and conditions
    And I submit the registration form
    Then I should see an error message "Please enter a valid email"
    And the form should not be submitted

  Scenario: User enters weak password
    When I enter a valid email "player@example.com"
    And I enter a display name "Test Player"
    And I enter a weak password "123"
    And I confirm the password correctly
    And I accept the terms and conditions
    And I submit the registration form
    Then I should see a password strength indicator showing "weak"
    And I should see an error message about password requirements
    And the form should not be submitted

  Scenario: User enters mismatched passwords
    When I enter a valid email "player@example.com"
    And I enter a display name "Test Player"
    And I enter a strong password "StrongPass123!"
    And I enter a different confirm password "DifferentPass456!"
    And I accept the terms and conditions
    And I submit the registration form
    Then I should see an error message "Passwords do not match"
    And the form should not be submitted

  Scenario: User does not accept terms and conditions
    When I enter a valid email "player@example.com"
    And I enter a display name "Test Player"
    And I enter a strong password "StrongPass123!"
    And I confirm the password correctly
    And I do not accept the terms and conditions
    And I submit the registration form
    Then I should see an error message "You must accept the terms and conditions"
    And the form should not be submitted

  Scenario: User successfully verifies email with correct code
    Given I have completed the registration form
    And I am on the verification page
    When I enter the correct verification code "123456"
    And I submit the verification form
    Then I should be automatically signed in
    And I should be redirected to the dashboard

  Scenario: User enters invalid verification code
    Given I have completed the registration form
    And I am on the verification page
    When I enter an invalid verification code "000000"
    And I submit the verification form
    Then I should see an error message about invalid verification code
    And I should remain on the verification page

  Scenario: User requests new verification code
    Given I have completed the registration form
    And I am on the verification page
    When I click "Resend Code"
    Then I should see a message that a new code has been sent
    And the resend button should be temporarily disabled

  Scenario: Registration fails when email already exists
    Given an account with email "existing@example.com" already exists
    When I enter the email "existing@example.com"
    And I enter a display name "Test Player"
    And I enter a strong password "StrongPass123!"
    And I confirm the password correctly
    And I accept the terms and conditions
    And I submit the registration form
    Then I should see an error message "An account with this email already exists"
    And I should remain on the registration page

  Scenario: Password strength indicator updates in real-time
    When I start typing a password "a"
    Then I should see the password strength indicator show "weak"
    When I continue typing the password "aB"
    Then the password strength should still show "weak"
    When I type a complete strong password "StrongPass123!"
    Then I should see the password strength indicator show "strong"
    And all password requirements should be marked as met

  Scenario: Form validation clears errors as user corrects input
    When I submit the form with an empty email field
    Then I should see an error message "Email is required"
    When I enter a valid email "player@example.com"
    Then the email error message should disappear

  Scenario: Social registration options are available
    Then I should see a "Sign up with Google" button
    And I should see a "Sign up with Apple" button
    And both social registration buttons should be enabled