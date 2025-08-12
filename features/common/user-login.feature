Feature: User Login
  As a registered user
  I want to log into my account
  So that I can access my campaigns and characters

  Background:
    Given the authentication system is available
    And I am on the login page

  Scenario: Successful login with email and password
    Given I have a verified account with email "john.doe@example.com" and password "SecurePass123!"
    When I enter "john.doe@example.com" as my email
    And I enter "SecurePass123!" as my password
    And I submit the login form
    Then I should be successfully logged in
    And I should see my display name in the header
    And I should be redirected to the dashboard
    And a JWT token should be stored securely

  Scenario: Login with remember me option
    Given I have a verified account with email "john.doe@example.com" and password "SecurePass123!"
    When I enter "john.doe@example.com" as my email
    And I enter "SecurePass123!" as my password
    And I check the "Remember me" option
    And I submit the login form
    Then I should be successfully logged in
    And my session should persist for 30 days
    And a refresh token should be stored securely

  Scenario: Login with incorrect password
    Given I have a verified account with email "john.doe@example.com" and password "SecurePass123!"
    When I enter "john.doe@example.com" as my email
    And I enter "WrongPassword!" as my password
    And I submit the login form
    Then I should see an error "Invalid email or password"
    And I should not be logged in
    And the login attempt should be logged for security

  Scenario: Login with unverified account
    Given I have an unverified account with email "unverified@example.com"
    When I enter "unverified@example.com" as my email
    And I enter the correct password
    And I submit the login form
    Then I should see a message "Please verify your email before logging in"
    And I should see an option to resend verification email
    And I should not be logged in

  Scenario: Login with MFA enabled
    Given I have a verified account with MFA enabled
    When I enter my email and password correctly
    And I submit the login form
    Then I should be prompted for my MFA code
    When I enter the correct MFA code
    And I submit the MFA form
    Then I should be successfully logged in

  Scenario: Account lockout after failed attempts
    Given I have a verified account with email "john.doe@example.com"
    When I attempt to login with incorrect password 5 times
    Then my account should be temporarily locked
    And I should see a message "Account temporarily locked due to multiple failed login attempts"
    And an email should be sent to "john.doe@example.com" about the lockout
    And I should not be able to login for 15 minutes

  Scenario: Password recovery
    Given I have a verified account with email "john.doe@example.com"
    When I click on "Forgot password?"
    And I enter "john.doe@example.com" as my email
    And I submit the password recovery form
    Then I should see a message "Password reset instructions sent to your email"
    And a password reset email should be sent to "john.doe@example.com"
    
  Scenario: Login with social provider
    Given I have an account linked with Google
    When I click on "Sign in with Google"
    And I authenticate with Google
    Then I should be successfully logged in
    And I should be redirected to the dashboard