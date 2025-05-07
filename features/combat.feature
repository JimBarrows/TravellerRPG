Feature: Combat
  As a player
  I want to engage in combat with my character
  So that I can overcome hostile encounters

  Background:
    Given I have a character with combat skills
    And there are opponents to fight

  Scenario: Initiative determination
    When combat begins
    Then initiative should be determined by Dexterity
    And characters should act in initiative order

  Scenario: Basic ranged attack
    Given I have a ranged weapon
    When I attack an opponent
    Then I should roll 2d6 and add my weapon skill
    And I should hit if the total equals or exceeds the target number
    And I should roll for damage if I hit

  Scenario: Basic melee attack
    Given I have a melee weapon
    When I attack an opponent in close combat
    Then I should roll 2d6 and add my melee skill
    And I should hit if the total equals or exceeds the target number
    And I should roll for damage if I hit

  Scenario: Damage application
    Given I have hit an opponent
    When I roll for damage
    Then the damage should be applied to the opponent's physical characteristics
    And the opponent should be incapacitated if any characteristic reaches 0

  Scenario: Using cover
    Given there is cover available
    When I take cover
    Then attacks against me should have a penalty
    And I should be harder to hit

  Scenario: Surprise in combat
    Given one side is unaware of the other
    When combat begins
    Then the surprised side should not act in the first round
    And the surprising side should gain initiative

  Scenario: Automatic weapon fire
    Given I have an automatic weapon
    When I fire on automatic
    Then I should make multiple attack rolls
    And I should use more ammunition
    And I should potentially hit multiple times

  Scenario: Explosive weapons
    Given I have an explosive weapon
    When I use the explosive weapon
    Then damage should be applied to all targets in the blast radius
    And the damage should decrease with distance from the blast center

  Scenario: Armor protection
    Given I am wearing armor
    When I am hit by an attack
    Then my armor should reduce the damage taken
    And some weapons may penetrate armor more effectively than others

  Scenario: Healing injuries
    Given I have taken damage in combat
    When I receive medical treatment
    Then some of my injuries should heal
    And my physical characteristics should increase back toward their normal values

  Scenario: Combat in different environments
    Given combat takes place in a special environment
    When I take actions in that environment
    Then environmental factors should affect combat
    And special rules may apply based on the environment
