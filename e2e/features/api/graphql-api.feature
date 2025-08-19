@api @regression @graphql
Feature: GraphQL API Integration
  As a client application
  I want to interact with the GraphQL API
  So that I can manage characters, campaigns, and game data efficiently

  Background:
    Given the GraphQL API is running
    And I have a valid authentication token

  @api @characters @graphql
  Scenario: Query character data via GraphQL
    Given I have a character in the system
    When I execute a GraphQL query for character data
    Then the API should return complete character information
    And all relationships should be properly resolved
    And the response should match the GraphQL schema

  @api @characters @mutations
  Scenario: Create character via GraphQL mutation
    Given I have valid character creation data
    When I execute a createCharacter mutation
    Then the character should be created successfully
    And the response should include the new character ID
    And the character should be queryable immediately

  @api @characters @mutations
  Scenario: Update character via GraphQL mutation
    Given I have an existing character
    When I execute an updateCharacter mutation
    Then the character should be updated successfully
    And the changes should be reflected in subsequent queries
    And related data should remain consistent

  @api @pagination @relay
  Scenario: Paginated character queries with Relay connection
    Given I have multiple characters in the system
    When I query characters with pagination parameters
    Then I should receive a Relay connection response
    And pageInfo should indicate pagination state
    And edges should contain character data and cursors
    And I should be able to navigate pages using cursors

  @api @skills @relationships
  Scenario: Query character skills with nested data
    Given I have a character with skills
    When I query character data including skills
    Then skills should be properly nested in the response
    And skill categories should be resolved
    And skill levels should be accurate
    And skill descriptions should be included

  @api @careers @lifepath
  Scenario: Career management via GraphQL
    Given I have a character with career history
    When I query career information
    Then I should receive complete career data
    And career terms should be ordered chronologically
    And benefits and skills should be properly associated
    And career progression should be accurate

  @api @real-time @subscriptions
  Scenario: GraphQL subscriptions for real-time updates
    Given I have an active GraphQL subscription
    When character data changes occur
    Then I should receive subscription notifications
    And the notifications should contain relevant data changes
    And the subscription should remain active across updates

  @api @errors @validation
  Scenario: GraphQL error handling and validation
    Given I make an invalid GraphQL request
    When the request contains validation errors
    Then I should receive a structured error response
    And error messages should be clear and actionable
    And the error should not cause system instability

  @api @security @authorization
  Scenario: GraphQL authorization and access control
    Given I have limited permissions
    When I attempt to access restricted data
    Then I should receive an authorization error
    And sensitive data should not be exposed
    And the error should not reveal system information

  @api @performance @optimization
  Scenario: GraphQL query performance and optimization
    Given I execute a complex nested query
    When the query requests multiple relationships
    Then the response should be returned within acceptable time
    And N+1 query problems should be avoided
    And database queries should be optimized

  @api @caching @efficiency
  Scenario: GraphQL response caching
    Given I execute the same query multiple times
    When caching is enabled
    Then subsequent requests should be faster
    And cached data should be accurate
    And cache invalidation should work correctly

  @api @batch @efficiency
  Scenario: GraphQL query batching
    Given I need to fetch multiple related entities
    When I use GraphQL batching capabilities
    Then multiple queries should be processed efficiently
    And the response should contain all requested data
    And network overhead should be minimized

  @api @introspection @schema
  Scenario: GraphQL schema introspection
    Given the GraphQL API is accessible
    When I request schema introspection
    Then I should receive the complete schema definition
    And all types should be properly documented
    And deprecated fields should be marked appropriately

  @api @mutations @transactions
  Scenario: Complex mutations with transaction handling
    Given I need to perform multiple related operations
    When I execute a complex mutation
    Then all operations should succeed or fail together
    And data consistency should be maintained
    And partial failures should be handled appropriately

  @api @data-loader @performance
  Scenario: Efficient data loading with DataLoader
    Given I query multiple characters with relationships
    When the query includes nested data
    Then related data should be loaded efficiently
    And duplicate database queries should be avoided
    And response time should be optimized

  @api @custom-scalars @types
  Scenario: Custom scalar types handling
    Given the GraphQL schema uses custom scalars
    When I query fields with custom scalar types
    Then custom scalars should be properly serialized
    And deserialization should work correctly
    And type validation should be enforced