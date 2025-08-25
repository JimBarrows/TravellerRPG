Feature: Cucumber Runtime Test
  As a developer
  I want to verify Cucumber is working with Spring Boot
  So that I can run BDD scenarios

  Scenario: Simple context loading test
    Given the Spring application context is available
    When I run a simple test scenario
    Then the test should pass without configuration errors