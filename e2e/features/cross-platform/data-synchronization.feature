@smoke @regression @cross-platform @synchronization @offline
Feature: Cross-Platform Data Synchronization
  As a user of multiple devices and platforms
  I want my data to synchronize seamlessly across all platforms
  So that I can access my characters and campaigns from anywhere

  Background:
    Given the application is running on multiple platforms
    And I am logged in with the same account on all platforms

  @sync @character-data
  Scenario: Character data synchronization across platforms
    Given I create a character on desktop web
    And the character is saved successfully
    When I access the mobile web platform
    Then the character should appear in my character list
    And all character details should be identical
    When I edit the character on mobile
    Then the changes should sync to desktop within 30 seconds

  @sync @campaign-data
  Scenario: Campaign data synchronization
    Given I join a campaign on desktop
    When I access the same campaign on mobile
    Then all campaign information should be synchronized
    And my participation status should be consistent
    When the GM updates campaign information
    Then updates should propagate to all my devices

  @real-time @live-sync
  Scenario: Real-time synchronization during active sessions
    Given I am in an active campaign session on desktop
    When another player makes changes that affect me
    And I'm simultaneously viewing on mobile
    Then both platforms should receive updates immediately
    And the state should be consistent across devices

  @offline @conflict-resolution
  Scenario: Offline changes and conflict resolution
    Given I have data loaded on mobile
    When I go offline and make changes
    And I make different changes on desktop while mobile is offline
    When mobile comes back online
    Then the system should detect conflicts
    And I should be presented with conflict resolution options
    And I should be able to merge changes appropriately

  @progressive-sync @partial-connectivity
  Scenario: Progressive synchronization with poor connectivity
    Given I have limited internet connectivity
    When I make multiple changes to my character
    Then changes should queue for synchronization
    And priority should be given to critical updates
    When connectivity improves
    Then all queued changes should sync in priority order
    And I should see sync progress indicators

  @cross-browser @session-continuity
  Scenario: Cross-browser session continuity
    Given I am logged in on Chrome
    When I open the application in Firefox
    Then I should be automatically logged in (if session is valid)
    And my session state should be preserved
    And ongoing activities should continue seamlessly

  @mobile-app @web-sync
  Scenario: Mobile app and web synchronization
    Given I have the mobile app installed
    And I make changes in the web application
    When I open the mobile app
    Then changes should sync immediately upon app launch
    And the sync should work bidirectionally
    And conflicts should be resolved gracefully

  @data-integrity @validation
  Scenario: Data integrity during synchronization
    Given I have complex character data
    When synchronization occurs between platforms
    Then all data relationships should be preserved
    And referential integrity should be maintained
    And no data should be lost or corrupted
    And validation rules should be enforced consistently

  @sync-status @user-feedback
  Scenario: Synchronization status and user feedback
    Given I make changes on one platform
    When synchronization begins
    Then I should see a sync indicator
    And progress should be communicated clearly
    When sync completes successfully
    Then I should receive confirmation
    If sync fails
    Then I should see clear error messages and retry options

  @bandwidth @optimization
  Scenario: Bandwidth optimization for mobile users
    Given I am on a mobile device with limited data
    When synchronization occurs
    Then only changed data should be transmitted
    And images should be optimized for mobile
    And I should have options to control sync behavior
    And sync should pause on very slow connections

  @version-control @change-tracking
  Scenario: Version control and change tracking
    Given I have a character with revision history
    When I make changes on different platforms
    Then each change should be tracked with metadata
    And I should be able to see change history
    And I should be able to revert to previous versions
    And conflicting changes should be clearly identified

  @multi-user @shared-data
  Scenario: Multi-user shared data synchronization
    Given I am a GM with a shared campaign
    When I make changes to campaign data
    Then all campaign participants should receive updates
    And updates should be atomic (all or nothing)
    And concurrent edits should be handled appropriately
    And user permissions should be enforced during sync

  @performance @large-datasets
  Scenario: Performance with large datasets
    Given I have many characters and extensive campaign history
    When synchronization occurs
    Then performance should remain acceptable
    And large datasets should sync incrementally
    And the UI should remain responsive during sync
    And memory usage should be optimized

  @error-recovery @resilience
  Scenario: Error recovery and system resilience
    Given synchronization is interrupted unexpectedly
    When I retry synchronization
    Then the system should recover gracefully
    And partial changes should not corrupt data
    And the system should automatically retry failed syncs
    And I should have manual retry options

  @privacy @security @sync
  Scenario: Privacy and security during synchronization
    Given I have sensitive character information
    When data synchronizes between platforms
    Then all data should be encrypted in transit
    And authentication should be verified continuously
    And access should be logged for security auditing
    And unauthorized access should be prevented

  @settings @user-control
  Scenario: User control over synchronization behavior
    Given I want to customize sync behavior
    When I access synchronization settings
    Then I should be able to control sync frequency
    And I should be able to pause/resume sync
    And I should be able to choose what data to sync
    And I should have options for Wi-Fi only sync