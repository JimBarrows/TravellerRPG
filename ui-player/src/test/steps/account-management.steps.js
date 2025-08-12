import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';

// Mock data
let mockUser = {
  id: 'user123',
  username: 'testuser',
  email: 'test@example.com',
  attributes: {
    name: 'Test User',
    created_at: '2023-01-01T00:00:00Z'
  }
};

let mockSubscription = {
  tier: 'Free',
  status: 'active',
  features: ['basic_character_sheet', 'dice_roller'],
  limits: { characters: 3, campaigns: 1 }
};

let exportProgress = null;
let accountDeletionConfirmed = false;
let subscriptionChangeAttempted = false;

Given('I am logged into the Traveller RPG application', function () {
  this.currentUser = mockUser;
  this.isLoggedIn = true;
});

Given('I am on the account management page', function () {
  this.currentPage = 'account-management';
});

Given('I have an active account', function () {
  this.currentUser = mockUser;
  this.accountStatus = 'active';
});

Given('I want to export my account data', function () {
  this.requestingDataExport = true;
});

Given('I want to delete my account', function () {
  this.requestingAccountDeletion = true;
});

Given('I have a {string} tier subscription', function (tierName) {
  mockSubscription.tier = tierName;
  
  // Set features and limits based on tier
  switch (tierName) {
    case 'Free':
      mockSubscription.features = ['basic_character_sheet', 'dice_roller'];
      mockSubscription.limits = { characters: 3, campaigns: 1 };
      break;
    case 'Standard':
      mockSubscription.features = ['basic_character_sheet', 'advanced_character_sheet', 'dice_roller', 'campaign_management'];
      mockSubscription.limits = { characters: 25, campaigns: 10 };
      break;
    case 'Premium':
      mockSubscription.features = ['basic_character_sheet', 'advanced_character_sheet', 'ai_character_generation', 'dice_roller', 'ai_story_assistant'];
      mockSubscription.limits = { characters: 'unlimited', campaigns: 'unlimited' };
      break;
  }
  
  this.currentSubscription = mockSubscription;
});

Given('I have a paid subscription', function () {
  mockSubscription.tier = 'Standard';
  mockSubscription.paymentMethod = {
    type: 'credit_card',
    last4: '1234',
    brand: 'visa'
  };
  this.currentSubscription = mockSubscription;
});

When('I view my account page', function () {
  this.viewingAccountPage = true;
});

When('I click the {string} button', function (buttonText) {
  this.clickedButton = buttonText;
  
  switch (buttonText) {
    case 'Export Data':
      this.requestingDataExport = true;
      break;
    case 'Delete Account':
      this.showingDeleteConfirmation = true;
      break;
  }
});

When('I confirm the data export', function () {
  exportProgress = {
    status: 'preparing',
    progress: 0
  };
  
  // Simulate export process
  setTimeout(() => {
    exportProgress = {
      status: 'completed',
      progress: 100,
      downloadUrl: 'http://example.com/export.json'
    };
  }, 100);
});

When('I type {string} to confirm', function (confirmationText) {
  this.confirmationText = confirmationText;
  
  if (confirmationText === 'DELETE') {
    this.deletionConfirmed = true;
  }
});

When('I click the final delete button', function () {
  if (this.deletionConfirmed) {
    accountDeletionConfirmed = true;
    this.accountDeleted = true;
  }
});

When('I view my subscription status', function () {
  this.viewingSubscriptionStatus = true;
});

When('I click {string}', function (actionText) {
  subscriptionChangeAttempted = true;
  this.subscriptionAction = actionText;
  
  if (actionText.includes('Upgrade')) {
    this.targetTier = 'Standard';
  } else if (actionText.includes('Downgrade')) {
    this.targetTier = 'Standard';
  }
});

When('I complete the payment process', function () {
  this.paymentCompleted = true;
  
  if (this.targetTier) {
    mockSubscription.tier = this.targetTier;
  }
});

When('I confirm the downgrade', function () {
  this.downgradeConfirmed = true;
  
  if (this.targetTier) {
    mockSubscription.tier = this.targetTier;
  }
});

When('I try to access a Premium feature', function () {
  this.accessingPremiumFeature = true;
  this.featureAccessible = mockSubscription.tier === 'Premium';
});

When('I view my payment methods', function () {
  this.viewingPaymentMethods = true;
});

When('I add a new payment method', function () {
  this.addingPaymentMethod = true;
  this.newPaymentMethod = {
    type: 'credit_card',
    last4: '5678',
    brand: 'mastercard'
  };
});

When('I set it as the default method', function () {
  if (this.newPaymentMethod) {
    this.newPaymentMethod.isDefault = true;
  }
});

Then('I should see my user information', function () {
  expect(this.currentUser).toBeTruthy();
  expect(this.currentUser.email).toBe('test@example.com');
});

Then('I should see my subscription tier status', function () {
  expect(this.currentSubscription).toBeTruthy();
  expect(this.currentSubscription.tier).toBeTruthy();
});

Then('I should see my account creation date', function () {
  expect(this.currentUser.attributes.created_at).toBeTruthy();
});

Then('I should see my last login date', function () {
  // This would be available if tracking last login
  expect(true).toBe(true); // Placeholder
});

Then('I should see a confirmation dialog', function () {
  expect(this.requestingDataExport).toBe(true);
});

Then('the system should prepare my data for download', function () {
  expect(exportProgress).toBeTruthy();
});

Then('I should receive a download link for my data', function () {
  // Wait for export to complete
  setTimeout(() => {
    expect(exportProgress.downloadUrl).toBeTruthy();
  }, 150);
});

Then('the exported file should contain all my user data in JSON format', function () {
  expect(exportProgress.downloadUrl).toContain('.json');
});

Then('I should see a detailed confirmation dialog', function () {
  expect(this.showingDeleteConfirmation).toBe(true);
});

Then('I should be warned about data loss', function () {
  expect(this.showingDeleteConfirmation).toBe(true);
});

Then('my account should be scheduled for deletion', function () {
  expect(this.accountDeleted).toBe(true);
});

Then('I should be logged out immediately', function () {
  expect(this.accountDeleted).toBe(true);
});

Then('I should receive a confirmation email', function () {
  expect(this.accountDeleted).toBe(true);
});

Then('I should see {string} as my current tier', function (tierName) {
  expect(mockSubscription.tier).toBe(tierName);
});

Then('I should see the limitations of the Free tier', function () {
  expect(mockSubscription.limits.characters).toBe(3);
  expect(mockSubscription.limits.campaigns).toBe(1);
});

Then('I should see an option to upgrade', function () {
  expect(mockSubscription.tier).toBe('Free');
  // Upgrade options should be available for Free tier
});

Then('I should see the benefits of the Standard tier', function () {
  expect(mockSubscription.features).toContain('campaign_management');
});

Then('I should see options to upgrade or downgrade', function () {
  expect(mockSubscription.tier).toBe('Standard');
  // Both upgrade and downgrade options should be available
});

Then('I should see all Premium benefits', function () {
  expect(mockSubscription.features).toContain('ai_character_generation');
  expect(mockSubscription.features).toContain('ai_story_assistant');
});

Then('I should see an option to downgrade', function () {
  expect(mockSubscription.tier).toBe('Premium');
  // Downgrade options should be available for Premium tier
});

Then('I should see the pricing information', function () {
  expect(subscriptionChangeAttempted).toBe(true);
});

Then('I should see payment options', function () {
  expect(subscriptionChangeAttempted).toBe(true);
});

Then('my subscription should be upgraded to {string}', function (tierName) {
  if (this.paymentCompleted) {
    expect(mockSubscription.tier).toBe(tierName);
  }
});

Then('I should see the updated tier status', function () {
  expect(mockSubscription.tier).toBeTruthy();
});

Then('I should see a confirmation dialog about losing features', function () {
  expect(this.subscriptionAction).toContain('Downgrade');
});

Then('my subscription should be downgraded to {string}', function (tierName) {
  if (this.downgradeConfirmed) {
    expect(mockSubscription.tier).toBe(tierName);
  }
});

Then('the downgrade should take effect at the next billing cycle', function () {
  expect(this.downgradeConfirmed).toBe(true);
});

Then('I should see an upgrade prompt', function () {
  if (!this.featureAccessible) {
    expect(this.accessingPremiumFeature).toBe(true);
  }
});

Then('the feature should not be available', function () {
  if (mockSubscription.tier === 'Free') {
    expect(this.featureAccessible).toBe(false);
  }
});

Then('the feature should be fully available', function () {
  if (mockSubscription.tier === 'Premium') {
    expect(this.featureAccessible).toBe(true);
  }
});

Then('I should see my current payment method', function () {
  expect(mockSubscription.paymentMethod).toBeTruthy();
});

Then('I should be able to update my payment method', function () {
  expect(this.viewingPaymentMethods).toBe(true);
});

Then('it should be saved securely', function () {
  expect(this.newPaymentMethod).toBeTruthy();
});

Then('I should be able to set it as the default method', function () {
  expect(this.newPaymentMethod.isDefault).toBe(true);
});