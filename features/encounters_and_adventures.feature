Feature: Encounters and Adventures
  As a player or referee
  I want to create and resolve encounters and adventures
  So that I can experience exciting stories in the Traveller universe

  Background:
    Given I have characters ready for adventure

  Scenario: Random encounter generation
    When I need to generate a random encounter
    Then I should roll on appropriate encounter tables
    And the encounter should be appropriate for the location
    And the encounter should provide interesting interaction opportunities

  Scenario: Patron encounters
    When I meet a potential patron
    Then the patron should offer a mission or job
    And the mission should have clear objectives
    And there should be a reward for completion

  Scenario: Investigation encounters
    When I need to gather information
    Then I should make appropriate skill checks
    And successful checks should reveal clues
    And the information should help advance the adventure

  Scenario: Social encounters
    When I interact with NPCs
    Then I should make social skill checks as appropriate
    And NPC reactions should depend on my approach and skill results
    And successful interactions should provide benefits

  Scenario: Wilderness exploration
    When I explore wilderness areas
    Then I should face environmental challenges
    And I should make survival skill checks
    And I may discover points of interest or resources

  Scenario: Urban exploration
    When I explore urban environments
    Then I should navigate city layouts
    And I should interact with local services and facilities
    And I may encounter law enforcement based on my actions

  Scenario: Ancient site exploration
    When I discover an ancient site
    Then I should find alien artifacts or technology
    And I should make skill checks to understand discoveries
    And there may be hazards protecting valuable finds

  Scenario: Derelict ship exploration
    When I board a derelict ship
    Then I should explore the ship's compartments
    And I should discover what happened to the crew
    And I may find salvageable equipment or cargo

  Scenario: Adventure rewards
    Given I have completed adventure objectives
    When I claim my rewards
    Then I should receive payment or other benefits
    And I may gain reputation or contacts
    And I may acquire new equipment or opportunities

  Scenario: Adventure complications
    Given I am on an adventure
    When unexpected complications arise
    Then I should adapt to changing circumstances
    And the adventure should become more challenging
    And I may need to revise my objectives

  Scenario: Multi-session adventure
    Given I am involved in a complex adventure
    When the adventure spans multiple sessions
    Then there should be clear milestones and progress tracking
    And the story should develop over time
    And my character should grow through the experience

  Scenario: Adventure resolution
    Given I have reached the climax of an adventure
    When I resolve the final challenge
    Then the outcome should depend on my choices and actions
    And there should be consequences for the game world
    And new adventure hooks may emerge from the resolution
