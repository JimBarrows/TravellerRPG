@regression @campaign @management @real-time
Feature: Campaign Management and Real-time Features
  As a Game Master or Player
  I want to create and manage campaigns with real-time features
  So that I can run interactive gaming sessions

  Background:
    Given the application is running
    And I am logged in as a verified user

  @ui @gm @campaign-creation
  Scenario: Game Master creates a new campaign
    Given I am logged in as a Game Master
    And I am on the campaign creation page
    When I fill in campaign details
    And I set campaign parameters
    And I invite players
    And I create the campaign
    Then the campaign should be created successfully
    And invited players should receive notifications
    And I should be able to manage the campaign

  @ui @player @campaign-joining
  Scenario: Player joins an existing campaign
    Given I have received a campaign invitation
    When I accept the invitation
    And I select a character for the campaign
    Then I should be added to the campaign
    And other participants should be notified
    And I should have appropriate player permissions

  @real-time @websockets
  Scenario: Real-time campaign session
    Given I have an active campaign with multiple participants
    When the GM starts a session
    Then all players should be notified in real-time
    When players join the session
    Then their status should update for all participants
    And the session should show all connected users

  @dice-rolling @real-time
  Scenario: Shared dice rolling system
    Given I am in an active campaign session
    When I roll dice for a skill check
    Then the roll should be visible to all participants
    And the result should be recorded in the session log
    And the roll should include character modifiers
    When the GM rolls dice
    Then all players should see the roll result

  @combat @initiative
  Scenario: Combat initiative and turn management
    Given we are in a combat encounter
    When initiative is rolled
    Then turn order should be calculated automatically
    And all participants should see the initiative order
    When it's a player's turn
    Then only that player should be able to act
    And the turn should advance automatically

  @character-sheets @real-time
  Scenario: Real-time character sheet updates
    Given I am in a campaign session
    When my character takes damage
    And the GM updates my health
    Then my character sheet should update immediately
    And I should see the changes in real-time
    And other players should see my status changes

  @chat @communication
  Scenario: In-session chat system
    Given I am in a campaign session
    When I send a chat message
    Then all participants should receive it immediately
    When I send a private message to the GM
    Then only the GM should receive it
    And message history should be preserved

  @maps @shared-view
  Scenario: Shared map and token management
    Given we have a battle map loaded
    When the GM moves tokens
    Then all players should see the movement
    When I move my character token (if allowed)
    Then the movement should be visible to all
    And token positions should be persistent

  @api @campaign-data
  Scenario: Campaign data management via API
    Given I have campaign management permissions
    When I make API calls to manage campaign data
    Then the API should handle campaign CRUD operations
    And changes should be reflected in real-time
    And data should be properly validated

  @permissions @access-control
  Scenario: Campaign permission management
    Given I am a Game Master
    When I set player permissions
    Then players should have appropriate access levels
    And restricted actions should be enforced
    When I change permissions mid-session
    Then changes should take effect immediately

  @session-persistence
  Scenario: Session state persistence
    Given we have an active campaign session
    When a player disconnects temporarily
    And reconnects to the session
    Then their session state should be restored
    And they should see all missed updates
    And the session should continue seamlessly

  @mobile @responsive
  Scenario: Mobile campaign participation
    Given I am using the mobile interface
    When I join a campaign session
    Then the interface should be mobile-optimized
    And I should have access to essential features
    And real-time updates should work on mobile

  @performance @real-time
  Scenario: Real-time performance under load
    Given we have a campaign with 6+ participants
    When multiple users perform actions simultaneously
    Then all updates should propagate within 1 second
    And the system should remain responsive
    And no messages should be lost

  @offline @synchronization
  Scenario: Offline handling and synchronization
    Given I am in a campaign session
    When I lose internet connection
    Then I should see an offline indicator
    And I should be able to view current session data
    When I reconnect
    Then I should receive all missed updates
    And my actions should synchronize properly

  @archive @session-history
  Scenario: Campaign session archiving
    Given we have completed campaign sessions
    When I access session history
    Then I should see archived sessions
    And I should be able to view session logs
    And dice rolls should be preserved
    And chat history should be accessible

  @notifications @alerts
  Scenario: Campaign notification system
    Given I am subscribed to campaign notifications
    When important campaign events occur
    Then I should receive appropriate notifications
    And notifications should work across platforms
    And I should be able to customize notification settings