@character-creation @mobile
Feature: Mobile Character Creation
  As a Traveller RPG player on mobile
  I want to create characters using mobile-optimized interfaces
  So that I can easily build characters while on the go

  Background:
    Given I am logged in
    And I am on the main dashboard

  @character-creation @core
  Scenario: Create new character with mobile wizard
    Given I am on the character list screen
    When I tap the "Create Character" button
    Then I should see the character creation wizard
    And I should see the progress indicator showing "1 of 7"
    And I should see "Basic Information" step

  @character-creation @basic-info
  Scenario: Fill basic character information
    Given I am in the character creation wizard
    And I am on the "Basic Information" step
    When I fill in the character details
      | field      | value        |
      | name       | Marcus Vale  |
      | age        | 32           |
      | gender     | Male         |
      | homeworld  | Terra        |
    And I tap "Next"
    Then I should see the "Characteristics" step
    And the progress indicator should show "2 of 7"

  @character-creation @characteristics
  Scenario: Roll characteristics using mobile dice interface
    Given I am on the "Characteristics" step
    When I tap "Roll All Characteristics"
    Then I should see animated dice rolling
    And characteristic values should be generated
      | STR | 8  |
      | DEX | 12 |
      | END | 10 |
      | INT | 11 |
      | EDU | 9  |
      | SOC | 7  |
    And I should see the total characteristic modifier
    When I tap "Next"
    Then I should see the "Background" step

  @character-creation @background @swipe
  Scenario: Select background with swipe navigation
    Given I am on the "Background" step
    When I swipe left to browse backgrounds
    Then I should see different background options
    When I swipe right to go back
    And I tap "Noble" background
    Then the background should be selected
    And I should see background benefits displayed
    When I tap "Next"
    Then I should see the "Career" step

  @character-creation @career @scroll
  Scenario: Choose career with scrollable list
    Given I am on the "Career" step
    When I scroll down through the career list
    And I tap "Navy" career
    Then I should see career description
    And I should see service skills listed
    When I tap "Select Career"
    Then the career should be selected
    And I should see "Terms of Service" section

  @character-creation @terms @mobile-input
  Scenario: Complete service terms on mobile
    Given I have selected "Navy" career
    When I enter "3" terms of service
    And I tap each term to see survival rolls
    Then I should see survival roll results
    And I should see skill improvements
    And I should see rank progression
    When I complete all terms
    And I tap "Next"
    Then I should see the "Skills" step

  @character-creation @skills @mobile-ui
  Scenario: Allocate skills using mobile interface
    Given I am on the "Skills" step
    And I have skill points to allocate
    When I tap the "+" button next to "Pilot"
    Then the skill level should increase
    And available points should decrease
    When I long-press the "+" button next to "Engineering"
    Then multiple skill levels should be added quickly
    And I should see updated skill totals

  @character-creation @equipment @mobile-selection
  Scenario: Select equipment with mobile-optimized interface
    Given I am on the "Equipment" step
    When I browse equipment categories
    And I tap "Weapons" category
    Then I should see weapon options in a mobile-friendly grid
    When I tap "Laser Rifle"
    Then it should be added to my equipment
    And I should see weight and cost updated
    When I swipe to "Armor" category
    And I select "Cloth Armor"
    Then my equipment list should be complete

  @character-creation @portrait @mobile-camera
  Scenario: Add character portrait using mobile camera
    Given I am on the "Portrait" step
    When I tap "Take Photo"
    And I grant camera permissions
    And I take a photo
    Then the photo should be set as character portrait
    When I tap "Use Photo"
    Then I should proceed to the review step

  @character-creation @review @completion
  Scenario: Review and save character
    Given I am on the "Review" step
    Then I should see all character details
      | Name         | Marcus Vale |
      | Career       | Navy        |
      | Terms        | 3           |
      | Rank         | Lieutenant  |
    When I scroll down to see all information
    And I tap "Save Character"
    Then I should see "Character created successfully"
    And I should return to the character list
    And I should see "Marcus Vale" in my character list

  @character-creation @validation @mobile
  Scenario: Form validation during character creation
    Given I am on the "Basic Information" step
    When I leave the name field empty
    And I tap "Next"
    Then I should see an error "Character name is required"
    And I should remain on the current step
    When I enter a name that is too long
    Then I should see "Name must be less than 50 characters"
    And the "Next" button should be disabled

  @character-creation @back-navigation @mobile
  Scenario: Navigate backward through creation steps
    Given I am on the "Skills" step
    When I tap the back arrow
    Then I should see the "Career" step
    And my previous selections should be preserved
    When I tap back again
    Then I should see the "Background" step
    And all form data should be maintained