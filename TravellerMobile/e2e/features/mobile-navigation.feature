@navigation @mobile @gestures
Feature: Mobile Navigation and Gestures
  As a Traveller RPG player using a mobile device
  I want intuitive mobile navigation and gesture support
  So that I can efficiently navigate the app with touch interactions

  Background:
    Given I am logged in
    And I am on the main dashboard

  @navigation @tab-bar
  Scenario: Navigate using bottom tab bar
    Given I see the main dashboard
    When I tap the "Characters" tab
    Then I should see the character list screen
    And the "Characters" tab should be highlighted
    When I tap the "Dice" tab
    Then I should see the dice roller screen
    And the "Dice" tab should be highlighted
    When I tap the "Tools" tab
    Then I should see the game tools screen
    When I tap the "Profile" tab
    Then I should see my profile screen

  @navigation @hamburger-menu
  Scenario: Access navigation through hamburger menu
    Given I am on any screen
    When I tap the hamburger menu icon
    Then I should see the navigation drawer slide in from the left
    And I should see menu options
      | Dashboard    |
      | Characters   |
      | Campaigns    |
      | Dice Roller  |
      | Trade        |
      | World Gen    |
      | Settings     |
    When I tap "Campaigns"
    Then the drawer should close
    And I should navigate to the campaigns screen

  @gestures @swipe-navigation
  Scenario: Swipe between character sheets
    Given I am viewing a character sheet
    When I swipe left
    Then I should see the next character sheet
    And I should see a page indicator at the bottom
    When I swipe right twice
    Then I should see the previous character sheet
    And the page indicator should update accordingly

  @gestures @pull-to-refresh
  Scenario: Pull to refresh character data
    Given I am on the character list screen
    When I pull down from the top of the screen
    Then I should see a refresh indicator
    And the character list should reload
    And I should see updated character data
    And the refresh indicator should disappear

  @gestures @long-press-context
  Scenario: Long press for context menus
    Given I am on the character list screen
    When I long-press on a character card
    Then I should see a context menu with options
      | Edit      |
      | Duplicate |
      | Share     |
      | Delete    |
    When I tap "Edit"
    Then I should navigate to the character editor

  @gestures @pinch-zoom
  Scenario: Pinch to zoom on character portrait
    Given I am viewing a character sheet
    And I see the character portrait
    When I pinch out on the portrait
    Then the portrait should zoom in
    And I should see zoom controls
    When I pinch in on the portrait
    Then the portrait should zoom out
    When I double-tap the portrait
    Then it should return to original size

  @gestures @swipe-to-delete
  Scenario: Swipe to delete items
    Given I am on the character equipment screen
    When I swipe left on an equipment item
    Then I should see a red "Delete" button
    When I tap the delete button
    Then I should see a confirmation dialog
    When I tap "Confirm"
    Then the item should be removed from the list

  @gestures @swipe-actions
  Scenario: Swipe actions on character list
    Given I am on the character list screen
    When I swipe right on a character card
    Then I should see quick action buttons
      | Play | Edit | Share |
    When I tap "Play"
    Then I should enter play mode for that character

  @navigation @back-button
  Scenario: Hardware back button navigation (Android)
    Given I am on a character detail screen
    When I press the hardware back button
    Then I should return to the character list
    When I press the back button again
    Then I should return to the main dashboard
    When I press the back button on the dashboard
    Then I should see an exit confirmation dialog

  @navigation @deep-linking
  Scenario: Navigate via deep links
    Given the app is running in background
    When I tap a character deep link notification
    Then the app should come to foreground
    And I should see the specific character sheet
    And the navigation stack should be properly set

  @gestures @scroll-performance
  Scenario: Smooth scrolling through long lists
    Given I am on the character list with many characters
    When I perform a fast scroll down
    Then the scrolling should be smooth
    And character cards should load progressively
    When I reach the bottom of the list
    Then I should see "Load More" option
    When I tap "Load More"
    Then additional characters should load

  @navigation @modal-gestures
  Scenario: Dismiss modals with gestures
    Given I open the dice roller modal
    When I swipe down from the top of the modal
    Then the modal should dismiss
    Given I open the character creation modal
    When I tap outside the modal area
    Then the modal should remain open
    When I swipe down on the modal header
    Then the modal should close

  @gestures @edge-swipe
  Scenario: Edge swipe navigation
    Given I am on any screen
    When I swipe right from the left edge of the screen
    Then the navigation drawer should open
    When I swipe left from the right edge of the screen
    Then any right-side panel should open (if available)

  @navigation @breadcrumb
  Scenario: Navigate using breadcrumb trail
    Given I navigate to Characters > Marcus Vale > Equipment > Weapons
    Then I should see the breadcrumb trail
    When I tap "Marcus Vale" in the breadcrumb
    Then I should return to the character overview
    And the breadcrumb should update accordingly

  @accessibility @navigation
  Scenario: Accessibility navigation support
    Given accessibility features are enabled
    When I use screen reader navigation
    Then each navigation element should be properly labeled
    And navigation order should be logical
    When I use voice control to navigate
    Then voice commands should work for main navigation items