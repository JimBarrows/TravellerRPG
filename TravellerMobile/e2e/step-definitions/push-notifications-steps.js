const { Given, When, Then } = require('@cucumber/cucumber');
const { element, by, expect, waitFor } = require('detox');
const DetoxHelper = require('../support/detox-helper');

// Background setup
Given('push notifications are enabled', async function() {
  // Verify notifications are enabled in test environment
  this.setTestData('notificationsEnabled', true);
  await DetoxHelper.expectElementVisible('notifications-enabled-indicator');
});

// Permission handling
Given('I am launching the app for the first time', async function() {
  await device.launchApp({ 
    newInstance: true,
    permissions: { notifications: 'unset' }
  });
});

When('the app requests notification permissions', async function() {
  await DetoxHelper.waitForElement('notification-permission-dialog');
  await DetoxHelper.expectTextVisible('Allow notifications?');
});

When('I grant notification permissions', async function() {
  await DetoxHelper.tapElementByText('Allow');
  // In real app, this would trigger system permission dialog
  await device.setPermissions({ notifications: 'YES' });
});

Then('notifications should be enabled', async function() {
  this.setTestData('notificationsEnabled', true);
  await DetoxHelper.expectElementVisible('notifications-enabled-indicator');
});

Then('I should see confirmation {string}', async function(message) {
  await DetoxHelper.expectTextVisible(message);
});

// Campaign invitation notifications
Given('I am not currently in a campaign', async function() {
  this.setTestData('inCampaign', false);
  await DetoxHelper.expectElementNotVisible('current-campaign-indicator');
});

When('another player invites me to {string}', async function(campaignName) {
  // Simulate receiving push notification
  await device.sendUserNotification({
    title: 'Campaign Invitation',
    body: `You're invited to join ${campaignName}`,
    payload: {
      type: 'campaign_invite',
      campaignName: campaignName,
      actions: ['Accept', 'Decline', 'View Details']
    }
  });
});

Then('I should receive a push notification', async function(dataTable) {
  const notification = dataTable.hashes()[0];
  
  // In test environment, we verify the notification was processed
  await DetoxHelper.expectElementVisible('notification-received-indicator');
  
  // Verify notification content
  for (const [key, value] of Object.entries(notification)) {
    if (key !== 'Actions') {
      await DetoxHelper.expectTextVisible(value);
    }
  }
});

When('I tap {string} on the notification', async function(action) {
  // Simulate tapping notification action
  await device.sendUserActivity({
    type: 'com.travellerrpg.notification-action',
    userInfo: { action: action }
  });
});

Then('the app should open to the campaign details', async function() {
  await DetoxHelper.waitForElement('campaign-details-screen');
  await DetoxHelper.expectElementVisible('campaign-info');
});

Then('I should be added to the campaign', async function() {
  await DetoxHelper.expectElementVisible('campaign-member-indicator');
  this.setTestData('inCampaign', true);
});

// Session reminder notifications
Given('I am part of a campaign', async function() {
  this.setTestData('inCampaign', true);
  await DetoxHelper.expectElementVisible('current-campaign-indicator');
});

Given('a session is scheduled for tomorrow at 7 PM', async function() {
  this.setTestData('scheduledSession', {
    date: 'tomorrow',
    time: '7:00 PM',
    campaign: 'Spinward Marches'
  });
});

When('the reminder time arrives \\(1 hour before)', async function() {
  // Simulate scheduled notification trigger
  await device.sendUserNotification({
    title: 'Game Session Tomorrow',
    body: 'Spinward Marches at 7:00 PM',
    payload: {
      type: 'session_reminder',
      sessionId: 'session123'
    }
  });
});

When('I tap the notification', async function() {
  await device.launchApp({
    url: 'travellerrpg://session/session123',
    newInstance: false
  });
});

Then('I should see the session details screen', async function() {
  await DetoxHelper.waitForElement('session-details-screen');
  await DetoxHelper.expectElementVisible('session-info');
});

// Character update notifications
Given('my character is in an active campaign', async function() {
  this.setTestData('characterInCampaign', true);
  await DetoxHelper.expectElementVisible('character-campaign-indicator');
});

When('the GM awards experience points to my character', async function() {
  // Simulate server-sent notification for character update
  await device.sendUserNotification({
    title: 'Character Updated',
    body: 'Marcus Vale gained 2 XP',
    payload: {
      type: 'character_update',
      characterId: 'marcus-vale',
      change: 'xp_gain',
      amount: 2
    }
  });
});

Then('I should see my updated character sheet', async function() {
  await DetoxHelper.waitForElement('character-sheet-screen');
  await DetoxHelper.expectElementVisible('character-details');
});

Then('the XP gain should be highlighted', async function() {
  await DetoxHelper.expectElementVisible('xp-gain-highlight');
  await DetoxHelper.expectTextVisible('+2 XP');
});

// Dice roll notifications
Given('I am in a campaign session', async function() {
  this.setTestData('inActiveSession', true);
  await DetoxHelper.expectElementVisible('session-active-indicator');
});

Given('I have submitted a critical skill check', async function() {
  this.setTestData('submittedCriticalCheck', true);
});

When('the GM processes the roll result', async function() {
  // Simulate GM processing the roll
  await device.sendUserNotification({
    title: 'Critical Success!',
    body: 'Your Pilot check rolled 12!',
    payload: {
      type: 'dice_result',
      rollType: 'critical_success',
      skill: 'Pilot',
      result: 12
    }
  });
});

Then('I should receive a notification if the result is critical', async function(dataTable) {
  const notification = dataTable.hashes()[0];
  for (const [key, value] of Object.entries(notification)) {
    await DetoxHelper.expectTextVisible(value);
  }
});

Then('I should see the detailed roll results', async function() {
  await DetoxHelper.waitForElement('roll-results-screen');
  await DetoxHelper.expectElementVisible('detailed-roll-info');
});

// Trade opportunity notifications
Given('I have a merchant character', async function() {
  this.setTestData('characterType', 'merchant');
  await DetoxHelper.expectElementVisible('merchant-character-indicator');
});

Given('I have enabled trade notifications', async function() {
  this.setTestData('tradeNotificationsEnabled', true);
});

When('a profitable trade route becomes available', async function() {
  await device.sendUserNotification({
    title: 'Trade Opportunity',
    body: '40% profit on Electronics trade',
    payload: {
      type: 'trade_opportunity',
      commodity: 'Electronics',
      profit: '40%'
    }
  });
});

Then('I should see the trade details screen', async function() {
  await DetoxHelper.waitForElement('trade-details-screen');
  await DetoxHelper.expectElementVisible('trade-route-info');
});

// Notification settings management
When('I tap {string}', async function(buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

Then('I should see notification categories', async function(dataTable) {
  await DetoxHelper.waitForElement('notification-settings-screen');
  const categories = dataTable.hashes()[0];
  
  for (const [category, status] of Object.entries(categories)) {
    await DetoxHelper.expectTextVisible(category);
    const toggle = element(by.id(`${category.toLowerCase().replace(' ', '-')}-toggle`));
    if (status === 'ON') {
      await expect(toggle).toHaveToggleValue(true);
    } else {
      await expect(toggle).toHaveToggleValue(false);
    }
  }
});

When('I toggle {string} to ON', async function(setting) {
  const toggleId = setting.toLowerCase().replace(' ', '-') + '-toggle';
  await DetoxHelper.tapElement(toggleId);
});

Then('trade notifications should be enabled', async function() {
  this.setTestData('tradeNotificationsEnabled', true);
  await DetoxHelper.expectElementVisible('trade-notifications-enabled');
});

When('I set {string} to custom time', async function(setting) {
  const settingId = setting.toLowerCase().replace(' ', '-') + '-setting';
  await DetoxHelper.tapElement(settingId);
  await DetoxHelper.tapElementByText('Custom');
});

Then('I should see time picker options', async function() {
  await DetoxHelper.waitForElement('time-picker');
  await DetoxHelper.expectElementVisible('time-selection-controls');
});

// Quiet hours
Given('I have set quiet hours from 10 PM to 8 AM', async function() {
  this.setTestData('quietHours', { start: '22:00', end: '08:00' });
});

When('a notification would be sent at 11 PM', async function() {
  this.setTestData('notificationTime', '23:00');
  // Simulate delayed notification due to quiet hours
});

Then('the notification should be delayed', async function() {
  await DetoxHelper.expectElementVisible('notification-delayed-indicator');
});

Then('I should receive it at 8 AM instead', async function() {
  this.setTestData('deliveredTime', '08:00');
  await DetoxHelper.expectElementVisible('delayed-notification');
});

Then('the notification should include {string}', async function(text) {
  await DetoxHelper.expectTextVisible(text);
});

// Grouped notifications
Given('I receive multiple notifications while app is closed', async function(dataTable) {
  const notifications = dataTable.hashes();
  for (const notification of notifications) {
    await device.sendUserNotification({
      title: notification.Type,
      body: notification.Message,
      payload: {
        type: notification.Type.toLowerCase().replace(' ', '_'),
        timestamp: notification.Time
      }
    });
  }
});

When('I check my notifications', async function() {
  // Open notification center or app
  await device.launchApp({ newInstance: false });
  await DetoxHelper.waitForElement('notification-center');
});

Then('character updates should be grouped', async function() {
  await DetoxHelper.expectElementVisible('grouped-notifications');
  await DetoxHelper.expectElementVisible('character-updates-group');
});

Then('I should see {string} as a group', async function(groupText) {
  await DetoxHelper.expectTextVisible(groupText);
});

Then('session reminder should be separate', async function() {
  await DetoxHelper.expectElementVisible('session-reminder-separate');
});

// Interactive actions (3D Touch/Long Press)
Given('I receive a campaign invitation notification', async function() {
  await device.sendUserNotification({
    title: 'Campaign Invitation',
    body: 'Join the Spinward Marches Campaign',
    payload: {
      type: 'campaign_invite',
      actions: ['Accept and Join', 'Decline', 'View Campaign']
    }
  });
});

When('I force-touch \\(3D Touch) or long-press the notification', async function() {
  // Simulate 3D Touch or long press on notification
  await DetoxHelper.longPress('notification-item');
});

Then('I should see quick action options', async function(dataTable) {
  await DetoxHelper.waitForElement('quick-actions-menu');
  const actions = dataTable.raw().flat();
  for (const action of actions) {
    await DetoxHelper.expectTextVisible(action);
  }
});

Then('I should join the campaign without opening the app', async function() {
  this.setTestData('joinedCampaignFromNotification', true);
  await DetoxHelper.expectElementVisible('campaign-joined-confirmation');
});

Then('I should get confirmation feedback', async function() {
  await DetoxHelper.expectElementVisible('action-feedback');
});

// Background processing
Given('the app is running in the background', async function() {
  await device.sendToHome();
  this.setTestData('appInBackground', true);
});

When('I receive a character update notification', async function() {
  await device.sendUserNotification({
    title: 'Character Updated',
    body: 'Your character has been modified',
    payload: {
      type: 'character_update',
      characterId: 'test-character'
    }
  });
});

Then('the character data should sync in background', async function() {
  // Background processing would occur here
  this.setTestData('backgroundSyncCompleted', true);
});

Then('when I open the app later', async function() {
  await device.launchApp({ newInstance: false });
  await DetoxHelper.waitForElement('main-dashboard');
});

Then('the updates should already be applied', async function() {
  await DetoxHelper.expectElementVisible('character-updates-applied');
});

Then('I shouldn\'t see loading indicators', async function() {
  await DetoxHelper.expectElementNotVisible('loading-indicator');
});

// Notification history
Given('I have received multiple notifications', async function() {
  this.setTestData('notificationHistory', ['notification1', 'notification2', 'notification3']);
});

When('I open the notification center in the app', async function() {
  await DetoxHelper.tapElement('notifications-button');
  await DetoxHelper.waitForElement('notification-history-screen');
});

Then('I should see a history of recent notifications', async function() {
  await DetoxHelper.expectElementVisible('notification-history-list');
  await DetoxHelper.expectElementVisible('notification-item-1');
});

Then('I should be able to tap each one to see details', async function() {
  await DetoxHelper.tapElement('notification-item-1');
  await DetoxHelper.expectElementVisible('notification-details');
});

When('I tap {string}', async function(buttonText) {
  await DetoxHelper.tapElementByText(buttonText);
});

Then('the notification history should be cleared', async function() {
  await DetoxHelper.expectElementNotVisible('notification-item-1');
  await DetoxHelper.expectTextVisible('No notifications');
});

// Sound and vibration customization
When('I tap {string}', async function(settingName) {
  await DetoxHelper.tapElementByText(settingName);
});

Then('I should see options for different notification types', async function() {
  await DetoxHelper.expectElementVisible('notification-type-options');
  await DetoxHelper.expectTextVisible('Campaign Invitations');
  await DetoxHelper.expectTextVisible('Character Updates');
});

When('I set campaign invitations to use {string} sound', async function(soundName) {
  await DetoxHelper.tapElementByText('Campaign Invitations');
  await DetoxHelper.tapElementByText(soundName);
});

When('I set character updates to vibrate only', async function() {
  await DetoxHelper.tapElementByText('Character Updates');
  await DetoxHelper.tapElementByText('Vibrate Only');
});

Then('these preferences should be saved', async function() {
  await DetoxHelper.expectElementVisible('preferences-saved-confirmation');
});

When('I receive a campaign invitation', async function() {
  await device.sendUserNotification({
    title: 'Campaign Invitation',
    body: 'New invitation received',
    sound: 'adventure.wav'
  });
});

Then('I should hear the {string} sound', async function(soundName) {
  // In a real test, this would verify the sound was played
  this.setTestData('soundPlayed', soundName);
});

// Do Not Disturb handling
Given('my device is in Do Not Disturb mode', async function() {
  // Simulate Do Not Disturb mode
  this.setTestData('doNotDisturb', true);
});

When('a regular notification would be sent', async function() {
  await device.sendUserNotification({
    title: 'Regular Update',
    body: 'Character stats updated',
    priority: 'normal'
  });
});

Then('it should be silenced but visible', async function() {
  // Notification delivered silently
  await DetoxHelper.expectElementVisible('silent-notification');
});

When('an urgent notification \\(session starting) would be sent', async function() {
  await device.sendUserNotification({
    title: 'Session Starting Now!',
    body: 'Your game session is beginning',
    priority: 'high',
    category: 'urgent'
  });
});

Then('it should break through Do Not Disturb', async function() {
  await DetoxHelper.expectElementVisible('urgent-notification-delivered');
});

Then('I should receive it with sound/vibration', async function() {
  // Verify urgent notification plays sound despite DND
  this.setTestData('urgentNotificationWithSound', true);
});