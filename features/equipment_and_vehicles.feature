Feature: Equipment and Vehicles
  As a player
  I want to acquire and use equipment and vehicles
  So that I can enhance my character's capabilities

  Background:
    Given I have a character with credits to spend

  Scenario: Purchasing personal equipment
    When I visit a supplier
    Then I should see equipment available for purchase
    And the availability should depend on the world's technology level
    And I should be able to buy items if I have sufficient credits

  Scenario: Weapon acquisition
    When I attempt to purchase weapons
    Then the availability should depend on the world's law level
    And I may need permits for restricted weapons
    And higher law level worlds should have more restrictions

  Scenario: Armor acquisition
    When I attempt to purchase armor
    Then the availability should depend on the world's law level
    And I may need permits for military-grade armor
    And the armor should provide protection in combat

  Scenario: Equipment encumbrance
    Given I have personal equipment
    When I carry too many items
    Then I should face encumbrance penalties
    And my movement and actions may be restricted

  Scenario: Equipment maintenance
    Given I own equipment that requires maintenance
    When I fail to maintain the equipment
    Then it should malfunction or deteriorate
    And I may need to make repair checks

  Scenario: Vehicle purchase
    When I attempt to buy a vehicle
    Then the availability should depend on the world's technology level
    And I should pay the purchase price
    And I should receive ownership of the vehicle

  Scenario: Vehicle operation
    Given I own a vehicle
    When I operate the vehicle
    Then I should make appropriate skill checks
    And the vehicle should respond according to my skill level

  Scenario: Vehicle combat
    Given I am in a vehicle with weapons
    When I engage in combat
    Then special vehicle combat rules should apply
    And I should make skill checks to attack with vehicle weapons
    And damage should be applied to vehicle hit points or systems

  Scenario: Vehicle maintenance
    Given I own a vehicle
    When I perform maintenance
    Then I should make Engineering or Mechanic skill checks
    And successful maintenance should prevent malfunctions
    And failed maintenance should risk breakdowns

  Scenario: Customizing equipment
    Given I have standard equipment
    When I customize it
    Then I should make appropriate skill checks
    And successful customization should improve the equipment's capabilities
    And failed customization may damage the equipment

  Scenario: Repairing damaged equipment
    Given I have damaged equipment
    When I attempt repairs
    Then I should make appropriate skill checks
    And successful repairs should restore functionality
    And the quality of repairs should depend on my skill level

  Scenario: Using specialized equipment
    Given I have specialized equipment
    When I use it for its intended purpose
    Then I should gain advantages in relevant tasks
    And I may need specific skills to use it effectively
