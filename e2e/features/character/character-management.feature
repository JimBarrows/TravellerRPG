@regression @character @management @cross-platform
Feature: Character Management
  As a user with created characters
  I want to view, edit, and manage my characters
  So that I can maintain and develop them for gameplay

  Background:
    Given the application is running
    And I am logged in as a verified user
    And I have at least one created character

  @ui @desktop @character-list
  Scenario: View character list on desktop
    Given I am on the character list page
    Then I should see all my characters
    And each character should show basic information
    And I should see character portraits
    And I should be able to sort characters
    And I should be able to filter characters

  @ui @mobile @character-list
  Scenario: View character list on mobile
    Given I am on the character list page on mobile
    Then I should see all my characters in mobile layout
    And the list should be responsive
    And I should be able to swipe through characters
    And search functionality should work on mobile

  @ui @character-sheet
  Scenario: View detailed character sheet
    Given I select a character from my list
    When I view the character sheet
    Then I should see all character details
    And characteristics should be displayed correctly
    And skills should be organized by category
    And equipment should be listed appropriately
    And career history should be visible

  @ui @character-editing
  Scenario: Edit character information
    Given I am viewing a character sheet
    When I click edit mode
    Then editable fields should become active
    When I modify character details
    And I save the changes
    Then the character should be updated
    And changes should be persisted

  @api @character-retrieval
  Scenario: Retrieve character via API
    Given I have a character ID
    When I make a character retrieval request
    Then the API should return complete character data
    And all relationships should be included
    And the data should match the UI display

  @api @character-update
  Scenario: Update character via API
    Given I have a character to update
    When I make a character update request with changes
    Then the API should accept the changes
    And the character should be updated in the database
    And the changes should be reflected in the UI

  @character-advancement
  Scenario: Character skill advancement
    Given I have a character with experience points
    When I advance a skill
    Then the skill level should increase
    And experience points should be deducted
    And the character sheet should reflect changes
    And advancement should follow game rules

  @equipment @inventory
  Scenario: Equipment management
    Given I am viewing character equipment
    When I add new equipment
    Then it should appear in the inventory
    When I equip an item
    Then it should be marked as equipped
    And character stats should be updated if applicable
    When I remove equipment
    Then it should be removed from inventory

  @character-deletion
  Scenario: Character deletion with confirmation
    Given I am on the character list
    When I select delete for a character
    Then I should see a confirmation dialog
    When I confirm the deletion
    Then the character should be removed
    And it should no longer appear in my list
    And the deletion should be permanent

  @character-export
  Scenario: Export character data
    Given I have a character to export
    When I select export options
    Then I should be able to download character data
    And the export should be in a standard format
    And all character information should be included

  @character-import
  Scenario: Import character data
    Given I have a valid character export file
    When I import the character
    Then a new character should be created
    And all data should be preserved
    And the character should appear in my list

  @permissions @character-sharing
  Scenario: Character sharing permissions
    Given I want to share a character with a GM
    When I set sharing permissions
    Then the character should be viewable by the GM
    And the GM should have appropriate access levels
    And I should retain ownership rights

  @cross-platform @sync
  Scenario: Character data synchronization
    Given I edit a character on desktop
    When I switch to mobile platform
    Then the changes should be synchronized
    And the character should show updated information
    When I make changes on mobile
    Then desktop should reflect the updates

  @offline @mobile
  Scenario: Offline character viewing
    Given I have characters loaded on mobile
    When I go offline
    Then I should still be able to view characters
    And character sheets should remain accessible
    And I should see an offline indicator
    When I come back online
    Then any changes should synchronize

  @performance @loading
  Scenario: Character loading performance
    Given I have multiple characters
    When I access the character list
    Then the list should load within 2 seconds
    When I view a character sheet
    Then it should load within 3 seconds
    And images should load progressively

  @search @filtering
  Scenario: Character search and filtering
    Given I have multiple characters
    When I search for a character by name
    Then matching characters should be displayed
    When I filter by career or level
    Then appropriate characters should be shown
    And filters should be combinable