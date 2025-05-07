Feature: World Generation
  As a referee
  I want to generate detailed worlds and star systems
  So that I can create a rich setting for adventures

  Background:
    Given I am creating a new star system

  Scenario: Basic world generation
    When I generate a new world
    Then I should determine the world's physical characteristics
    And I should establish the world's atmosphere type
    And I should determine the world's hydrographic percentage
    And I should establish the world's population
    And I should determine the world's government type
    And I should establish the world's law level
    And I should determine the world's technology level

  Scenario: Starport assignment
    When I assign a starport to a world
    Then I should determine the starport class
    And the starport facilities should correspond to its class
    And the available services should match the starport class

  Scenario: Trade codes assignment
    Given I have determined a world's characteristics
    When I assign trade codes
    Then the trade codes should reflect the world's physical and social characteristics
    And the trade codes should influence available goods and prices

  Scenario: Gas giant presence
    When I determine gas giant presence
    Then I should roll to see if gas giants exist in the system
    And gas giants should affect refueling options for ships

  Scenario: Travel zones assignment
    When I assign a travel zone to a world
    Then the zone should be based on danger level
    And amber zones should indicate caution is advised
    And red zones should indicate travel is forbidden

  Scenario: World names generation
    When I name a newly generated world
    Then the name should be appropriate for the setting
    And the name should be recorded in the world data

  Scenario: System position determination
    When I determine a world's position in the system
    Then I should establish its orbit around the primary star
    And the position should affect the world's temperature

  Scenario: Star type determination
    When I determine the system's star type
    Then I should establish the spectral class and characteristics
    And the star type should influence the system's habitable zone

  Scenario: Satellite generation
    When I generate satellites for a world
    Then I should determine the number of significant moons
    And I should establish basic characteristics for each moon

  Scenario: Detailed world mapping
    Given I have generated a world's basic characteristics
    When I create a detailed map
    Then I should place continents and oceans according to hydrographic percentage
    And I should place major terrain features
    And I should locate major population centers

  Scenario: Cultural details generation
    Given I have established a world's social characteristics
    When I generate cultural details
    Then I should create information about customs and practices
    And I should establish notable cultural features
    And the culture should be consistent with the world's characteristics

  Scenario: Points of interest generation
    When I generate points of interest for a world
    Then I should create locations for potential adventures
    And I should establish what makes these locations notable
    And the points of interest should provide hooks for scenarios
