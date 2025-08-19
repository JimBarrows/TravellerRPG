@smoke @regression @character @cross-platform
Feature: Character Creation Flow
  As a logged-in user
  I want to create new Traveller characters
  So that I can play in campaigns and adventures

  Background:
    Given the application is running
    And I am logged in as a verified user
    And I am on the character creation page

  @ui @desktop @character-creation
  Scenario: Complete character creation wizard on desktop
    Given I start the character creation wizard
    When I complete the basic information step
    And I roll characteristics
    And I select a homeworld
    And I choose a career path
    And I complete career terms
    And I select skills
    And I choose equipment
    And I add a portrait
    And I review and confirm the character
    Then my character should be created successfully
    And the character should be saved to the database
    And I should see the character in my character list

  @ui @mobile @character-creation
  Scenario: Complete character creation wizard on mobile
    Given I start the character creation wizard on mobile
    When I complete the basic information step on mobile
    And I roll characteristics on mobile
    And I select a homeworld on mobile
    And I choose a career path on mobile
    And I complete career terms on mobile
    And I select skills on mobile
    And I choose equipment on mobile
    And I add a portrait on mobile
    And I review and confirm the character on mobile
    Then my character should be created successfully on mobile
    And the character should be saved to the database
    And I should see the character in my character list on mobile

  @api @character-creation
  Scenario: Character creation via API
    Given I have valid character creation data
    When I make a character creation request to the API
    Then the API should return the created character
    And the character should be persisted in the database
    And the character should have all required fields

  @validation @ui
  Scenario Outline: Character creation form validation
    Given I am in the character creation wizard
    When I fill in "<field>" with "<value>"
    And I try to proceed to the next step
    Then I should see a validation error for "<field>"
    And I should not be able to proceed

    Examples:
      | field       | value     |
      | name        |           |
      | name        | A         |
      | age         | 0         |
      | age         | 200       |
      | gender      |           |

  @characteristics @dice-rolling
  Scenario: Characteristic generation and modification
    Given I am on the characteristics step
    When I roll characteristics
    Then all six characteristics should have values
    And characteristics should be within valid ranges (3-18)
    When I apply racial modifiers
    Then characteristics should be updated correctly
    And I should see the modified values

  @career @lifepath
  Scenario: Career selection and qualification
    Given I have completed characteristics
    When I select a career
    And I attempt to qualify for the career
    Then the qualification should be rolled automatically
    If I qualify
    Then I should proceed to career terms
    If I don't qualify
    Then I should be offered alternative careers or draft

  @career @terms
  Scenario: Career term completion
    Given I have qualified for a career
    When I complete a career term
    Then I should gain skills based on career tables
    And I should age appropriately
    And I should have survival and advancement rolls
    When I choose to continue or muster out
    Then the appropriate benefits should be applied

  @skills @advancement
  Scenario: Skill selection and advancement
    Given I am selecting skills during career terms
    When I choose skills from available tables
    Then the skills should be added to my character
    And skill levels should be tracked correctly
    And I should not exceed maximum skill levels

  @equipment @benefits
  Scenario: Equipment and benefit selection
    Given I am mustering out of careers
    When I receive mustering out benefits
    Then I should be able to choose between cash and benefits
    And equipment should be added to my inventory
    And credits should be tracked correctly

  @portrait @customization
  Scenario: Character portrait and customization
    Given I am on the portrait step
    When I upload a custom portrait
    Then the portrait should be validated and resized
    And the portrait should be associated with my character
    When I select appearance options
    Then the character description should be updated

  @review @validation
  Scenario: Character review and final validation
    Given I have completed all creation steps
    When I review my character
    Then I should see a complete character summary
    And all required fields should be populated
    And game rules should be validated
    When I confirm character creation
    Then the character should be finalized and saved

  @performance
  Scenario: Character creation performance
    Given I am creating a character
    When I complete each step of the wizard
    Then each step should load within 2 seconds
    And dice rolls should complete instantly
    And character saving should complete within 3 seconds

  @cross-platform @data-sync
  Scenario: Character creation data synchronization
    Given I start character creation on desktop
    When I partially complete the character
    And I switch to mobile platform
    Then my progress should be synchronized
    And I should be able to continue where I left off
    When I complete the character on mobile
    Then the character should be available on all platforms