Feature: Skills and Task Resolution
  As a player
  I want to use my character's skills to perform tasks
  So that I can overcome challenges in the game

  Background:
    Given I have a character with skills

  Scenario: Basic skill check
    When I attempt a task using a skill
    Then I should roll 2d6 and add my skill level
    And I should succeed if the total equals or exceeds the difficulty number

  Scenario: Unskilled task attempt
    Given I do not have the required skill for a task
    When I attempt the task
    Then I should roll 2d6 with a penalty
    And the task should be more difficult to succeed

  Scenario: Task with characteristic modifier
    When I attempt a task that relies on a characteristic
    Then I should add or subtract a modifier based on my characteristic value
    And the modifier should affect my chance of success

  Scenario: Difficult task
    When I attempt a task with increased difficulty
    Then the difficulty number should be higher
    And I should need a higher roll to succeed

  Scenario: Simple task
    When I attempt a task with reduced difficulty
    Then the difficulty number should be lower
    And I should need a lower roll to succeed

  Scenario: Task with time pressure
    Given a task needs to be completed quickly
    When I attempt the task under time pressure
    Then I should receive a penalty to my roll
    And I should need to roll higher to succeed

  Scenario: Extended task
    Given a task requires multiple steps to complete
    When I attempt the extended task
    Then I should make multiple skill checks
    And my overall success should depend on the number of successful checks

  Scenario: Opposed task
    Given another character is opposing my action
    When I attempt an opposed task
    Then both characters should make skill checks
    And the character with the higher result should succeed

  Scenario: Task with tools or equipment
    Given I have appropriate tools or equipment for a task
    When I attempt the task
    Then I should receive a bonus to my skill check
    And my chance of success should increase

  Scenario: Critical success
    When I roll a natural 12 on a skill check
    Then I should achieve a critical success
    And I should receive additional benefits beyond normal success

  Scenario: Critical failure
    When I roll a natural 2 on a skill check
    Then I should suffer a critical failure
    And I should face negative consequences beyond normal failure
