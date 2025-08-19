@smoke @regression @authentication @cross-platform
Feature: User Registration Flow
  As a new user of the Traveller RPG platform
  I want to register for an account across all platforms
  So that I can access character creation and campaign features

  Background:
    Given the application is running
    And all services are available

  @ui @desktop
  Scenario: Complete user registration on desktop web
    Given I am on the registration page
    When I fill in the registration form with valid details
    And I submit the registration form
    Then I should see a verification message
    And a verification email should be sent
    And I should be redirected to the verification page

  @ui @mobile
  Scenario: Complete user registration on mobile web
    Given I am on the registration page on mobile
    When I fill in the registration form with valid details on mobile
    And I submit the registration form on mobile
    Then I should see a verification message on mobile
    And a verification email should be sent
    And I should be redirected to the verification page on mobile

  @api
  Scenario: User registration via API
    Given I have valid registration data
    When I make a registration request to the API
    Then the API should return a success response
    And a user account should be created
    And a verification token should be generated

  @cross-platform
  Scenario: Cross-platform registration verification
    Given I registered on desktop web
    And I received a verification email
    When I open the verification link on mobile
    Then my account should be verified
    And I should be able to login on both platforms

  @validation @ui
  Scenario Outline: Registration form validation
    Given I am on the registration page
    When I fill in "<field>" with "<value>"
    And I submit the registration form
    Then I should see a validation error for "<field>"
    And the form should not be submitted

    Examples:
      | field            | value                    |
      | email            |                         |
      | email            | invalid-email           |
      | password         |                         |
      | password         | weak                    |
      | confirmPassword  | different-password      |
      | firstName        |                         |
      | lastName         |                         |

  @performance
  Scenario: Registration performance requirements
    Given I am on the registration page
    When I complete the registration process
    Then the registration should complete within 5 seconds
    And the page should remain responsive throughout
    And API calls should complete within 2 seconds