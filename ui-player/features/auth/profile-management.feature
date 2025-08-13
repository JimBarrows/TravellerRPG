Feature: Profile Management UI
  As a logged-in user
  I want to manage my profile through a user-friendly interface
  So that I can keep my information up to date and customize my account

  Background:
    Given I am logged in as "john.doe@example.com"
    And I navigate to the profile page

  Scenario: Display current profile information
    Then I should see my email "john.doe@example.com"
    And I should see my display name "John Doe"
    And I should see my current timezone "America/New_York"
    And I should see my account creation date
    And I should see my subscription tier "Free"
    And I should see my current avatar or a default avatar placeholder

  Scenario: Update display name successfully
    When I click on the display name edit button
    And I change my display name to "Captain John"
    And I click save changes
    Then I should see a success message "Profile updated successfully"
    And my display name should be updated to "Captain John"
    And the page should reload with the updated information

  Scenario: Upload new avatar image
    When I click on the avatar upload button
    And I select an image file "avatar.jpg" that is less than 5MB
    And the image is in a valid format (JPG, PNG, GIF)
    Then I should see a preview of the cropped image
    When I confirm the avatar upload
    Then I should see a loading indicator
    And the avatar should be uploaded to S3
    And my profile should display the new avatar
    And I should see a success message "Avatar updated successfully"

  Scenario: Upload avatar with invalid file size
    When I click on the avatar upload button
    And I select an image file that is larger than 5MB
    Then I should see an error message "File size must be less than 5MB"
    And the upload should be rejected

  Scenario: Upload avatar with invalid format
    When I click on the avatar upload button
    And I select a file "document.pdf" with an invalid format
    Then I should see an error message "Please select a valid image file (JPG, PNG, GIF)"
    And the upload should be rejected

  Scenario: Change timezone setting
    When I click on the timezone dropdown
    And I select "America/Los_Angeles" from the timezone list
    And I click save changes
    Then I should see a success message "Timezone updated successfully"
    And my timezone should be updated to "America/Los_Angeles"
    And all timestamps should display in the new timezone

  Scenario: Update email address with verification
    When I click on the email edit button
    And I change my email to "john.doe.updated@example.com"
    And I click save changes
    Then I should see a message "Verification code sent to john.doe.updated@example.com"
    And I should see a verification code input field
    When I enter the correct verification code "123456"
    And I click verify
    Then I should see a success message "Email updated successfully"
    And my email should be updated to "john.doe.updated@example.com"

  Scenario: Change password with validation
    When I click on the "Change Password" button
    Then I should see a password change form
    When I enter "SecurePass123!" as my current password
    And I enter "NewSecurePass456!" as my new password
    And I enter "NewSecurePass456!" as my password confirmation
    Then I should see a password strength indicator showing "Strong"
    When I submit the password change form
    Then I should see a success message "Password changed successfully"
    And I should receive an email notification about the password change

  Scenario: Change password with weak new password
    When I click on the "Change Password" button
    And I enter "SecurePass123!" as my current password
    And I enter "weak" as my new password
    Then I should see a password strength indicator showing "Weak"
    And I should see validation errors about password requirements
    And the submit button should be disabled

  Scenario: Change password with mismatched confirmation
    When I click on the "Change Password" button
    And I enter "SecurePass123!" as my current password
    And I enter "NewSecurePass456!" as my new password
    And I enter "DifferentPassword!" as my password confirmation
    Then I should see an error message "Passwords do not match"
    And the submit button should be disabled

  Scenario: View connected social accounts
    Given I have connected social accounts "Google, Apple"
    When I scroll to the social accounts section
    Then I should see my connected Google account
    And I should see my connected Apple account
    And I should see options to disconnect each account
    And I should see options to connect additional social providers

  Scenario: Disconnect social account
    Given I have a connected Google account
    When I click on "Disconnect" next to my Google account
    Then I should see a confirmation dialog "Are you sure you want to disconnect your Google account?"
    When I confirm the disconnection
    Then I should see a success message "Google account disconnected successfully"
    And the Google account should no longer appear in my connected accounts

  Scenario: Connect new social account
    Given I have no connected Facebook account
    When I click on "Connect Facebook"
    Then I should be redirected to Facebook's authorization page
    When I authorize the connection
    Then I should be redirected back to my profile page
    And I should see Facebook in my connected accounts
    And I should see a success message "Facebook account connected successfully"

  Scenario: Edit profile with network error
    When I change my display name to "Network Test"
    And I click save changes
    And a network error occurs
    Then I should see an error message "Unable to save changes. Please check your connection and try again."
    And my changes should not be saved
    And the form should remain in edit mode

  Scenario: Avatar upload with network error
    When I click on the avatar upload button
    And I select a valid image file "avatar.jpg"
    And I confirm the avatar upload
    And a network error occurs during upload
    Then I should see an error message "Upload failed. Please try again."
    And the upload should be cancelled
    And my avatar should remain unchanged

  Scenario: Navigate away with unsaved changes
    When I change my display name to "Unsaved Changes"
    And I attempt to navigate away from the profile page
    Then I should see a confirmation dialog "You have unsaved changes. Are you sure you want to leave?"
    When I click "Stay on page"
    Then I should remain on the profile page
    And my changes should still be in the form

  Scenario: Auto-save profile changes
    When I change my display name to "Auto Save Test"
    And I wait for 3 seconds
    Then I should see a small indicator showing "Changes saved"
    And my display name should be automatically saved

  Scenario: Profile accessibility features
    When I navigate using only keyboard controls
    Then all form fields should be reachable with Tab key
    And all buttons should be activatable with Enter or Space
    And screen reader announcements should provide context for changes
    And error messages should be announced by screen readers