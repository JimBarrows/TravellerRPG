Feature: Simple User Registration Test
  As a new user
  I want to register for an account
  So that I can access the Traveller RPG platform

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