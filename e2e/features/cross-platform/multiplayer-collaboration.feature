@cross-platform @multiplayer @collaboration @real-time @gameplay
Feature: Multi-Player Collaborative Gameplay
  As a Game Master and players in a Traveller RPG campaign
  We want seamless real-time collaboration across web and mobile platforms
  So that we can run immersive gaming sessions regardless of device choice

  Background:
    Given a campaign "Spinward Marches Adventures" is active
    And the Game Master "Alex" is logged in on web
    And 4 players are logged in on various platforms:
      | player_name | character_name    | platform | device_type |
      | Sarah       | Captain Torres    | mobile   | iPhone      |
      | Mike        | Engineer Walsh    | web      | desktop     |
      | Emma        | Dr. Patel        | mobile   | Android     |
      | David       | Gunner Morrison   | web      | tablet      |
    And all participants have real-time sync enabled

  @session-management @real-time @notifications
  Scenario: GM initiates gaming session with real-time player coordination
    Given the GM wants to start an impromptu gaming session
    When the GM clicks "Start Session" on the web platform
    And selects "Emergency Session - Pirate Attack"
    Then all campaign players should receive push notifications
    And mobile players should see session alerts immediately
    And web players should see browser notifications
    
    # Players respond and join
    When players respond to the session notification:
      | player_name | response_time | availability | location     |
      | Sarah       | 30 seconds   | Available    | Commuting    |
      | Mike        | 45 seconds   | Available    | Home office  |
      | Emma        | 2 minutes    | Available    | Coffee shop  |
      | David       | 1 minute     | Maybe later  | Meeting      |
    Then the GM should see real-time player availability
    And the system should suggest optimal session start time
    And players should see who else is available
    
    # Session coordination
    When 3 out of 4 players confirm availability
    And the GM sets session start for "in 10 minutes"
    Then all confirmed players should receive countdown notifications
    And calendar invites should be sent automatically
    And players should receive session preparation reminders
    
    # Session launch
    When session time arrives
    Then the GM should see all player status indicators
    And players should automatically join the session interface
    And voice/video integration should be available
    And character sheets should be accessible to all

  @dice-rolling @real-time @transparency @cross-platform
  Scenario: Collaborative dice rolling with cross-platform transparency
    Given the gaming session is active
    And all players are connected
    And the GM has set up a skill check scenario
    
    # GM initiates group skill check
    When the GM creates a group skill check on web
      | check_type    | Engineering Crisis      |
      | difficulty    | Very Difficult (12+)    |
      | required_by   | All players             |
      | time_limit    | 60 seconds              |
      | allows_help   | Yes                     |
    Then all players should see the skill check request
    And mobile players should get haptic feedback
    And a countdown timer should appear on all platforms
    
    # Players roll dice on different platforms
    When players roll dice simultaneously:
      | player_name | platform | dice_type | base_roll | skill_modifier | total |
      | Sarah       | mobile   | 2d6       | 7         | +3             | 10    |
      | Mike        | web      | 2d6       | 11        | +2             | 13    |
      | Emma        | mobile   | 2d6       | 6         | +4             | 10    |
    Then all dice rolls should appear in real-time on all platforms
    And dice animations should be synchronized
    And running totals should update live
    And success/failure indicators should appear immediately
    
    # Collaborative assistance
    When Mike's successful roll allows him to assist others
    And the GM enables assistance mode
    Then Mike should be able to grant bonuses to other players
    And assisted players should see the bonus applied
    And final results should be calculated with assistance
    And the narrative outcome should be displayed to all players

  @character-sheets @live-updates @collaboration
  Scenario: Live character sheet updates during collaborative gameplay
    Given players are in an active combat scenario
    And character sheets are visible to appropriate participants
    
    # GM updates affect multiple characters
    When the GM applies area damage to multiple characters
      | character_name   | damage_type | damage_amount | location |
      | Captain Torres   | Laser       | 8            | Right Arm |
      | Engineer Walsh   | Laser       | 12           | Chest    |
      | Dr. Patel       | Laser       | 4            | Left Leg  |
    Then each player's mobile/web interface should update immediately
    And damage should be applied to appropriate characteristics
    And armor protection should be calculated automatically
    And wound status should be updated in real-time
    
    # Player actions affect character states
    When Dr. Patel attempts medical treatment on Engineer Walsh
    And Dr. Patel's player makes a medical skill check on mobile
    And the roll succeeds
    Then Engineer Walsh's character sheet should update on Mike's web browser
    And healing should be applied immediately
    And both players should see the medical treatment logged
    And the GM should see the action in the session log
    
    # Equipment and resources tracking
    When Captain Torres uses ammunition in combat
    And Sarah updates ammunition count on her mobile
    Then the ammunition decrease should sync to all platforms
    And the GM should see updated equipment status
    And ammunition warnings should appear when running low
    And inventory changes should be logged for session records

  @initiative @turn-management @cross-platform
  Scenario: Turn-based combat management across platforms
    Given combat has been initiated by the GM
    And all players and NPCs need initiative tracking
    
    # Initiative rolling and ordering
    When the GM requests initiative rolls
    Then all players should receive initiative roll prompts
    And players can roll on their preferred platform
    When players roll initiative:
      | player_name    | platform | roll_result | dex_modifier | final_initiative |
      | Captain Torres | mobile   | 9           | +2           | 11              |
      | Engineer Walsh | web      | 7           | +1           | 8               |
      | Dr. Patel     | mobile   | 12          | +0           | 12              |
      | Gunner Morrison| web      | 10          | +3           | 13              |
    Then initiative order should be displayed on all platforms
    And turn indicators should show whose turn is active
    And remaining players should see their position in queue
    
    # Turn management and actions
    When it's Gunner Morrison's turn (highest initiative)
    Then David's web interface should highlight his turn
    And other players should see "David's Turn" indicator
    And available actions should be displayed to David
    And turn timer should start counting down
    
    When David declares and executes his combat action
    Then the action should be processed immediately
    And results should appear on all platforms
    And turn should automatically advance to next player
    And Dr. Patel's mobile should now highlight for her turn
    
    # Cross-platform turn coordination
    When it's Dr. Patel's turn on mobile
    But she's temporarily unavailable
    Then other players should see "Waiting for Dr. Patel"
    And the GM should have options to skip or extend time
    And when Dr. Patel returns, she should immediately see turn prompt
    And her mobile should display available actions clearly

  @shared-narrative @story-building @cross-platform
  Scenario: Collaborative narrative building and story elements
    Given the campaign involves collaborative storytelling
    And players have narrative input permissions
    And the GM has enabled collaborative features
    
    # Shared narrative space
    When the GM creates a narrative prompt
      | scene_setting | "You approach the mysterious derelict starship" |
      | collaboration | "Players can add environmental details"          |
      | time_limit    | "5 minutes for collaborative input"             |
    Then all players should see the narrative prompt
    And collaborative editing interface should appear
    And players can contribute narrative elements simultaneously
    
    # Multi-platform narrative contributions
    When players add narrative details:
      | player_name    | platform | contribution                                    | timestamp |
      | Captain Torres | mobile   | "The ship's lights flicker ominously"         | 14:23:15  |
      | Engineer Walsh | web      | "Radiation readings are spiking"              | 14:23:22  |
      | Dr. Patel     | mobile   | "I detect faint life signs aboard"            | 14:23:30  |
    Then all contributions should appear in real-time
    And contributions should be attributed to their authors
    And the narrative should build coherently
    And players should be able to react to others' additions
    
    # GM integration and approval
    When the collaborative period ends
    Then the GM should see all player contributions
    And the GM should be able to integrate elements into main narrative
    And approved elements should become canonical
    And the final narrative should be displayed to all players
    And scene should transition based on collaborative input

  @resource-sharing @equipment @cross-platform
  Scenario: Cross-platform resource and equipment sharing
    Given players are in a resource-scarce scenario
    And equipment sharing has been enabled for the session
    
    # Equipment transfer requests
    When Engineer Walsh needs medical supplies
    And Dr. Patel has extra medical kits
    Then Mike can send a resource request from his web interface
    And Emma should receive the request on her mobile
    And the request should show:
      | requested_item | Medical Kit                    |
      | requestor      | Engineer Walsh (Mike)          |
      | reason         | "Treating severe laser burns"  |
      | urgency        | High                           |
    
    # Cross-platform equipment transfer
    When Dr. Patel approves the transfer on her mobile
    Then the medical kit should be removed from her inventory
    And the medical kit should appear in Engineer Walsh's inventory
    And both players should see confirmation messages
    And the GM should see the transfer logged in session notes
    And transfer should be recorded for campaign continuity
    
    # Group resource pooling
    When the party needs to pool credits for a major purchase
    And Captain Torres initiates group funding on mobile
    Then all players should see the funding request
    And players can contribute from any platform
    When players contribute credits:
      | player_name     | platform | contribution | running_total |
      | Captain Torres  | mobile   | 15,000 Cr   | 15,000 Cr    |
      | Engineer Walsh  | web      | 8,000 Cr    | 23,000 Cr    |
      | Dr. Patel      | mobile   | 12,000 Cr   | 35,000 Cr    |
    Then the group fund should update in real-time across all platforms
    And purchase approval should require majority consent
    And fund administration should be transparent to all participants

  @session-continuity @persistence @cross-platform
  Scenario: Session continuity and state persistence across interruptions
    Given an active gaming session is in progress
    And players are on different platforms
    And the session involves complex state information
    
    # Mid-session interruption
    When the GM's internet connection is temporarily lost
    Then players should see "GM connection lost" indicator
    And current session state should be preserved
    And players should be able to continue limited interactions
    And automatic reconnection should be attempted
    
    # GM reconnection and state recovery
    When the GM reconnects within 5 minutes
    Then session state should be fully recovered
    And all player actions during disconnection should be synchronized
    And session should continue seamlessly from where it left off
    And no data should be lost during the interruption
    
    # Player platform switching mid-session
    When Captain Torres needs to switch from mobile to tablet
    And Sarah logs out of mobile and logs in on tablet
    Then her session position should be preserved
    And character sheet should maintain current state
    And she should rejoin the session at exactly the same point
    And other players should see seamless transition
    
    # Session pause and resume
    When the GM needs to pause the session temporarily
    Then all players should receive pause notification
    And session state should be saved automatically
    And players should be able to leave safely
    When the session resumes later
    Then all returning players should restore their exact positions
    And the session should continue with all progress intact
    And players joining from different platforms should see consistent state

  @communication @voice-text @cross-platform
  Scenario: Multi-modal communication during collaborative gameplay
    Given the gaming session supports multiple communication methods
    And players have different communication preferences and capabilities
    
    # Mixed communication modes
    When players communicate using different methods:
      | player_name    | platform | preferred_method | accessibility_needs    |
      | Captain Torres | mobile   | Voice chat       | None                  |
      | Engineer Walsh | web      | Text chat        | Hearing impaired      |
      | Dr. Patel     | mobile   | Text chat        | Noisy environment     |
      | Gunner Morrison| web      | Voice + Text     | None                  |
    Then all communication should be synchronized across platforms
    And voice should be automatically transcribed for text users
    And text should be available as text-to-speech for voice users
    And communication history should be preserved
    
    # In-character vs out-of-character communication
    When players need to distinguish communication types
    Then the interface should support:
      | communication_type | formatting         | visibility      |
      | In-character       | Standard text      | All players     |
      | Out-of-character   | Italics/different  | All players     |
      | GM-only            | Private whisper    | GM only         |
      | Side conversation  | Private channel    | Selected players |
    And communication type should be clear on all platforms
    And private communications should be properly secured
    
    # Emergency communication
    When a player needs immediate attention
    Then emergency communication features should be available:
      | emergency_type | trigger_method        | notification_result |
      | GM attention   | "GM!" command         | Highlights for GM   |
      | Table attention| Phone shake (mobile)  | Alert all players   |
      | Technical help | "Help" button         | Support notification|
    And emergency communications should override normal chat flow
    And should be visible across all platforms simultaneously

  @campaign-progression @persistent-world @cross-platform
  Scenario: Long-term campaign progression and persistent world state
    Given a long-running campaign with persistent world elements
    And players contribute to world-building over multiple sessions
    And campaign state persists between sessions
    
    # World state contributions
    When players make significant world-impacting decisions
      | player_decision               | platform | world_impact                    |
      | Establish trade route         | web      | Economic changes in sector      |
      | Negotiate alien contact       | mobile   | Diplomatic relations shift     |
      | Discover ancient artifact     | web      | Archaeological site created    |
      | Build planetary facility      | mobile   | Infrastructure development     |
    Then world state should update across all platforms
    And changes should be visible to all campaign participants
    And world timeline should reflect all player contributions
    And future sessions should build on established changes
    
    # Cross-session character development
    When characters gain experience and advance
    Then advancement should be synchronized across platforms
    And skill improvements should persist between sessions
    And character relationships should maintain continuity
    And backstory additions should be preserved
    
    # Collaborative campaign history
    When significant campaign events occur
    Then events should be automatically logged
    And players should be able to add personal perspectives
    And campaign timeline should be accessible on all platforms
    And players should be able to reference past events during play
    And the collaborative history should inform future storylines