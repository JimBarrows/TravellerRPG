const { Given, When, Then } = require('@cucumber/cucumber');
const { element, by, expect, waitFor } = require('detox');
const DetoxHelper = require('../support/detox-helper');

// Background steps
Given('I have characters synchronized', async function() {
  // Ensure test data is synced before going offline
  await DetoxHelper.waitForElement('sync-complete-indicator');
  this.setTestData('charactersSynced', true);
});

// Network connectivity management
Given('I have internet connectivity', async function() {
  // Verify online status
  await DetoxHelper.expectElementVisible('online-indicator');
  this.setTestData('networkConnected', true);
});

Given('I view my character {string}', async function(characterName) {
  await DetoxHelper.tapElement('characters-tab');
  await DetoxHelper.tapElementByText(characterName);
  await DetoxHelper.waitForElement('character-sheet-screen');
});

When('I disconnect from the internet', async function() {
  // Simulate network disconnection in test environment
  await device.setLocation(0, 0); // This can be used to simulate network issues
  // In a real implementation, this would use network simulation tools
  this.setTestData('networkConnected', false);
  await DetoxHelper.waitForElement('offline-indicator');
});

Given('I am offline', async function() {
  // Ensure offline state
  this.setTestData('networkConnected', false);
  await DetoxHelper.expectElementVisible('offline-indicator');
});

// Offline character access
When('I navigate back to character list', async function() {
  await DetoxHelper.tapElement('back-button');
  await DetoxHelper.waitForElement('character-list-screen');
});

Then('I should still see all my characters', async function() {
  await DetoxHelper.expectElementVisible('character-list');
  await DetoxHelper.expectElementVisible('character-card-1');
  await DetoxHelper.expectElementVisible('character-card-2');
});

Then('I should see an offline indicator', async function() {
  await DetoxHelper.expectElementVisible('offline-indicator');
  await DetoxHelper.expectTextVisible('Offline');
});

Then('I should see the full character sheet', async function() {
  await DetoxHelper.expectElementVisible('character-sheet-screen');
  await DetoxHelper.expectElementVisible('character-details');
});

Then('all character data should be available', async function() {
  await DetoxHelper.expectElementVisible('character-stats');
  await DetoxHelper.expectElementVisible('character-skills');
  await DetoxHelper.expectElementVisible('character-equipment');
});

// Offline character editing
When('I edit the character\'s name to {string}', async function(newName) {
  await DetoxHelper.tapElement('edit-character-button');
  await DetoxHelper.clearAndType('character-name-input', newName);
  await DetoxHelper.tapElement('save-changes-button');
});

When('I update skill points', async function() {
  await DetoxHelper.tapElement('skills-section');
  await DetoxHelper.tapElement('skill-plus-button');
  await DetoxHelper.tapElement('save-skills-button');
});

When('I add new equipment', async function() {
  await DetoxHelper.tapElement('equipment-section');
  await DetoxHelper.tapElement('add-equipment-button');
  await DetoxHelper.tapElementByText('Laser Pistol');
  await DetoxHelper.tapElement('confirm-add-button');
});

Then('the changes should be saved locally', async function() {
  await DetoxHelper.expectElementVisible('local-save-confirmation');
});

Then('I should see a {string} indicator', async function(indicatorText) {
  await DetoxHelper.expectTextVisible(indicatorText);
});

When('I go back to character list', async function() {
  await DetoxHelper.tapElement('back-button');
  await DetoxHelper.waitForElement('character-list-screen');
});

Then('I should see {string} with a sync indicator', async function(characterName) {
  await DetoxHelper.expectTextVisible(characterName);
  await DetoxHelper.expectElementVisible('sync-pending-indicator');
});

// Offline dice rolling
When('I navigate to the dice roller', async function() {
  await DetoxHelper.tapElement('dice-tab');
  await DetoxHelper.waitForElement('dice-roller-screen');
});

When('I configure dice for {string}', async function(diceConfiguration) {
  await DetoxHelper.tapElement('dice-config-button');
  await DetoxHelper.clearAndType('dice-formula-input', diceConfiguration);
  await DetoxHelper.tapElement('apply-config-button');
});

When('I roll the dice', async function() {
  await DetoxHelper.tapElement('roll-dice-button');
});

Then('I should see the roll results', async function() {
  await DetoxHelper.waitForElement('dice-results');
  await DetoxHelper.expectElementVisible('roll-value');
});

Then('the dice animation should work normally', async function() {
  await DetoxHelper.expectElementVisible('dice-animation');
});

Then('roll history should be maintained locally', async function() {
  await DetoxHelper.tapElement('roll-history-button');
  await DetoxHelper.expectElementVisible('roll-history-list');
});

// Sync on reconnect
Given('I have made offline changes to characters', async function(dataTable) {
  const changes = dataTable.hashes();
  for (const change of changes) {
    this.setTestData(`offlineChange-${change.Character}`, change.Change);
  }
  await DetoxHelper.expectElementVisible('offline-changes-indicator');
});

When('I reconnect to the internet', async function() {
  // Simulate network reconnection
  this.setTestData('networkConnected', true);
  await DetoxHelper.expectElementVisible('online-indicator');
});

Then('I should see a sync notification', async function() {
  await DetoxHelper.waitForElement('sync-notification');
  await DetoxHelper.expectTextVisible('Synchronizing changes...');
});

Then('sync should begin automatically', async function() {
  await DetoxHelper.expectElementVisible('sync-progress-bar');
});

When('sync completes successfully', async function() {
  await DetoxHelper.waitForElement('sync-complete-notification');
});

Then('I should see {string}', async function(message) {
  await DetoxHelper.expectTextVisible(message);
});

Then('sync indicators should be removed from characters', async function() {
  await DetoxHelper.expectElementNotVisible('sync-pending-indicator');
});

// Conflict resolution
Given('the same character was modified on another device', async function() {
  this.setTestData('serverConflict', true);
});

When('sync detects conflicts', async function() {
  await DetoxHelper.expectElementVisible('conflict-detected-dialog');
});

Then('I should see a conflict resolution dialog', async function() {
  await DetoxHelper.waitForElement('conflict-resolution-dialog');
  await DetoxHelper.expectTextVisible('Sync Conflict Detected');
});

Then('I should see both versions of the data', async function(dataTable) {
  const versions = dataTable.hashes()[0];
  for (const [column, value] of Object.entries(versions)) {
    await DetoxHelper.expectTextVisible(value);
  }
});

When('I choose {string}', async function(choice) {
  await DetoxHelper.tapElementByText(choice);
});

Then('my local changes should be preserved', async function() {
  await DetoxHelper.expectElementVisible('local-changes-preserved');
});

Then('they should sync to the server', async function() {
  await DetoxHelper.expectElementVisible('sync-to-server-complete');
});

// Storage limits
Given('offline storage is near capacity', async function() {
  this.setTestData('storageNearFull', true);
});

When('I try to create a new character', async function() {
  await DetoxHelper.tapElement('create-character-button');
});

Then('I should see a storage warning', async function() {
  await DetoxHelper.waitForElement('storage-warning-dialog');
  await DetoxHelper.expectTextVisible('Storage space is low');
});

Then('I should see options to free up space', async function() {
  await DetoxHelper.expectElementVisible('free-space-options');
  await DetoxHelper.expectTextVisible('Clear Cache');
  await DetoxHelper.expectTextVisible('Remove Old Data');
});

When('I choose to remove old cached data', async function() {
  await DetoxHelper.tapElementByText('Remove Old Data');
  await DetoxHelper.tapElementByText('Confirm');
});

Then('storage should be freed up', async function() {
  await DetoxHelper.expectElementVisible('storage-freed-confirmation');
});

Then('I should be able to create the character', async function() {
  await DetoxHelper.expectElementVisible('character-creation-wizard');
});

// Network status display
When('I lose internet connection', async function() {
  this.setTestData('networkConnected', false);
  await DetoxHelper.waitForElement('offline-indicator');
});

Then('I should see an offline indicator in the status bar', async function() {
  await DetoxHelper.expectElementVisible('status-bar-offline-indicator');
});

Then('I should see {string} message', async function(message) {
  await DetoxHelper.expectTextVisible(message);
});

When('I regain internet connection', async function() {
  this.setTestData('networkConnected', true);
  await DetoxHelper.waitForElement('online-indicator');
});

Then('I should see {string} indicator', async function(indicator) {
  await DetoxHelper.expectTextVisible(indicator);
});

Then('I should see {string} if there are pending changes', async function(message) {
  if (this.getTestData('hasPendingChanges')) {
    await DetoxHelper.expectTextVisible(message);
  }
});

// Queue management
When('I perform multiple actions', async function(dataTable) {
  const actions = dataTable.hashes();
  for (const action of actions) {
    this.setTestData(`queuedAction-${actions.indexOf(action)}`, action.Action);
  }
});

Then('all actions should be queued for sync', async function() {
  await DetoxHelper.expectElementVisible('sync-queue-indicator');
});

Then('I should see {string}', async function(message) {
  await DetoxHelper.expectTextVisible(message);
});

Then('queued actions should sync in order', async function() {
  await DetoxHelper.expectElementVisible('sync-queue-processing');
});

Then('I should see progress for each action', async function() {
  await DetoxHelper.expectElementVisible('action-progress-indicator');
});

// Poor connectivity handling
Given('I have very slow internet connection', async function() {
  this.setTestData('slowConnection', true);
});

When('I try to sync character data', async function() {
  await DetoxHelper.tapElement('sync-now-button');
});

Then('I should see a progress indicator', async function() {
  await DetoxHelper.expectElementVisible('sync-progress-indicator');
});

Then('sync should continue in background', async function() {
  await DetoxHelper.expectElementVisible('background-sync-indicator');
});

When('connection drops during sync', async function() {
  this.setTestData('connectionDropped', true);
});

Then('sync should pause and queue remaining changes', async function() {
  await DetoxHelper.expectElementVisible('sync-paused-indicator');
  await DetoxHelper.expectElementVisible('remaining-changes-queued');
});

When('connection improves', async function() {
  this.setTestData('connectionImproved', true);
});

Then('sync should resume automatically', async function() {
  await DetoxHelper.expectElementVisible('sync-resumed-indicator');
});

// Cache management
Given('I am in app settings', async function() {
  await DetoxHelper.tapElement('profile-tab');
  await DetoxHelper.tapElementByText('Settings');
  await DetoxHelper.waitForElement('settings-screen');
});

When('I navigate to {string}', async function(settingName) {
  await DetoxHelper.tapElementByText(settingName);
});

Then('I should see cache usage statistics', async function(dataTable) {
  await DetoxHelper.expectElementVisible('cache-usage-stats');
  const stats = dataTable.hashes()[0];
  for (const [category, size] of Object.entries(stats)) {
    await DetoxHelper.expectTextVisible(size);
  }
});

When('I tap {string}', async function(buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

Then('image cache should be cleared', async function() {
  await DetoxHelper.expectElementVisible('image-cache-cleared-confirmation');
});

Then('storage usage should be updated', async function() {
  await DetoxHelper.expectElementVisible('updated-storage-stats');
});

// Background sync
Given('the app goes to background', async function() {
  await device.sendToHome();
  this.setTestData('appInBackground', true);
});

When('I return to the app after network is available', async function() {
  await device.launchApp({ newInstance: false });
  this.setTestData('networkConnected', true);
  await DetoxHelper.waitForElement('main-dashboard');
});

Then('background sync should have occurred', async function() {
  await DetoxHelper.expectElementVisible('background-sync-complete');
});

Then('all changes should be up to date', async function() {
  await DetoxHelper.expectElementNotVisible('sync-pending-indicator');
});

// Selective sync
Given('I have multiple offline changes', async function() {
  this.setTestData('multipleOfflineChanges', true);
});

When('I reconnect with limited data connection', async function() {
  this.setTestData('limitedDataConnection', true);
  this.setTestData('networkConnected', true);
});

Then('I should see sync options', async function(dataTable) {
  await DetoxHelper.waitForElement('sync-options-dialog');
  const options = dataTable.raw().flat();
  for (const option of options) {
    await DetoxHelper.expectTextVisible(option);
  }
});

When('I choose {string}', async function(option) {
  await DetoxHelper.tapElementByText(option);
});

Then('only critical character data should sync', async function() {
  await DetoxHelper.expectElementVisible('essential-sync-only');
});

Then('images/media should remain queued', async function() {
  await DetoxHelper.expectElementVisible('media-sync-queued');
});

// Error handling
When('I try to access cloud-only features', async function() {
  await DetoxHelper.tapElementByText('Cloud Features');
});

Then('I should see {string}', async function(message) {
  await DetoxHelper.expectTextVisible(message);
});

Then('I should see alternative offline options', async function() {
  await DetoxHelper.expectElementVisible('offline-alternatives');
});

When('I try to sync with invalid data', async function() {
  this.setTestData('invalidSyncData', true);
  await DetoxHelper.tapElement('sync-now-button');
});

Then('I should see error details', async function() {
  await DetoxHelper.waitForElement('sync-error-dialog');
  await DetoxHelper.expectElementVisible('error-details');
});

Then('I should have options to fix or skip the problematic data', async function() {
  await DetoxHelper.expectElementVisible('fix-data-button');
  await DetoxHelper.expectElementVisible('skip-data-button');
});