@push-notifications @mobile
Feature: Push Notifications
  As a Traveller RPG player on mobile
  I want to receive relevant push notifications
  So that I stay engaged with campaigns and game sessions

  Background:
    Given I am logged in
    And push notifications are enabled

  @notifications @permissions
  Scenario: Request notification permissions on first launch
    Given I am launching the app for the first time
    When the app requests notification permissions
    And I grant notification permissions
    Then notifications should be enabled
    And I should see confirmation "Notifications enabled"

  @notifications @campaign-invites
  Scenario: Receive campaign invitation notifications
    Given I am not currently in a campaign
    When another player invites me to "Spinward Marches Campaign"
    Then I should receive a push notification
      | Title   | Campaign Invitation           |
      | Message | You're invited to join Spinward Marches Campaign |
      | Actions | Accept, Decline, View Details |
    When I tap "Accept" on the notification
    Then the app should open to the campaign details
    And I should be added to the campaign

  @notifications @session-reminders
  Scenario: Receive game session reminder notifications
    Given I am part of a campaign
    And a session is scheduled for tomorrow at 7 PM
    When the reminder time arrives (1 hour before)
    Then I should receive a notification
      | Title   | Game Session Tomorrow         |
      | Message | Spinward Marches at 7:00 PM  |
      | Action  | View Session, Set Reminder    |
    When I tap the notification
    Then I should see the session details screen

  @notifications @character-updates
  Scenario: Receive notifications for character changes
    Given my character is in an active campaign
    When the GM awards experience points to my character
    Then I should receive a notification
      | Title   | Character Updated             |
      | Message | Marcus Vale gained 2 XP      |
    When I tap the notification
    Then I should see my updated character sheet
    And the XP gain should be highlighted

  @notifications @dice-results
  Scenario: Receive notifications for important dice rolls
    Given I am in a campaign session
    And I have submitted a critical skill check
    When the GM processes the roll result
    Then I should receive a notification if the result is critical
      | Title   | Critical Success!             |
      | Message | Your Pilot check rolled 12!  |
    When I tap the notification
    Then I should see the detailed roll results

  @notifications @trade-opportunities
  Scenario: Receive trade opportunity notifications
    Given I have a merchant character
    And I have enabled trade notifications
    When a profitable trade route becomes available
    Then I should receive a notification
      | Title   | Trade Opportunity             |
      | Message | 40% profit on Electronics trade |
    When I tap the notification
    Then I should see the trade details screen

  @notifications @settings-management
  Scenario: Manage notification preferences
    Given I am in app settings
    When I tap "Notification Settings"
    Then I should see notification categories
      | Campaign Invitations | ON  |
      | Session Reminders   | ON  |
      | Character Updates   | ON  |
      | Trade Alerts        | OFF |
      | Social Updates      | ON  |
    When I toggle "Trade Alerts" to ON
    Then trade notifications should be enabled
    When I set "Session Reminders" to custom time
    Then I should see time picker options

  @notifications @quiet-hours
  Scenario: Respect quiet hours settings
    Given I have set quiet hours from 10 PM to 8 AM
    When a notification would be sent at 11 PM
    Then the notification should be delayed
    And I should receive it at 8 AM instead
    And the notification should include "Delayed from last night"

  @notifications @grouped-notifications
  Scenario: Group multiple notifications
    Given I receive multiple notifications while app is closed
      | Time  | Type              | Message               |
      | 2 PM  | Character Update  | Marcus gained 1 XP    |
      | 3 PM  | Character Update  | Sarah gained 2 XP     |
      | 4 PM  | Session Reminder  | Game starts in 1 hour |
    When I check my notifications
    Then character updates should be grouped
    And I should see "2 Character Updates" as a group
    And session reminder should be separate

  @notifications @interactive-actions
  Scenario: Use notification quick actions
    Given I receive a campaign invitation notification
    When I force-touch (3D Touch) or long-press the notification
    Then I should see quick action options
      | Accept and Join  |
      | Decline         |
      | View Campaign   |
    When I tap "Accept and Join"
    Then I should join the campaign without opening the app
    And I should get confirmation feedback

  @notifications @background-processing
  Scenario: Process notifications when app is backgrounded
    Given the app is running in the background
    When I receive a character update notification
    Then the character data should sync in background
    And when I open the app later
    Then the updates should already be applied
    And I shouldn't see loading indicators

  @notifications @notification-history
  Scenario: View notification history
    Given I have received multiple notifications
    When I open the notification center in the app
    Then I should see a history of recent notifications
    And I should be able to tap each one to see details
    When I tap "Clear All" 
    Then the notification history should be cleared

  @notifications @sound-vibration
  Scenario: Customize notification sounds and vibration
    Given I am in notification settings
    When I tap "Sound & Vibration"
    Then I should see options for different notification types
    When I set campaign invitations to use "Adventure" sound
    And I set character updates to vibrate only
    Then these preferences should be saved
    When I receive a campaign invitation
    Then I should hear the "Adventure" sound

  @notifications @do-not-disturb
  Scenario: Handle Do Not Disturb mode
    Given my device is in Do Not Disturb mode
    When a regular notification would be sent
    Then it should be silenced but visible
    When an urgent notification (session starting) would be sent
    Then it should break through Do Not Disturb
    And I should receive it with sound/vibration