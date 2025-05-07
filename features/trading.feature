Feature: Trading and Commerce
  As a player
  I want to engage in trading activities
  So that I can earn credits and profit from commerce

  Background:
    Given I have a ship with cargo space
    And I have access to a starport

  Scenario: Market research
    When I research the local market
    Then I should learn about available goods
    And I should discover price ranges for goods
    And I should identify any trade restrictions

  Scenario: Purchase of trade goods
    Given I have identified goods to purchase
    When I buy trade goods
    Then I should pay the purchase price
    And the goods should be loaded into my ship's cargo hold
    And my available cargo space should decrease

  Scenario: Finding buyers
    Given I have trade goods to sell
    When I search for buyers
    Then I should make Broker skill checks
    And successful checks should identify potential buyers
    And better success should find buyers offering higher prices

  Scenario: Selling trade goods
    Given I have found buyers for my goods
    When I sell the goods
    Then I should receive payment
    And the goods should be removed from my cargo hold
    And my available cargo space should increase

  Scenario: Price negotiation
    Given I am buying or selling goods
    When I negotiate the price
    Then I should make Broker skill checks
    And successful checks should improve the price in my favor
    And failed checks may result in worse prices

  Scenario: Illegal goods trading
    Given I have illegal goods
    When I attempt to sell them
    Then I should face increased risk of legal complications
    And I should potentially earn higher profits
    And I may need to make Stealth or Deception checks

  Scenario: Trade in different worlds
    Given different worlds have different trade codes
    When I trade between worlds with complementary economies
    Then I should have opportunities for greater profits
    And certain goods should be more valuable on specific worlds

  Scenario: Trade restrictions
    Given a world has trade restrictions
    When I attempt to trade restricted goods
    Then I should face legal barriers
    And I may need special permits or licenses
    And bypassing restrictions should involve risk

  Scenario: Market fluctuations
    Given market conditions can change
    When I return to a previously visited world
    Then prices and availability of goods may have changed
    And new opportunities or challenges may have emerged

  Scenario: Bulk trading
    Given I have a large cargo capacity
    When I engage in bulk trading
    Then I should be able to negotiate volume discounts
    And I should move larger quantities of lower-value goods

  Scenario: Specialized trading
    Given I have specialized cargo handling equipment
    When I trade in specialized goods
    Then I should be able to transport goods others cannot
    And I should access markets with less competition
    And I should potentially earn higher profits

  Scenario: Trade missions
    Given someone offers a trade mission
    When I accept the mission
    Then I should be tasked with transporting specific goods
    And I should receive payment upon successful delivery
    And there may be time constraints or other complications
