@smoke @regression @authentication @cross-platform
Feature: User Login Flow
  As a registered user of the Traveller RPG platform
  I want to login to my account across all platforms
  So that I can access my characters and campaigns

  Background:
    Given the application is running
    And I have a registered and verified user account

  @ui @desktop
  Scenario: Successful login on desktop web
    Given I am on the login page
    When I enter valid credentials
    And I submit the login form
    Then I should be logged in successfully
    And I should be redirected to the dashboard
    And my session should be active

  @ui @mobile
  Scenario: Successful login on mobile web
    Given I am on the login page on mobile
    When I enter valid credentials on mobile
    And I submit the login form on mobile
    Then I should be logged in successfully on mobile
    And I should be redirected to the dashboard on mobile
    And my session should be active

  @api
  Scenario: Login via API
    Given I have valid login credentials
    When I make a login request to the API
    Then the API should return a JWT token
    And the token should be valid
    And the token should contain user information

  @security
  Scenario: Failed login attempts
    Given I am on the login page
    When I enter invalid credentials
    And I submit the login form
    Then I should see an error message
    And I should not be logged in
    And my session should remain inactive

  @security
  Scenario: Account lockout after multiple failures
    Given I am on the login page
    When I enter invalid credentials 5 times
    Then my account should be temporarily locked
    And I should see a lockout message
    And valid credentials should not work during lockout

  @jwt @api
  Scenario: JWT token lifecycle
    Given I have a valid JWT token
    When I make authenticated API requests
    Then all requests should be authorized
    When the token expires
    Then subsequent requests should be unauthorized
    And I should receive a 401 status code

  @cross-platform
  Scenario: Single sign-on across platforms
    Given I am logged in on desktop web
    When I access the mobile platform
    Then I should remain logged in on mobile
    And my session should be synchronized

  @remember-me @ui
  Scenario: Remember me functionality
    Given I am on the login page
    When I enter valid credentials
    And I check "Remember me"
    And I submit the login form
    And I close and reopen the browser
    Then I should still be logged in
    And my session should persist

  @logout @ui
  Scenario: User logout
    Given I am logged in
    When I click the logout button
    Then I should be logged out
    And my session should be terminated
    And I should be redirected to the login page
    And my JWT token should be invalidated