@offline @mobile @sync
Feature: Offline Functionality
  As a Traveller RPG player on mobile
  I want the app to work offline
  So that I can play and manage characters without internet connectivity

  Background:
    Given I am logged in
    And I have characters synchronized

  @offline @character-access
  Scenario: Access characters while offline
    Given I have internet connectivity
    And I view my character "Marcus Vale"
    When I disconnect from the internet
    And I navigate back to character list
    Then I should still see all my characters
    And I should see an offline indicator
    When I tap on "Marcus Vale"
    Then I should see the full character sheet
    And all character data should be available

  @offline @character-editing
  Scenario: Edit character data while offline
    Given I am offline
    And I am viewing character "Marcus Vale"
    When I edit the character's name to "Marcus Vale-Smith"
    And I update skill points
    And I add new equipment
    Then the changes should be saved locally
    And I should see a "Changes saved offline" indicator
    When I go back to character list
    Then I should see "Marcus Vale-Smith" with a sync indicator

  @offline @dice-rolling
  Scenario: Use dice roller while offline
    Given I am offline
    When I navigate to the dice roller
    And I configure dice for "2d6+2"
    And I roll the dice
    Then I should see the roll results
    And the dice animation should work normally
    And roll history should be maintained locally

  @offline @sync-on-reconnect
  Scenario: Synchronize data when connection restored
    Given I have made offline changes to characters
      | Character     | Change           |
      | Marcus Vale   | Name updated     |
      | Sarah Connor  | Skills modified  |
      | John Smith    | Equipment added  |
    When I reconnect to the internet
    Then I should see a sync notification
    And sync should begin automatically
    When sync completes successfully
    Then I should see "All changes synchronized"
    And sync indicators should be removed from characters

  @offline @conflict-resolution
  Scenario: Handle sync conflicts
    Given I have offline changes to character "Marcus Vale"
    And the same character was modified on another device
    When I reconnect to the internet
    And sync detects conflicts
    Then I should see a conflict resolution dialog
    And I should see both versions of the data
      | Local Changes  | Server Changes |
      | Name: Marcus V | Name: Mark V   |
      | STR: 12        | STR: 10        |
    When I choose "Keep Local Changes"
    Then my local changes should be preserved
    And they should sync to the server

  @offline @storage-limits
  Scenario: Handle offline storage limits
    Given I am offline
    And offline storage is near capacity
    When I try to create a new character
    Then I should see a storage warning
    And I should see options to free up space
    When I choose to remove old cached data
    Then storage should be freed up
    And I should be able to create the character

  @offline @network-status
  Scenario: Display network connectivity status
    Given I am using the app
    When I lose internet connection
    Then I should see an offline indicator in the status bar
    And I should see "Working Offline" message
    When I regain internet connection
    Then I should see "Online" indicator
    And I should see "Synchronizing..." if there are pending changes

  @offline @queue-management
  Scenario: Queue actions while offline
    Given I am offline
    When I perform multiple actions
      | Action                    |
      | Update character stats    |
      | Create new character      |
      | Delete old character      |
      | Update campaign notes     |
    Then all actions should be queued for sync
    And I should see "4 changes pending sync"
    When I reconnect to the internet
    Then queued actions should sync in order
    And I should see progress for each action

  @offline @partial-connectivity
  Scenario: Handle poor connectivity gracefully
    Given I have very slow internet connection
    When I try to sync character data
    Then I should see a progress indicator
    And sync should continue in background
    When connection drops during sync
    Then sync should pause and queue remaining changes
    When connection improves
    Then sync should resume automatically

  @offline @cache-management
  Scenario: Manage offline data cache
    Given I am in app settings
    When I navigate to "Offline Storage"
    Then I should see cache usage statistics
      | Characters    | 15 MB |
      | Images        | 8 MB  |
      | Game Data     | 5 MB  |
      | Total         | 28 MB |
    When I tap "Clear Character Images"
    Then image cache should be cleared
    And storage usage should be updated

  @offline @background-sync
  Scenario: Background synchronization
    Given I have offline changes
    And the app goes to background
    When I return to the app after network is available
    Then background sync should have occurred
    And I should see "Data synchronized in background"
    And all changes should be up to date

  @offline @selective-sync
  Scenario: Choose what to sync when reconnected
    Given I have multiple offline changes
    When I reconnect with limited data connection
    Then I should see sync options
      | Essential data only    |
      | All changes           |
      | Custom selection      |
    When I choose "Essential data only"
    Then only critical character data should sync
    And images/media should remain queued

  @offline @error-handling
  Scenario: Handle offline operation errors
    Given I am offline
    When I try to access cloud-only features
    Then I should see "This feature requires internet connection"
    And I should see alternative offline options
    When I try to sync with invalid data
    Then I should see error details
    And I should have options to fix or skip the problematic data