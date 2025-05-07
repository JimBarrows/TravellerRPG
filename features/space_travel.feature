Feature: Space Travel and Spacecraft
  As a player
  I want to travel through space with my ship
  So that I can explore the universe and engage in space adventures

  Background:
    Given I have access to a spacecraft

  Scenario: Ship operations
    When I operate the ship's systems
    Then I should use appropriate skills for each system
    And the ship should respond according to my skill checks

  Scenario: Jump drive calculation
    Given I want to travel to another star system
    When I calculate a jump route
    Then I should determine the distance in parsecs
    And I should verify my ship's jump drive capability
    And I should ensure I have enough fuel for the jump

  Scenario: Jump travel
    Given I have calculated a valid jump route
    When I initiate a jump
    Then the ship should enter jump space
    And the journey should take approximately one week regardless of distance
    And I should arrive at the destination system

  Scenario: Misjump
    Given I am attempting a jump
    When the jump calculations are incorrect or the drive malfunctions
    Then a misjump should occur
    And the ship should arrive at an unexpected location
    And the ship or crew may suffer damage or complications

  Scenario: Refueling operations
    Given my ship needs fuel
    When I approach a gas giant or refueling station
    Then I should be able to refuel my ship
    And I may need to pay fees at a station
    And I may need to make skill checks for gas giant skimming

  Scenario: Ship maintenance
    Given my ship requires regular maintenance
    When I perform maintenance tasks
    Then I should make Engineering skill checks
    And successful maintenance should prevent malfunctions
    And failed maintenance should risk system failures

  Scenario: Space encounters
    When I travel through a star system
    Then I may encounter other ships or phenomena
    And I should be able to communicate, evade, or engage with encounters

  Scenario: Ship sensors and detection
    When I use the ship's sensors
    Then I should make Electronics or Sensors skill checks
    And successful checks should provide information about nearby objects
    And the information detail should depend on the success level

  Scenario: Ship-to-ship communication
    Given there is another ship in range
    When I attempt to communicate
    Then I should make appropriate skill checks
    And successful communication should allow information exchange

  Scenario: Basic ship combat
    Given there is a hostile ship
    When combat begins
    Then initiative should be determined
    And ships should take actions in initiative order

  Scenario: Ship weapon fire
    Given my ship has weapons
    When I fire at an enemy ship
    Then I should make Gunnery skill checks
    And hits should apply damage to the target ship

  Scenario: Ship damage control
    Given my ship has taken damage
    When I attempt damage control
    Then I should make Engineering skill checks
    And successful checks should repair some damage
    And critical systems should have priority

  Scenario: Ship boarding actions
    Given ships are in close proximity
    When I attempt to board another vessel
    Then special combat rules should apply
    And both crews should engage in personal combat
