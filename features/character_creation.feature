Feature: Character Creation
  As a player
  I want to create a character for the Traveller RPG
  So that I can start playing the game

  Background:
    Given I am on the character creation page

  Scenario: Generate basic characteristics
    When I choose to generate characteristics
    Then I should see values for Strength, Dexterity, Endurance, Intelligence, Education, and Social Standing
    And each characteristic should be between 2 and 12

  Scenario: Choose a homeworld
    When I choose a homeworld
    Then I should receive appropriate homeworld skills
    And my character's background should reflect the homeworld

  Scenario: Select a career
    When I select a career
    Then I should see the career's qualification requirements
    And I should see the career's skills and training tables

  Scenario: Attempt career qualification
    Given I have selected a career
    When I roll for qualification
    Then I should either qualify for the career or be drafted into the military

  Scenario: Career advancement
    Given I have qualified for a career
    When I complete a term in the career
    Then I should gain skills and benefits based on the career tables
    And I should have the option to continue in the career or muster out

  Scenario: Mustering out
    Given I have completed at least one term in a career
    When I choose to muster out
    Then I should receive mustering out benefits
    And my character should be ready for play

  Scenario: Character aging
    Given I have completed multiple terms in careers
    When my character reaches an age threshold
    Then I should make aging rolls
    And my physical characteristics may be reduced

  Scenario: Character death during creation
    Given I am in the career phase
    When I roll a survival check and fail
    Then my character should die
    And I should be prompted to create a new character

  Scenario: Character retirement
    Given I have completed multiple terms in careers
    When I choose to retire my character
    Then I should receive retirement benefits
    And my character should be ready for play
