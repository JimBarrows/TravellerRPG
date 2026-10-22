Feature: Dice Rolling System
  As a player or GM
  I want to roll dice with various modifiers
  So that I can resolve actions in the game

  Background:
    Given I am in an active campaign session
    And the dice rolling system is initialized

  Scenario: Basic 2D6 roll
    Given I need to make a basic roll
    When I click the dice roller button
    And I select "2D6" as the dice type
    And I click "Roll"
    Then the system should roll two six-sided dice
    And I should see the individual die results
    And I should see the total sum
    And the roll should appear in the campaign log

  Scenario: Skill check with modifiers
    Given I am making a skill check
    And I have Pilot-2 skill
    And I have DEX modifier of +1
    When I select "Pilot" from my skill list
    And I set difficulty to "Average (8+)"
    And I click "Roll Skill Check"
    Then the system should roll 2D6
    And add +2 for Pilot skill
    And add +1 for DEX modifier
    And show if I succeeded or failed against difficulty 8
    And display the effect (degree of success/failure)

  Scenario: Advantage and Disadvantage rolls
    Given I am making a roll with advantage
    When I select "Roll with Advantage"
    And I roll 2D6
    Then the system should roll 3D6
    And use the best 2 dice
    And show all three die results
    And highlight which dice were used

  Scenario: Boon and Bane dice
    Given I am making a roll with a Boon
    When I enable "Boon" modifier
    And I roll 2D6
    Then the system should roll 3D6
    And I can choose which 2 dice to use
    And the interface should allow die selection
    And calculate the total based on my selection

  Scenario: Chain rolling for multiple checks
    Given I need to make multiple related rolls
    When I enable "Chain Mode"
    And I set up 3 consecutive skill checks:
      | Skill      | Difficulty | Modifier |
      | Stealth    | 8+        | +1       |
      | Athletics  | 10+       | -1       |
      | Deception  | 6+        | +2       |
    And I click "Roll Chain"
    Then the system should roll each check in sequence
    And show individual results for each
    And indicate overall success or failure
    And allow stopping on first failure if configured

  Scenario: Private GM rolls
    Given I am the GM
    When I enable "Private Roll" mode
    And I roll 2D6 for an NPC
    Then only I should see the result
    And players should see "GM made a hidden roll"
    And the result should be logged privately

  Scenario: Damage rolls with dice notation
    Given I am rolling weapon damage
    And the weapon does "3D6-3" damage
    When I click "Roll Damage"
    Then the system should roll 3 six-sided dice
    And subtract 3 from the total
    And show the calculation breakdown
    And ensure minimum damage of 0

  Scenario: Initiative rolls for combat
    Given combat is starting
    And there are 4 participants:
      | Name    | DEX Modifier | Tactics |
      | Player1 | +1          | 1       |
      | Player2 | 0           | 0       |
      | NPC1    | +2          | 0       |
      | NPC2    | -1          | 2       |
    When I click "Roll Initiative for All"
    Then the system should roll 2D6 for each participant
    And add DEX modifiers
    And add Tactics skill if applicable
    And sort participants by initiative order
    And display the turn order

  Scenario: Dice history and statistics
    Given I have made multiple rolls in this session
    When I click "View Dice History"
    Then I should see a list of all my rolls
    And each entry should show:
      | Field     | Content                |
      | Time      | Timestamp of roll      |
      | Type      | Type of roll made      |
      | Result    | Dice and total         |
      | Purpose   | What the roll was for  |
    And I should see statistics:
      | Statistic       | Value                  |
      | Average Roll    | Mean of all 2D6 rolls  |
      | Natural 2s      | Count of snake eyes    |
      | Natural 12s     | Count of boxcars       |
      | Success Rate    | Percentage of successes |

  Scenario: Dice roll macros
    Given I frequently make the same rolls
    When I create a macro named "Laser Attack"
    And I set it to roll "2D6 + 3"
    And I add description "Laser Pistol attack with Dex bonus"
    And I save the macro
    Then the macro should appear in my quick rolls menu
    When I click the macro
    Then it should execute the configured roll
    And show the description in the log

  Scenario: Effect-based success levels
    Given I am using effect-based rules
    When I make a skill check against difficulty 8
    And I roll a total of 11 (including modifiers)
    Then the system should calculate effect as +3
    And display success level as "Good Success"
    And show possible outcomes based on effect:
      | Effect | Level              |
      | 6+     | Exceptional Success |
      | 3-5    | Good Success       |
      | 1-2    | Marginal Success   |
      | 0      | Marginal Failure   |
      | -1--2  | Failure           |
      | -3--5  | Bad Failure       |
      | -6+    | Exceptional Failure |

  Scenario: Untrained skill penalty
    Given I am attempting a skill I don't have
    When I select "Engineering" skill check
    And I have no ranks in Engineering
    Then the system should apply -3 untrained penalty
    And show "Untrained Attempt" warning
    And calculate the roll with the penalty