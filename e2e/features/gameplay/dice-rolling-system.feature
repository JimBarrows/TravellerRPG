@smoke @regression @gameplay @dice @cross-platform
Feature: Dice Rolling System
  As a player or Game Master
  I want a comprehensive dice rolling system
  So that I can make skill checks, combat rolls, and other game mechanics

  Background:
    Given the application is running
    And I am logged in as a verified user

  @ui @basic-dice
  Scenario: Basic dice rolling interface
    Given I am on the dice rolling page
    When I select a dice type (d6, d10, d20, etc.)
    And I specify the number of dice
    And I roll the dice
    Then I should see the individual roll results
    And I should see the total sum
    And the results should be within expected ranges

  @skill-checks @character-integration
  Scenario: Character skill check with modifiers
    Given I have a character with skills loaded
    When I make a skill check for "Pilot"
    Then the system should automatically add skill modifiers
    And characteristic bonuses should be applied
    And the difficulty should be selectable
    And the success/failure should be calculated

  @combat @damage-rolls
  Scenario: Combat damage rolling
    Given I am in a combat scenario
    When I select a weapon for attack
    And I roll for damage
    Then the weapon's damage dice should be used
    And weapon modifiers should be applied
    And armor should be calculated if applicable
    And final damage should be determined

  @advantage @disadvantage
  Scenario: Advantage and disadvantage mechanics
    Given I am making a skill check
    When I have advantage on the roll
    Then I should roll multiple dice
    And the system should take the better result
    When I have disadvantage
    Then I should take the worse result
    And this should be clearly indicated

  @api @dice-validation
  Scenario: Dice rolling via API
    Given I have a valid dice roll request
    When I make a dice roll API call
    Then the API should return random results
    And results should be within valid ranges
    And the response should include modifiers
    And the roll should be logged for session history

  @random @fairness
  Scenario: Dice randomness and fairness verification
    Given I roll the same dice combination 100 times
    When I analyze the results
    Then the distribution should be reasonably random
    And each possible outcome should occur
    And no bias should be detectable
    And the random seed should change between sessions

  @history @logging
  Scenario: Dice roll history and logging
    Given I make multiple dice rolls
    When I check my roll history
    Then all rolls should be logged with timestamps
    And I should see the context for each roll
    And results should be searchable
    And history should persist between sessions

  @real-time @multiplayer
  Scenario: Shared dice rolls in campaign sessions
    Given I am in a campaign session with other players
    When I make a dice roll
    Then all participants should see the roll result
    And the roll should appear in the shared log
    And the timestamp should be synchronized
    And the roller's identity should be visible

  @automation @game-rules
  Scenario: Automated game rule enforcement
    Given I am making a characteristic check
    When I roll 2d6 for the check
    Then the system should apply the standard difficulty
    And task modifiers should be suggested
    And success thresholds should be calculated
    And the result should be interpreted correctly

  @custom-dice @homebrew
  Scenario: Custom dice and homebrew rules
    Given I want to use custom dice mechanics
    When I configure custom dice types
    And I set up custom modifiers
    Then the system should support my custom rules
    And calculations should work correctly
    And other players should see the custom results

  @mobile @touch-interface
  Scenario: Mobile dice rolling experience
    Given I am using the mobile interface
    When I access the dice rolling feature
    Then the interface should be touch-friendly
    And I should be able to shake to roll (if supported)
    And results should be clearly visible on small screens
    And performance should be smooth

  @accessibility @screen-readers
  Scenario: Accessible dice rolling
    Given I am using assistive technology
    When I make dice rolls
    Then results should be announced clearly
    And controls should be keyboard navigable
    And visual results should have text alternatives
    And roll context should be clearly communicated

  @performance @responsiveness
  Scenario: Dice rolling performance
    Given I am making rapid dice rolls
    When I roll dice multiple times quickly
    Then each roll should complete within 100ms
    And the interface should remain responsive
    And results should be accurate despite rapid input
    And no rolls should be lost or duplicated

  @batch-rolling @efficiency
  Scenario: Batch dice rolling for efficiency
    Given I need to roll multiple dice of the same type
    When I specify a batch roll (e.g., 5 attacks)
    Then all rolls should be executed simultaneously
    And individual results should be displayed
    And totals should be calculated correctly
    And the process should be faster than individual rolls

  @probability @statistics
  Scenario: Probability calculator and statistics
    Given I want to understand roll probabilities
    When I select a dice combination and modifiers
    Then I should see probability distributions
    And success chances should be calculated
    And statistical information should be accurate
    And I should see comparative analysis options

  @cross-platform @synchronization
  Scenario: Cross-platform dice roll synchronization
    Given I make a dice roll on desktop
    When I switch to mobile platform
    Then the roll should appear in my history
    And any ongoing calculations should be preserved
    When I participate in the same session
    Then rolls should be synchronized across platforms