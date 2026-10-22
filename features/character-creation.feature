Feature: Character Creation
  As a player
  I want to create a Traveller character
  So that I can participate in campaigns

  Background:
    Given I am logged in as a player
    And I have access to character creation

  Scenario: Start new character creation
    Given I am on the characters page
    When I click "Create New Character"
    Then I should see the character creation wizard
    And I should be on the "Background" step
    And I should see options for homeworld selection

  Scenario: Select character homeworld
    Given I am in character creation on the "Background" step
    When I select "High Tech World" as homeworld type
    And I click "Roll for Details"
    Then the system should generate homeworld details
    And I should see the UWP code
    And I should see homeworld skill modifications
    And I can proceed to the next step

  Scenario: Generate character characteristics
    Given I am in character creation on the "Characteristics" step
    When I click "Roll Characteristics"
    Then the system should roll 2D6 six times
    And I should see my STR, DEX, END, INT, EDU, and SOC values
    And I should see the dice roll results
    And I should be able to assign characteristics based on homeworld

  Scenario: Choose first career
    Given I am in character creation on the "Career" step
    And my characteristics are STR:8, DEX:7, END:9, INT:10, EDU:8, SOC:6
    When I view available careers
    Then I should see careers I qualify for highlighted
    And I should see qualification requirements for each career
    When I select "Scout" career
    And I click "Attempt Qualification"
    Then the system should roll for qualification
    And I should see if I succeeded or failed
    And if successful, I enter the career

  Scenario: Complete first term of service
    Given I am in the "Scout" career
    And this is my first term
    When I click "Serve Term"
    Then the system should process the following:
      | Step                | Action                           |
      | Survival Roll       | Roll 2D6 + END modifier         |
      | Event               | Roll on Scout Events table       |
      | Commission          | Attempt if eligible             |
      | Advancement         | Roll for promotion              |
      | Training            | Select skill tables             |
      | Skill Roll          | Roll for skill gained           |
    And I should age 4 years
    And I should see all results in the log

  Scenario: Training and skill selection
    Given I am in career term resolution
    And I earned 2 skill rolls this term
    When I view available skill tables
    Then I should see "Personal Development" table
    And I should see "Service Skills" table
    And I should see "Specialist Skills" table based on assignment
    When I select "Service Skills" for first roll
    And the system rolls a 4
    Then I should gain "Pilot" skill at level 0 or increase existing
    And I should have 1 skill roll remaining

  Scenario: Mustering out after 3 terms
    Given I have completed 3 terms of service
    And I am age 30
    When I choose to muster out
    Then I should receive benefit rolls based on terms and rank
    And I should be able to choose between Benefits and Cash tables
    When I roll on the Benefits table
    Then I should receive items, ships, or stat increases
    And all benefits should be added to my character

  Scenario: Life events during creation
    Given I am in term resolution
    And I rolled a life event
    When the system rolls on the life events table
    And the result is "Made a new contact"
    Then I should be prompted to define the contact
    And I should gain a contact or ally
    And this should be recorded in my character history

  Scenario: Failed survival roll
    Given I am in term resolution
    And I fail my survival roll
    When the system processes the mishap
    Then I should roll on the mishap table
    And I might receive an injury
    And I should be forced to leave the career
    And I can either start a new career or finish creation

  Scenario: Complete character creation
    Given I have finished my career terms
    And I have mustered out
    When I click "Finalize Character"
    Then I should be prompted to:
      | Detail           | Action                          |
      | Name             | Enter character name            |
      | Age              | Confirm calculated age          |
      | Background       | Write character background      |
      | Connections      | Link to other player characters |
      | Starting Gear    | Purchase with starting credits  |
    And I click "Create Character"
    Then my character should be saved
    And I should see my completed character sheet

  Scenario: Character creation with point buy
    Given I am in character creation
    And the campaign uses "Point Buy" rules
    When I reach the characteristics step
    Then I should have 27 points to distribute
    And no characteristic can be above 12 or below 3
    And I should see remaining points as I allocate
    When I finish allocation with valid points
    Then I can proceed to career selection

  Scenario: Import pre-generated character
    Given I am on the characters page
    When I click "Import Character"
    And I upload a valid character JSON file
    Then the system should validate the character data
    And I should see a preview of the character
    When I click "Confirm Import"
    Then the character should be added to my roster
    And I should see the character in my list