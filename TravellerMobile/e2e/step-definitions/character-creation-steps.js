const { Given, When, Then } = require('@cucumber/cucumber');
const { element, by, expect, waitFor } = require('detox');
const DetoxHelper = require('../support/detox-helper');

// Background and navigation steps
Given('I am on the character list screen', async function() {
  await DetoxHelper.tapElement('characters-tab');
  await DetoxHelper.waitForElement('character-list-screen');
  await DetoxHelper.expectElementVisible('character-list');
});

// Character creation wizard steps
When('I tap the {string} button', async function(buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

Then('I should see the character creation wizard', async function() {
  await DetoxHelper.waitForElement('character-creation-wizard');
  await DetoxHelper.expectElementVisible('character-creation-wizard');
});

Then('I should see the progress indicator showing {string}', async function(progress) {
  await DetoxHelper.expectTextVisible(progress);
  await DetoxHelper.expectElementVisible('progress-indicator');
});

Then('I should see {string} step', async function(stepName) {
  await DetoxHelper.waitForElement(`${stepName.toLowerCase().replace(' ', '-')}-step`);
  await DetoxHelper.expectTextVisible(stepName);
});

// Basic Information step
Given('I am in the character creation wizard', async function() {
  await DetoxHelper.tapElementByText('Create Character');
  await DetoxHelper.waitForElement('character-creation-wizard');
});

Given('I am on the {string} step', async function(stepName) {
  const stepId = stepName.toLowerCase().replace(' ', '-') + '-step';
  await DetoxHelper.expectElementVisible(stepId);
});

When('I fill in the character details', async function(dataTable) {
  const details = dataTable.hashes()[0];
  for (const [field, value] of Object.entries(details)) {
    const fieldId = `character-${field}-input`;
    await DetoxHelper.clearAndType(fieldId, value);
  }
});

When('I tap {string}', async function(buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

Then('the progress indicator should show {string}', async function(progress) {
  await DetoxHelper.expectTextVisible(progress);
});

// Characteristics step
When('I tap {string}', async function(buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

Then('I should see animated dice rolling', async function() {
  await DetoxHelper.expectElementVisible('dice-animation');
  // Wait for animation to complete
  await device.waitForTimeout(3000);
});

Then('characteristic values should be generated', async function(dataTable) {
  const characteristics = dataTable.hashes()[0];
  for (const [char, value] of Object.entries(characteristics)) {
    const charElement = element(by.id(`characteristic-${char.toLowerCase()}`));
    await waitFor(charElement).toHaveText(value).withTimeout(5000);
  }
});

Then('I should see the total characteristic modifier', async function() {
  await DetoxHelper.expectElementVisible('total-modifier');
  await DetoxHelper.expectElementVisible('modifier-value');
});

// Background selection with swipe
When('I swipe left to browse backgrounds', async function() {
  await DetoxHelper.swipeLeft('background-carousel');
});

Then('I should see different background options', async function() {
  await DetoxHelper.expectElementVisible('background-option-1');
  await DetoxHelper.expectElementVisible('background-option-2');
});

When('I swipe right to go back', async function() {
  await DetoxHelper.swipeRight('background-carousel');
});

When('I tap {string} background', async function(backgroundName) {
  await DetoxHelper.tapElementByText(backgroundName);
});

Then('the background should be selected', async function() {
  await DetoxHelper.expectElementVisible('background-selected-indicator');
});

Then('I should see background benefits displayed', async function() {
  await DetoxHelper.expectElementVisible('background-benefits');
  await DetoxHelper.expectElementVisible('background-description');
});

// Career selection with scrolling
When('I scroll down through the career list', async function() {
  await DetoxHelper.swipeUp('career-list');
});

When('I tap {string} career', async function(careerName) {
  await DetoxHelper.scrollToText('career-list', careerName);
  await DetoxHelper.tapElementByText(careerName);
});

Then('I should see career description', async function() {
  await DetoxHelper.expectElementVisible('career-description');
});

Then('I should see service skills listed', async function() {
  await DetoxHelper.expectElementVisible('service-skills-list');
});

When('I tap {string}', async function(buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

Then('the career should be selected', async function() {
  await DetoxHelper.expectElementVisible('career-selected-indicator');
});

Then('I should see {string} section', async function(sectionName) {
  const sectionId = sectionName.toLowerCase().replace(' ', '-') + '-section';
  await DetoxHelper.expectElementVisible(sectionId);
});

// Service terms
Given('I have selected {string} career', async function(careerName) {
  this.setTestData('selectedCareer', careerName);
  await DetoxHelper.expectTextVisible(careerName);
});

When('I enter {string} terms of service', async function(terms) {
  await DetoxHelper.clearAndType('terms-input', terms);
});

When('I tap each term to see survival rolls', async function() {
  for (let i = 1; i <= 3; i++) {
    await DetoxHelper.tapElement(`term-${i}-button`);
    await DetoxHelper.expectElementVisible(`term-${i}-results`);
  }
});

Then('I should see survival roll results', async function() {
  await DetoxHelper.expectElementVisible('survival-roll-results');
  await DetoxHelper.expectElementVisible('roll-dice-animation');
});

Then('I should see skill improvements', async function() {
  await DetoxHelper.expectElementVisible('skill-improvements-list');
});

Then('I should see rank progression', async function() {
  await DetoxHelper.expectElementVisible('rank-progression');
  await DetoxHelper.expectElementVisible('current-rank');
});

When('I complete all terms', async function() {
  await DetoxHelper.expectElementVisible('all-terms-completed');
});

// Skills allocation
Given('I have skill points to allocate', async function() {
  await DetoxHelper.expectElementVisible('skill-points-remaining');
  await DetoxHelper.expectElementVisible('skills-list');
});

When('I tap the {string} button next to {string}', async function(buttonType, skillName) {
  const skillElement = element(by.id(`skill-${skillName.toLowerCase()}`));
  await DetoxHelper.scrollUntilVisible('skills-list', `skill-${skillName.toLowerCase()}`);
  
  if (buttonType === '+') {
    await DetoxHelper.tapElement(`skill-${skillName.toLowerCase()}-plus`);
  } else if (buttonType === '-') {
    await DetoxHelper.tapElement(`skill-${skillName.toLowerCase()}-minus`);
  }
});

Then('the skill level should increase', async function() {
  await DetoxHelper.expectElementVisible('skill-level-updated');
});

Then('available points should decrease', async function() {
  await DetoxHelper.expectElementVisible('skill-points-remaining');
  // Verify the number decreased (would need specific implementation)
});

When('I long-press the {string} button next to {string}', async function(buttonType, skillName) {
  await DetoxHelper.longPress(`skill-${skillName.toLowerCase()}-plus`);
});

Then('multiple skill levels should be added quickly', async function() {
  await DetoxHelper.expectElementVisible('rapid-skill-increase-animation');
});

Then('I should see updated skill totals', async function() {
  await DetoxHelper.expectElementVisible('total-skills-summary');
});

// Equipment selection
When('I browse equipment categories', async function() {
  await DetoxHelper.expectElementVisible('equipment-categories');
});

When('I tap {string} category', async function(categoryName) {
  await DetoxHelper.tapElementByText(categoryName);
});

Then('I should see weapon options in a mobile-friendly grid', async function() {
  await DetoxHelper.expectElementVisible('equipment-grid');
  await DetoxHelper.expectElementVisible('equipment-item-1');
});

When('I tap {string}', async function(itemName) {
  await DetoxHelper.tapElementByText(itemName);
});

Then('it should be added to my equipment', async function() {
  await DetoxHelper.expectElementVisible('equipment-added-confirmation');
});

Then('I should see weight and cost updated', async function() {
  await DetoxHelper.expectElementVisible('total-weight');
  await DetoxHelper.expectElementVisible('total-cost');
});

When('I swipe to {string} category', async function(categoryName) {
  await DetoxHelper.swipeLeft('equipment-categories');
  await DetoxHelper.tapElementByText(categoryName);
});

When('I select {string}', async function(itemName) {
  await DetoxHelper.tapElementByText(itemName);
});

Then('my equipment list should be complete', async function() {
  await DetoxHelper.expectElementVisible('equipment-complete-indicator');
});

// Portrait/Camera functionality
When('I grant camera permissions', async function() {
  // Simulate granting camera permissions in test environment
  await DetoxHelper.tapElementByText('Allow');
});

When('I take a photo', async function() {
  await DetoxHelper.tapElement('camera-capture-button');
  await DetoxHelper.waitForElement('photo-preview');
});

Then('the photo should be set as character portrait', async function() {
  await DetoxHelper.expectElementVisible('character-portrait-preview');
});

When('I tap {string}', async function(buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

Then('I should proceed to the review step', async function() {
  await DetoxHelper.waitForElement('review-step');
  await DetoxHelper.expectTextVisible('Review');
});

// Review and completion
Then('I should see all character details', async function(dataTable) {
  const details = dataTable.hashes()[0];
  for (const [field, value] of Object.entries(details)) {
    await DetoxHelper.expectTextVisible(value);
  }
});

When('I scroll down to see all information', async function() {
  await DetoxHelper.swipeUp('review-scroll-view');
});

Then('I should see {string}', async function(message) {
  await DetoxHelper.waitForText(message);
  await DetoxHelper.expectTextVisible(message);
});

Then('I should return to the character list', async function() {
  await DetoxHelper.waitForElement('character-list-screen');
  await DetoxHelper.expectElementVisible('character-list');
});

Then('I should see {string} in my character list', async function(characterName) {
  await DetoxHelper.scrollToText('character-list', characterName);
  await DetoxHelper.expectTextVisible(characterName);
});

// Validation steps
When('I leave the name field empty', async function() {
  await DetoxHelper.clearAndType('character-name-input', '');
});

Then('I should see an error {string}', async function(errorMessage) {
  await DetoxHelper.waitForText(errorMessage);
  await DetoxHelper.expectTextVisible(errorMessage);
});

Then('I should remain on the current step', async function() {
  // Verify we haven't progressed by checking step indicator
  await DetoxHelper.expectElementVisible('basic-information-step');
});

When('I enter a name that is too long', async function() {
  const longName = 'A'.repeat(51); // 51 characters, exceeding 50 limit
  await DetoxHelper.clearAndType('character-name-input', longName);
});

Then('the {string} button should be disabled', async function(buttonText) {
  const button = element(by.text(buttonText));
  await expect(button).toBeDisabled();
});

// Back navigation
When('I tap the back arrow', async function() {
  await DetoxHelper.tapElement('back-button');
});

Then('my previous selections should be preserved', async function() {
  // Verify that previously entered data is still there
  await DetoxHelper.expectElementVisible('previous-data-preserved');
});

Then('all form data should be maintained', async function() {
  // Verify form data persistence across navigation
  await DetoxHelper.expectElementVisible('form-data-maintained');
});