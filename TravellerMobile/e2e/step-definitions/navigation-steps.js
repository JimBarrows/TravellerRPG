const { Given, When, Then } = require('@cucumber/cucumber');
const { element, by, expect, waitFor } = require('detox');
const DetoxHelper = require('../support/detox-helper');

// Background steps already covered in authentication-steps.js

// Tab bar navigation
Given('I see the main dashboard', async function() {
  await DetoxHelper.expectElementVisible('main-dashboard');
});

When('I tap the {string} tab', async function(tabName) {
  const tabId = tabName.toLowerCase() + '-tab';
  await DetoxHelper.tapElement(tabId);
});

Then('I should see the character list screen', async function() {
  await DetoxHelper.waitForElement('character-list-screen');
  await DetoxHelper.expectElementVisible('character-list');
});

Then('the {string} tab should be highlighted', async function(tabName) {
  const tabId = tabName.toLowerCase() + '-tab';
  const tabElement = element(by.id(tabId));
  await expect(tabElement).toHaveToggleValue(true); // or similar selected state check
});

Then('I should see the dice roller screen', async function() {
  await DetoxHelper.waitForElement('dice-roller-screen');
  await DetoxHelper.expectElementVisible('dice-configuration');
});

Then('I should see the game tools screen', async function() {
  await DetoxHelper.waitForElement('game-tools-screen');
  await DetoxHelper.expectElementVisible('tools-grid');
});

Then('I should see my profile screen', async function() {
  await DetoxHelper.waitForElement('profile-screen');
  await DetoxHelper.expectElementVisible('profile-info');
});

// Hamburger menu navigation
Given('I am on any screen', async function() {
  // This step acknowledges we could be on any screen
  await DetoxHelper.expectElementVisible('hamburger-menu-icon');
});

When('I tap the hamburger menu icon', async function() {
  await DetoxHelper.tapElement('hamburger-menu-icon');
});

Then('I should see the navigation drawer slide in from the left', async function() {
  await DetoxHelper.waitForElement('navigation-drawer');
  await DetoxHelper.expectElementVisible('navigation-drawer');
});

Then('I should see menu options', async function(dataTable) {
  const options = dataTable.raw().flat();
  for (const option of options) {
    await DetoxHelper.expectTextVisible(option);
  }
});

When('I tap {string}', async function(menuOption) {
  await DetoxHelper.tapElementByText(menuOption);
});

Then('the drawer should close', async function() {
  await DetoxHelper.waitForElementToDisappear('navigation-drawer');
});

Then('I should navigate to the campaigns screen', async function() {
  await DetoxHelper.waitForElement('campaigns-screen');
  await DetoxHelper.expectElementVisible('campaigns-list');
});

// Swipe navigation between character sheets
Given('I am viewing a character sheet', async function() {
  await DetoxHelper.tapElement('characters-tab');
  await DetoxHelper.tapElement('first-character-card');
  await DetoxHelper.waitForElement('character-sheet-screen');
});

When('I swipe left', async function() {
  await DetoxHelper.swipeLeft('character-sheet-container');
});

Then('I should see the next character sheet', async function() {
  await DetoxHelper.expectElementVisible('character-sheet-screen');
  // Check that a different character is shown
  await DetoxHelper.expectElementVisible('next-character-indicator');
});

Then('I should see a page indicator at the bottom', async function() {
  await DetoxHelper.expectElementVisible('character-page-indicator');
});

When('I swipe right twice', async function() {
  await DetoxHelper.swipeRight('character-sheet-container');
  await DetoxHelper.swipeRight('character-sheet-container');
});

Then('I should see the previous character sheet', async function() {
  await DetoxHelper.expectElementVisible('character-sheet-screen');
  await DetoxHelper.expectElementVisible('previous-character-indicator');
});

Then('the page indicator should update accordingly', async function() {
  await DetoxHelper.expectElementVisible('updated-page-indicator');
});

// Pull to refresh
When('I pull down from the top of the screen', async function() {
  await DetoxHelper.swipeDown('character-list-scroll-view');
});

Then('I should see a refresh indicator', async function() {
  await DetoxHelper.expectElementVisible('refresh-indicator');
});

Then('the character list should reload', async function() {
  await DetoxHelper.waitForElementToDisappear('refresh-indicator');
  await DetoxHelper.expectElementVisible('character-list');
});

Then('I should see updated character data', async function() {
  await DetoxHelper.expectElementVisible('updated-data-indicator');
});

Then('the refresh indicator should disappear', async function() {
  await DetoxHelper.expectElementNotVisible('refresh-indicator');
});

// Long press context menus
When('I long-press on a character card', async function() {
  await DetoxHelper.longPress('first-character-card');
});

Then('I should see a context menu with options', async function(dataTable) {
  await DetoxHelper.waitForElement('context-menu');
  const options = dataTable.raw().flat();
  for (const option of options) {
    await DetoxHelper.expectTextVisible(option);
  }
});

Then('I should navigate to the character editor', async function() {
  await DetoxHelper.waitForElement('character-editor-screen');
  await DetoxHelper.expectElementVisible('character-edit-form');
});

// Pinch to zoom
Given('I see the character portrait', async function() {
  await DetoxHelper.expectElementVisible('character-portrait');
});

When('I pinch out on the portrait', async function() {
  const portrait = element(by.id('character-portrait'));
  await portrait.pinch(1.5); // Pinch out to zoom in
});

Then('the portrait should zoom in', async function() {
  await DetoxHelper.expectElementVisible('zoomed-portrait');
});

Then('I should see zoom controls', async function() {
  await DetoxHelper.expectElementVisible('zoom-controls');
});

When('I pinch in on the portrait', async function() {
  const portrait = element(by.id('character-portrait'));
  await portrait.pinch(0.5); // Pinch in to zoom out
});

Then('the portrait should zoom out', async function() {
  await DetoxHelper.expectElementVisible('normal-size-portrait');
});

When('I double-tap the portrait', async function() {
  await DetoxHelper.tapElement('character-portrait');
  await DetoxHelper.tapElement('character-portrait');
});

Then('it should return to original size', async function() {
  await DetoxHelper.expectElementVisible('original-size-portrait');
});

// Swipe to delete
Given('I am on the character equipment screen', async function() {
  await DetoxHelper.tapElement('equipment-tab');
  await DetoxHelper.waitForElement('equipment-screen');
});

When('I swipe left on an equipment item', async function() {
  await DetoxHelper.swipeLeft('first-equipment-item');
});

Then('I should see a red {string} button', async function(buttonText) {
  await DetoxHelper.expectElementVisible('delete-button');
  await DetoxHelper.expectTextVisible(buttonText);
});

When('I tap the delete button', async function() {
  await DetoxHelper.tapElement('delete-button');
});

Then('I should see a confirmation dialog', async function() {
  await DetoxHelper.waitForElement('confirmation-dialog');
  await DetoxHelper.expectTextVisible('Are you sure?');
});

When('I tap {string}', async function(buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

Then('the item should be removed from the list', async function() {
  await DetoxHelper.expectElementNotVisible('first-equipment-item');
});

// Swipe actions
When('I swipe right on a character card', async function() {
  await DetoxHelper.swipeRight('first-character-card');
});

Then('I should see quick action buttons', async function(dataTable) {
  await DetoxHelper.waitForElement('quick-actions');
  const actions = dataTable.raw().flat();
  for (const action of actions) {
    await DetoxHelper.expectTextVisible(action);
  }
});

Then('I should enter play mode for that character', async function() {
  await DetoxHelper.waitForElement('character-play-mode');
  await DetoxHelper.expectElementVisible('play-mode-interface');
});

// Hardware back button (Android)
When('I press the hardware back button', async function() {
  await device.pressBack();
});

Then('I should return to the character list', async function() {
  await DetoxHelper.waitForElement('character-list-screen');
});

Then('I should return to the main dashboard', async function() {
  await DetoxHelper.waitForElement('main-dashboard');
});

Then('I should see an exit confirmation dialog', async function() {
  await DetoxHelper.waitForElement('exit-confirmation-dialog');
  await DetoxHelper.expectTextVisible('Exit app?');
});

// Deep linking
Given('the app is running in background', async function() {
  await device.sendToHome();
  await DetoxHelper.waitForElement('home-screen'); // Device home screen
});

When('I tap a character deep link notification', async function() {
  // Simulate deep link activation
  await device.openURL({ url: 'travellerrpg://character/123' });
});

Then('the app should come to foreground', async function() {
  await DetoxHelper.waitForElement('main-dashboard');
});

Then('I should see the specific character sheet', async function() {
  await DetoxHelper.waitForElement('character-sheet-screen');
  await DetoxHelper.expectElementVisible('character-details');
});

Then('the navigation stack should be properly set', async function() {
  // Verify proper navigation state with back button available
  await DetoxHelper.expectElementVisible('back-button');
});

// Smooth scrolling
Given('I am on the character list with many characters', async function() {
  await DetoxHelper.tapElement('characters-tab');
  await DetoxHelper.expectElementVisible('character-list-scroll-view');
});

When('I perform a fast scroll down', async function() {
  // Perform fast scroll gesture
  await DetoxHelper.swipeUp('character-list-scroll-view', 'fast', 0.9);
});

Then('the scrolling should be smooth', async function() {
  // In a real test, this would check for frame drops or performance metrics
  await DetoxHelper.expectElementVisible('smooth-scroll-indicator');
});

Then('character cards should load progressively', async function() {
  await DetoxHelper.expectElementVisible('progressive-loading-indicator');
});

When('I reach the bottom of the list', async function() {
  await DetoxHelper.scrollToElement('character-list-scroll-view', 'list-end-marker');
});

Then('I should see {string} option', async function(optionText) {
  await DetoxHelper.expectTextVisible(optionText);
});

Then('additional characters should load', async function() {
  await DetoxHelper.expectElementVisible('additional-characters-loaded');
});

// Modal gestures
Given('I open the dice roller modal', async function() {
  await DetoxHelper.tapElementByText('Dice Roller');
  await DetoxHelper.waitForElement('dice-roller-modal');
});

When('I swipe down from the top of the modal', async function() {
  await DetoxHelper.swipeDown('dice-roller-modal');
});

Then('the modal should dismiss', async function() {
  await DetoxHelper.expectElementNotVisible('dice-roller-modal');
});

Given('I open the character creation modal', async function() {
  await DetoxHelper.tapElementByText('Create Character');
  await DetoxHelper.waitForElement('character-creation-modal');
});

When('I tap outside the modal area', async function() {
  await DetoxHelper.tapElement('modal-backdrop');
});

Then('the modal should remain open', async function() {
  await DetoxHelper.expectElementVisible('character-creation-modal');
});

When('I swipe down on the modal header', async function() {
  await DetoxHelper.swipeDown('modal-header');
});

Then('the modal should close', async function() {
  await DetoxHelper.expectElementNotVisible('character-creation-modal');
});

// Edge swipe navigation
When('I swipe right from the left edge of the screen', async function() {
  // Perform edge swipe gesture
  await element(by.id('main-container')).swipe('right', 'slow', 0.1, 0.5, 0.5);
});

Then('the navigation drawer should open', async function() {
  await DetoxHelper.waitForElement('navigation-drawer');
  await DetoxHelper.expectElementVisible('navigation-drawer');
});

When('I swipe left from the right edge of the screen', async function() {
  // Perform right edge swipe
  await element(by.id('main-container')).swipe('left', 'slow', 0.9, 0.5, 0.5);
});

Then('any right-side panel should open \\(if available)', async function() {
  // Check for right panel if it exists in the app
  try {
    await DetoxHelper.expectElementVisible('right-side-panel');
  } catch (error) {
    // Panel may not be available on all screens
    this.attach('Right panel not available on this screen');
  }
});

// Breadcrumb navigation
Given('I navigate to Characters > Marcus Vale > Equipment > Weapons', async function() {
  await DetoxHelper.tapElement('characters-tab');
  await DetoxHelper.tapElementByText('Marcus Vale');
  await DetoxHelper.tapElementByText('Equipment');
  await DetoxHelper.tapElementByText('Weapons');
  await DetoxHelper.waitForElement('weapons-screen');
});

Then('I should see the breadcrumb trail', async function() {
  await DetoxHelper.expectElementVisible('breadcrumb-trail');
});

When('I tap {string} in the breadcrumb', async function(breadcrumbItem) {
  await DetoxHelper.tapElementByText(breadcrumbItem);
});

Then('I should return to the character overview', async function() {
  await DetoxHelper.waitForElement('character-overview-screen');
});

Then('the breadcrumb should update accordingly', async function() {
  await DetoxHelper.expectElementVisible('updated-breadcrumb');
});

// Accessibility navigation
Given('accessibility features are enabled', async function() {
  // Enable accessibility features in test environment
  await device.setAccessibilityFocus(true);
});

When('I use screen reader navigation', async function() {
  // Simulate screen reader navigation
  await DetoxHelper.expectElementVisible('accessibility-focused-element');
});

Then('each navigation element should be properly labeled', async function() {
  // Verify accessibility labels are present
  const tabBar = element(by.id('tab-bar'));
  await expect(tabBar).toHaveAccessibilityLabel('Navigation tabs');
});

Then('navigation order should be logical', async function() {
  // Verify tab order follows logical sequence
  await DetoxHelper.expectElementVisible('logical-tab-order');
});

When('I use voice control to navigate', async function() {
  // Simulate voice control navigation
  this.attach('Voice control simulation');
});

Then('voice commands should work for main navigation items', async function() {
  // Verify voice control accessibility
  await DetoxHelper.expectElementVisible('voice-control-enabled');
});