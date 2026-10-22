Feature: Profile Management
  As a logged-in user
  I want to manage my profile
  So that I can keep my information up to date

  Background:
    Given I am logged in as "john.doe@example.com"
    And I am on the profile page

  Scenario: View profile information
    Then I should see my email "john.doe@example.com"
    And I should see my display name "John Doe"
    And I should see my subscription tier "Free"
    And I should see my account creation date
    And I should see my timezone setting

  Scenario: Update display name
    When I change my display name to "Captain John"
    And I save my profile changes
    Then my display name should be updated to "Captain John"
    And I should see a success message "Profile updated successfully"
    And the new display name should appear in the header

  Scenario: Upload profile avatar
    When I upload an avatar image "avatar.jpg"
    And the image is less than 5MB
    And the image is a valid format (JPG, PNG, GIF)
    And I save my profile changes
    Then my avatar should be updated
    And the avatar should be stored in S3
    And I should see the new avatar in my profile

  Scenario: Change timezone
    When I change my timezone to "America/Los_Angeles"
    And I save my profile changes
    Then my timezone should be updated to "America/Los_Angeles"
    And all timestamps should display in the new timezone

  Scenario: Change password
    When I click on "Change Password"
    And I enter "SecurePass123!" as my current password
    And I enter "NewSecurePass456!" as my new password
    And I confirm "NewSecurePass456!" as my new password confirmation
    And I submit the password change form
    Then my password should be updated
    And I should see a success message "Password changed successfully"
    And an email notification should be sent to "john.doe@example.com"

  Scenario: Enable two-factor authentication
    When I click on "Enable Two-Factor Authentication"
    And I choose "Authenticator App" as my MFA method
    Then I should see a QR code to scan
    When I scan the QR code with my authenticator app
    And I enter the verification code from my app
    And I submit the MFA setup form
    Then MFA should be enabled on my account
    And I should see backup codes for emergency access
    And I should see a success message "Two-factor authentication enabled"

  Scenario: Manage subscription tier
    Given I have a "Free" subscription
    When I click on "Upgrade Subscription"
    And I select the "Premium" tier
    And I enter valid payment information
    And I confirm the subscription change
    Then my subscription should be upgraded to "Premium"
    And I should have access to premium features
    And I should receive a payment confirmation email

  Scenario: Delete account
    When I click on "Delete Account"
    And I confirm I understand this action is permanent
    And I enter my password for confirmation
    And I click "Delete My Account"
    Then I should see an option to export my data
    When I choose to export my data
    Then a download link should be sent to my email
    And my account should be scheduled for deletion in 30 days
    And I should receive a confirmation email about the deletion