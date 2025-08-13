Feature: JWT Token Management
  As a user of the Traveller RPG application
  I want secure JWT token management with automatic refresh
  So that my authentication state persists safely and seamlessly

  Background:
    Given I am using the Traveller RPG application
    And the token management system is initialized

  Scenario: Secure token storage
    Given I have valid JWT tokens
    When I enable "remember me" functionality
    Then my tokens should be stored securely in encrypted local storage
    And when I disable "remember me" functionality
    Then my tokens should be stored only in session storage

  Scenario: Token validation and expiration checking
    Given I have a JWT token with known expiration
    When I check if the token is valid
    Then the system should correctly identify valid tokens
    And the system should correctly identify expired tokens
    And the system should calculate time until expiration

  Scenario: Automatic token refresh
    Given I have a token that is about to expire
    When the token reaches the refresh threshold
    Then the system should automatically refresh the token
    And the new token should be stored securely
    And my session should continue without interruption

  Scenario: Session timeout warning
    Given I have an active session
    When my token is about to expire in 5 minutes
    Then I should see a session timeout warning notification
    And I should have options to extend my session or logout

  Scenario: Failed token refresh handling
    Given I have an expired refresh token
    When the system attempts to refresh the access token
    Then the refresh should fail gracefully
    And I should be redirected to the login page
    And all stored tokens should be cleared

  Scenario: Authentication state persistence across page reloads
    Given I am authenticated with a valid token
    When I reload the page
    Then my authentication state should be restored
    And my user information should be available
    And I should not need to login again

  Scenario: API request authentication headers
    Given I am authenticated
    When I make an API request
    Then the request should include the proper Authorization header
    And when I receive a 401 response
    Then the system should attempt token refresh
    And retry the original request with the new token