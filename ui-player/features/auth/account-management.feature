Feature: Account Management and Subscription Tiers
  As a user of the Traveller RPG application
  I want to manage my account and subscription tier
  So that I can control my data and access appropriate features

  Background:
    Given I am logged into the Traveller RPG application
    And I am on the account management page

  Scenario: View account information
    Given I have an active account
    When I view my account page
    Then I should see my user information
    And I should see my subscription tier status
    And I should see my account creation date
    And I should see my last login date

  Scenario: Export user data
    Given I want to export my account data
    When I click the "Export Data" button
    Then I should see a confirmation dialog
    When I confirm the data export
    Then the system should prepare my data for download
    And I should receive a download link for my data
    And the exported file should contain all my user data in JSON format

  Scenario: Account deletion with confirmation
    Given I want to delete my account
    When I click the "Delete Account" button
    Then I should see a detailed confirmation dialog
    And I should be warned about data loss
    When I type "DELETE" to confirm
    And I click the final delete button
    Then my account should be scheduled for deletion
    And I should be logged out immediately
    And I should receive a confirmation email

  Scenario: Subscription tier display for Free tier
    Given I have a Free tier subscription
    When I view my subscription status
    Then I should see "Free" as my current tier
    And I should see the limitations of the Free tier
    And I should see an option to upgrade

  Scenario: Subscription tier display for Standard tier
    Given I have a Standard tier subscription
    When I view my subscription status
    Then I should see "Standard" as my current tier
    And I should see the benefits of the Standard tier
    And I should see options to upgrade or downgrade

  Scenario: Subscription tier display for Premium tier
    Given I have a Premium tier subscription
    When I view my subscription status
    Then I should see "Premium" as my current tier
    And I should see all Premium benefits
    And I should see an option to downgrade

  Scenario: Upgrade subscription tier
    Given I have a Free tier subscription
    When I click "Upgrade to Standard"
    Then I should see the pricing information
    And I should see payment options
    When I complete the payment process
    Then my subscription should be upgraded to Standard
    And I should see the updated tier status

  Scenario: Downgrade subscription tier
    Given I have a Premium tier subscription
    When I click "Downgrade to Standard"
    Then I should see a confirmation dialog about losing features
    When I confirm the downgrade
    Then my subscription should be downgraded to Standard
    And I should see the updated tier status
    And the downgrade should take effect at the next billing cycle

  Scenario: Access control based on subscription tier
    Given I have a Free tier subscription
    When I try to access a Premium feature
    Then I should see an upgrade prompt
    And the feature should not be available
    But when I have a Premium tier subscription
    And I try to access the same feature
    Then the feature should be fully available

  Scenario: Payment method management
    Given I have a paid subscription
    When I view my payment methods
    Then I should see my current payment method
    And I should be able to update my payment method
    When I add a new payment method
    Then it should be saved securely
    And I should be able to set it as the default method