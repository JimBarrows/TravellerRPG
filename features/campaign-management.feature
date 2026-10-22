Feature: Campaign Management
  As a Game Master
  I want to create and manage campaigns
  So that I can run Traveller games for my players

  Background:
    Given I am logged in as a GM
    And I have a subscription that allows campaign creation

  Scenario: Create a new campaign
    Given I am on the campaigns page
    When I click "Create New Campaign"
    And I enter "Spinward Marches Adventure" as the campaign name
    And I enter a campaign description
    And I select "Classic Traveller" as the rule set
    And I set the tech level to "12"
    And I select "Spinward Marches" as the setting
    And I click "Create Campaign"
    Then the campaign should be created
    And I should be the GM of the campaign
    And I should see the campaign dashboard
    And the campaign should have a unique join code

  Scenario: Invite players to campaign
    Given I have created a campaign
    And I am on the campaign dashboard
    When I click "Invite Players"
    And I enter "player1@example.com" in the email field
    And I enter "player2@example.com" in the email field
    And I select "Player" as the role for both
    And I click "Send Invitations"
    Then invitation emails should be sent to both players
    And the invitations should include the join code
    And the invitations should expire in 7 days
    And I should see pending invitations in the member list

  Scenario: Player joins campaign via invitation
    Given I received a campaign invitation
    And I am logged in as "player1@example.com"
    When I click the invitation link
    Then I should see the campaign details
    And I should see the GM name
    And I should see current members
    When I click "Join Campaign"
    Then I should be added to the campaign
    And I should see the campaign in my campaign list
    And the GM should receive a notification

  Scenario: Configure house rules
    Given I am managing my campaign
    When I navigate to "Campaign Settings"
    And I click on "House Rules"
    Then I can configure:
      | Rule Category        | Options                           |
      | Character Creation   | Point buy, Random, Hybrid         |
      | Skill Checks        | Standard, Harsh, Lenient          |
      | Critical Success    | Natural 12, 10+ effect, Disabled  |
      | Critical Failure    | Natural 2, -6 effect, Disabled    |
      | Death Rules         | Standard, Heroic, Realistic       |
      | Advancement         | By terms, Experience points, Both |
    When I enable "Point Buy" for character creation
    And I set "Heroic" death rules
    And I save the house rules
    Then all players should see the house rules
    And character creation should use these rules

  Scenario: Create campaign calendar and schedule sessions
    Given I am on the campaign dashboard
    When I click "Schedule Session"
    And I select next Saturday at 7 PM
    And I set duration to "4 hours"
    And I add the description "Arriving at Regina Station"
    And I set it as recurring weekly
    And I click "Create Session"
    Then the session should appear in the campaign calendar
    And all players should receive a notification
    And players should be able to RSVP
    And the session should recur every Saturday

  Scenario: Manage NPCs in campaign
    Given I am in my campaign
    When I navigate to "NPCs"
    And I click "Create NPC"
    And I select "Quick NPC" option
    And I enter "Captain Reynolds" as the name
    And I select "Merchant Captain" as the template
    And I set disposition as "Friendly"
    And I add notes about the character
    And I click "Create"
    Then the NPC should be added to my campaign
    And I should be able to view and edit the NPC
    And I can mark the NPC as visible to players

  Scenario: Track campaign timeline
    Given I am managing my campaign
    When I navigate to "Timeline"
    And I click "Add Event"
    And I enter "Battle of Regina" as the event
    And I set the date as "Imperial Year 1105, Day 250"
    And I mark it as "Major Event"
    And I add participating characters
    And I save the event
    Then the event should appear on the timeline
    And I should be able to link session notes to it
    And players should see it if marked as public

  Scenario: Manage star sectors and systems
    Given I am in campaign management
    When I navigate to "Universe"
    And I click "Generate Sector"
    And I select "Standard" density
    And I name it "Darrian Subsector"
    And I click "Generate"
    Then a hex map should be created
    And systems should be randomly placed
    And I should be able to edit each system
    When I click on a system
    Then I can modify:
      | Property         | Options                    |
      | Name            | Custom text                |
      | UWP Code        | Standard format            |
      | Allegiance      | Imperial, Independent, etc |
      | Trade Codes     | Multiple selections        |
      | Bases           | Naval, Scout, etc          |
      | Notable Features | Custom descriptions        |

  Scenario: Create and distribute handouts
    Given I am preparing for a session
    When I navigate to "Handouts"
    And I click "Create Handout"
    And I enter "Regina Station Map" as the title
    And I upload an image file
    And I add descriptive text
    And I select specific players to receive it
    And I click "Save and Distribute"
    Then the selected players should receive the handout
    And they should get a notification
    And the handout should appear in their resources

  Scenario: Run combat encounter
    Given I am in an active session
    When I click "Start Combat"
    And I add participants:
      | Name      | Type   | Initiative Modifier |
      | Player 1  | PC     | +1                 |
      | Player 2  | PC     | +0                 |
      | Pirate 1  | NPC    | +2                 |
      | Pirate 2  | NPC    | -1                 |
    And I click "Roll Initiative"
    Then combat tracker should open
    And participants should be ordered by initiative
    And I should be able to:
      | Action              | Result                    |
      | Advance turn        | Move to next combatant   |
      | Apply damage        | Update character health   |
      | Add status effects  | Track conditions         |
      | Remove participant  | Handle defeated enemies  |
      | End combat         | Return to normal play    |

  Scenario: Archive completed campaign
    Given my campaign has concluded
    When I navigate to "Campaign Settings"
    And I click "Archive Campaign"
    And I confirm the action
    Then the campaign should be marked as archived
    And players should retain read-only access
    And all data should be preserved
    And the campaign should not count against my active limit