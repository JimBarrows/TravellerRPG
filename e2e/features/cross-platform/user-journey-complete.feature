@cross-platform @user-journey @comprehensive @smoke
Feature: Comprehensive Cross-Platform User Journey
  As a Traveller RPG enthusiast
  I want a seamless experience across web, mobile, and API platforms
  So that I can create characters, join campaigns, and play the game regardless of which device I'm using

  Background:
    Given all platforms (web, mobile, API) are operational
    And data synchronization is enabled across platforms
    And I have access to multiple devices (desktop, tablet, mobile)

  @registration @verification @character-creation @end-to-end
  Scenario: Complete user onboarding journey across platforms
    # User starts on web platform
    Given I visit the web application for the first time
    When I click "Sign Up" on the web platform
    And I fill out the registration form on web
      | email     | newplayer@travellerrpg.com |
      | password  | SecurePass123!             |
      | username  | spacecadet_42              |
      | name      | Alex Morgan                |
    And I submit the registration form
    Then I should see "Please check your email for verification" on web
    
    # User switches to mobile for verification
    When I open the mobile app
    And I receive the verification email
    And I tap the verification link in the email
    Then I should be redirected to the mobile app
    And I should see "Account verified successfully"
    And I should be automatically logged in on mobile
    
    # User creates first character via API (through mobile app)
    When I tap "Create Character" in the mobile app
    Then the mobile app should make API calls to create the character
    And I should see the character creation wizard
    When I complete character creation on mobile
      | name      | Commander Riley |
      | career    | Navy           |
      | terms     | 3              |
    Then the character should be created via GraphQL mutation
    And I should receive confirmation on mobile
    
    # User verifies character appears on web
    When I return to the web platform
    And I log in with my credentials
    Then I should see "Commander Riley" in my character list
    And all character details should match exactly
    And the character should have been synchronized automatically

  @character-sync @cross-platform @real-time
  Scenario: Character created on mobile syncs to web and used in campaign
    Given I am logged in on both mobile and web platforms
    And I have no existing characters
    
    # Create character on mobile
    When I create a new character on mobile
      | name        | Captain Sarah Chen |
      | homeworld   | Regina            |
      | career      | Merchant          |
      | terms       | 4                 |
      | rank        | Captain           |
    Then the character should be saved on mobile
    And API calls should confirm character creation
    
    # Verify sync to web within 30 seconds
    When I check the web platform within 30 seconds
    Then "Captain Sarah Chen" should appear in my character list on web
    And all character stats should match the mobile version exactly
    And character portrait should be synchronized if uploaded
    
    # Use character in web-based campaign
    When a GM creates a campaign on web
    And I join the campaign using "Captain Sarah Chen"
    Then my character should be fully integrated into the campaign
    And other players should see my character in the campaign roster
    And I should be able to participate in campaign activities on web
    
    # Verify mobile shows campaign participation
    When I check the mobile app
    Then I should see that "Captain Sarah Chen" is in a campaign
    And campaign notifications should appear on mobile
    And I should be able to view campaign details on mobile

  @campaign @multiplayer @real-time @notifications
  Scenario: Campaign started on web with players joining via mobile and real-time updates
    Given I am a Game Master logged in on web
    And I have 3 players with mobile apps installed
    And all players are registered and verified
    
    # GM creates campaign on web
    When I create a new campaign on web
      | name        | Pirates of Drinax        |
      | setting     | Third Imperium          |
      | max_players | 4                       |
      | style       | Adventure               |
    And I configure campaign settings
    And I click "Create Campaign"
    Then the campaign should be created successfully
    And I should see the campaign management dashboard
    
    # GM sends invitations
    When I invite players to the campaign
      | player_email          | character_suggested |
      | player1@example.com   | Scout              |
      | player2@example.com   | Marine             |
      | player3@example.com   | Merchant           |
    Then invitation emails should be sent to all players
    And API should record pending invitations
    
    # Players receive mobile notifications
    Then each player should receive a push notification on mobile
    And the notification should show campaign name and GM
    When each player opens the mobile app from the notification
    Then they should see the campaign invitation
    And they should be able to accept or decline
    
    # Players join via mobile
    When all 3 players accept the invitation on mobile
    Then I should see real-time updates on the web GM dashboard
    And player count should update from "0/4" to "3/4"
    And player names should appear in the campaign roster
    And each player's mobile app should show campaign details
    
    # Real-time session testing
    When I start a campaign session on web
    Then all mobile players should receive session start notifications
    When I make updates to the campaign (add NPCs, update story)
    Then mobile players should see updates within 5 seconds
    When mobile players update their character status
    Then I should see their updates on the web dashboard immediately

  @offline @sync @conflict-resolution @mobile
  Scenario: Offline character editing on mobile with sync and conflict resolution
    Given I have a character "Dr. Elena Voss" on both mobile and web
    And the character has detailed equipment and skills
    And both platforms show identical data initially
    
    # Mobile goes offline and makes changes
    When I disconnect mobile from the internet
    And I edit "Dr. Elena Voss" on mobile while offline
      | field              | old_value    | new_value      |
      | medical_skill      | 2           | 3              |
      | equipment_credits  | 5000        | 4200           |
      | notes             | Basic setup  | Mission notes added |
    Then the mobile app should store changes locally
    And I should see "Offline - Changes will sync when online" indicator
    
    # Web makes conflicting changes while mobile is offline
    When I edit "Dr. Elena Voss" on web while mobile is offline
      | field              | old_value    | new_value      |
      | medical_skill      | 2           | 4              |
      | equipment_credits  | 5000        | 4500           |
      | current_location   | Starport    | Medical Bay    |
    Then the web changes should save immediately
    And API should timestamp the web changes
    
    # Mobile comes back online - conflict detection
    When I reconnect mobile to the internet
    Then the mobile app should detect synchronization conflicts
    And I should see a conflict resolution dialog
    And the dialog should show:
      | field              | mobile_value   | web_value     |
      | medical_skill      | 3             | 4             |
      | equipment_credits  | 4200          | 4500          |
    
    # User resolves conflicts
    When I choose to resolve conflicts by:
      | field              | resolution_choice | final_value |
      | medical_skill      | Keep web version | 4           |
      | equipment_credits  | Keep mobile      | 4200        |
      | notes             | Merge both       | Basic setup\nMission notes added |
      | current_location   | Keep web only    | Medical Bay |
    And I confirm the conflict resolution
    Then all platforms should show the resolved values
    And the resolution should be logged for audit purposes
    
    # Verify final sync state
    When I check both platforms after conflict resolution
    Then both mobile and web should show identical character data
    And the conflict resolution should be complete
    And no further sync conflicts should exist

  @gm-workflow @invitations @notifications @cross-platform
  Scenario: GM creates campaign on web, sends invites, players receive notifications on mobile
    Given I am a Game Master with web access
    And I have a list of registered players with mobile apps
    And all players have enabled push notifications
    
    # GM sets up campaign on web
    When I navigate to "Create Campaign" on web
    And I fill out the campaign creation form
      | campaign_name    | The Spinward Marches    |
      | system_setting   | Classic Traveller       |
      | campaign_style   | Exploration & Trade     |
      | session_frequency| Weekly                  |
      | preferred_time   | Sundays 7 PM EST       |
      | max_players      | 5                       |
      | experience_level | Mixed (New & Veteran)   |
    And I upload campaign materials
      | sector_map       | spinward_marches.pdf    |
      | house_rules      | custom_rules.txt        |
      | session_zero     | character_guidelines.md |
    And I click "Create Campaign"
    Then the campaign should be created successfully
    And I should see the campaign dashboard
    
    # GM customizes invitation message
    When I click "Invite Players"
    And I select players from my contacts
      | player_name    | email                | preferred_role |
      | Mike Chen      | mike@example.com     | Pilot         |
      | Sarah Jones    | sarah@example.com    | Engineer      |
      | David Kim      | david@example.com    | Medic         |
      | Lisa Park      | lisa@example.com     | Gunner        |
    And I customize the invitation message
      """
      Join me for an epic journey through the Spinward Marches! 
      We'll be exploring new worlds, engaging in trade, and 
      uncovering ancient mysteries. Perfect for both new and 
      experienced players. Session Zero scheduled for next Sunday.
      """
    And I schedule the invitation to be sent immediately
    And I click "Send Invitations"
    
    # Players receive notifications and invitations
    Then each selected player should receive:
      | notification_type | timing        | content                    |
      | Push Notification | Immediately   | Campaign invitation from GM |
      | Email Invitation  | Within 1 min  | Detailed campaign info     |
      | In-App Message    | Next app open | Interactive invitation UI  |
    
    # Players respond through mobile
    When "Mike Chen" opens the mobile app notification
    Then he should see the campaign invitation with full details
    And he should see campaign materials (downloadable)
    And he should see other invited players (pending responses)
    When he taps "Accept Invitation"
    And confirms his preferred character type "Pilot"
    Then his acceptance should be recorded immediately
    And I should see his acceptance on the web GM dashboard
    And other players should see his acceptance in their invitations
    
    # Track invitation responses in real-time
    When each player responds to the invitation:
      | player_name | response | character_interest | notes                    |
      | Mike Chen   | Accept   | Pilot             | Experienced player       |
      | Sarah Jones | Accept   | Engineer          | New to Traveller        |
      | David Kim   | Decline  | N/A               | Schedule conflict        |
      | Lisa Park   | Accept   | Gunner            | Veteran RPG player       |
    Then I should see real-time updates on the GM dashboard:
      | status        | count | percentage |
      | Responses     | 4/4   | 100%       |
      | Accepted      | 3/4   | 75%        |
      | Declined      | 1/4   | 25%        |
    And I should be able to invite additional players to replace declines
    
    # Session zero preparation
    When all accepted players have confirmed their character concepts
    Then I should be able to schedule Session Zero
    And all accepted players should receive calendar invitations
    And the mobile app should add the session to player calendars
    And players should receive reminder notifications

  @data-consistency @validation @cross-platform
  Scenario: Platform handoffs maintain data consistency and business logic
    Given I have a complex character with extensive data
      | character_name     | Admiral Victoria Cross        |
      | career_history     | Navy (4 terms), Noble (2 terms) |
      | skills_count       | 15 different skills           |
      | equipment_items    | 25 items with modifications   |
      | backstory_length   | 2000 characters               |
      | portrait_image     | High-resolution custom art    |
    And the character exists on all platforms with identical data
    
    # Test platform handoffs
    When I view the character on web
    Then all business logic should be correctly applied
    And skill totals should match Traveller rules
    And career benefits should be properly calculated
    And equipment weights and costs should be accurate
    
    When I switch to mobile and view the same character
    Then all displayed information should be identical to web
    And mobile-specific optimizations should not affect data
    And portrait should display correctly on mobile screens
    And scrolling through sections should maintain data integrity
    
    When I query the character via API
    Then the GraphQL response should contain complete data
    And all relationships should be properly resolved
    And calculated fields should match UI displays
    And data validation rules should be enforced
    
    # Test business logic across platforms
    When I attempt to add a skill that would exceed character limits
    Then all platforms should enforce the same validation rules
    And error messages should be consistent across platforms
    When I make a valid character modification on one platform
    Then the change should be validated and applied across all platforms
    And derived calculations should update consistently everywhere

  @performance @load @stress @cross-platform
  Scenario: System performance under load with cross-platform usage
    Given the system is running under normal load
    And I have performance monitoring enabled
    
    # Simulate realistic load
    When 50 users simultaneously:
      | action                    | platform_mix           | frequency     |
      | Create new characters     | 60% mobile, 40% web   | Every 30 sec  |
      | Edit existing characters  | 70% mobile, 30% web   | Every 45 sec  |
      | Join/leave campaigns      | 50% mobile, 50% web   | Every 2 min   |
      | Sync data across devices  | 100% cross-platform   | Every 10 sec  |
    
    Then system performance should remain within acceptable limits:
      | metric                    | maximum_threshold |
      | Web page load time        | 3 seconds        |
      | Mobile app response time  | 2 seconds        |
      | API GraphQL response time | 1 second         |
      | Cross-platform sync time  | 5 seconds        |
      | Database query time       | 500 milliseconds |
    
    And user experience should remain smooth:
      | platform | requirement                           |
      | Web      | No UI freezing or unresponsive pages |
      | Mobile   | Smooth scrolling and navigation      |
      | API      | Consistent response times            |
    
    When load increases to 100 simultaneous users
    Then the system should gracefully handle the increased load
    And performance degradation should be minimal and temporary
    And no data should be lost or corrupted during high load

  @accessibility @internationalization @cross-platform
  Scenario: Accessibility and internationalization across all platforms
    Given the application supports multiple languages
    And accessibility features are enabled
    And I am using assistive technologies
    
    # Test accessibility on web platform
    When I navigate the web application using keyboard only
    Then all interactive elements should be accessible via keyboard
    And tab order should be logical and intuitive
    And focus indicators should be clearly visible
    When I use a screen reader on web
    Then all content should be properly announced
    And form fields should have appropriate labels
    And error messages should be accessible
    
    # Test accessibility on mobile platform  
    When I use VoiceOver (iOS) or TalkBack (Android)
    Then all mobile UI elements should be properly labeled
    And gesture navigation should work with screen readers
    And character creation wizard should be fully accessible
    
    # Test internationalization
    When I change the language to Spanish on web
    Then all UI text should display in Spanish
    And character creation terms should be translated
    And Traveller game terms should maintain consistency
    When I switch to mobile and the language is still Spanish
    Then the mobile app should display in Spanish
    And data should sync correctly regardless of language setting
    
    # Test RTL language support
    When I switch to Arabic (RTL language)
    Then both web and mobile should properly support RTL layout
    And text direction should be correct throughout the application
    And character sheets should maintain proper RTL formatting
    
    # Test accessibility with internationalization
    When I use screen reader with non-English language
    Then content should be properly announced in the selected language
    And pronunciation of game terms should be appropriate
    And navigation should remain consistent across languages

  @edge-cases @error-handling @recovery @cross-platform
  Scenario: Edge cases, error handling, and system recovery
    Given the system is operating normally
    And I have active sessions on multiple platforms
    
    # Test network interruption during critical operations
    When I am creating a character on mobile
    And the network connection is lost during character save
    Then the mobile app should detect the network loss
    And show appropriate "Saving failed - will retry when online" message
    And locally cache the character creation data
    When network connection is restored
    Then the character should be automatically saved
    And I should receive confirmation of successful save
    And the character should appear on all platforms
    
    # Test server maintenance mode
    When the system enters maintenance mode
    Then all platforms should display maintenance notifications
    And users should be warned before being logged out
    And local data should be preserved during maintenance
    When maintenance is complete
    Then all platforms should reconnect automatically
    And cached changes should sync immediately
    And user sessions should resume seamlessly
    
    # Test data corruption recovery
    When character data becomes corrupted due to sync conflict
    Then the system should detect the corruption
    And offer recovery options to the user
    And provide rollback to last known good state
    And log the corruption incident for investigation
    
    # Test API rate limiting
    When a user exceeds API rate limits
    Then the system should gracefully throttle requests
    And provide appropriate user feedback about rate limiting
    And queue non-critical operations for later execution
    And maintain system stability under rate limit conditions
    
    # Test browser/app crashes
    When the web browser crashes during character editing
    And I restart the browser and return to the application
    Then I should see a "Session restored" message
    And unsaved changes should be recovered where possible
    And form data should be restored to the last auto-saved state
    
    # Test mobile app background/foreground transitions
    When the mobile app is sent to background during sync
    And returns to foreground after an extended period
    Then the app should resume sync operations
    And check for any missed updates
    And refresh data if necessary
    And maintain user's position in the application

  @multi-device @session-continuity @handoff
  Scenario: Multi-device session continuity and handoff
    Given I am logged in on desktop web browser
    And I have the mobile app installed and logged in
    And I am editing a character on desktop
    
    # Seamless handoff from desktop to mobile
    When I am in the middle of character creation on desktop
    And I need to switch to mobile device
    Then I should be able to continue exactly where I left off
    And all form data should be preserved
    And my progress through the creation wizard should be maintained
    
    # Real-time collaboration
    When I am GM-ing a campaign on desktop
    And players are connected via mobile apps
    And I make changes to campaign settings
    Then mobile players should see updates in real-time
    And no player should experience session interruption
    
    # Cross-device notifications
    When important events occur in campaigns I'm part of
    Then I should receive notifications on all my logged-in devices
    And notifications should be smart (not duplicate on multiple devices)
    And I should be able to respond from any device
    
    # Session state synchronization
    When I start a character creation session on mobile
    And switch to desktop partway through
    Then desktop should show my mobile progress
    And I should be able to continue seamlessly
    And when I return to mobile, it should reflect desktop changes
    And my session should remain active across device switches

  @security @privacy @compliance @cross-platform
  Scenario: Security, privacy, and compliance across platforms
    Given I have sensitive character and campaign data
    And I am using the application across multiple platforms
    And privacy regulations (GDPR, CCPA) are in effect
    
    # Data encryption and security
    When data synchronizes between platforms
    Then all data transmission should be encrypted
    And authentication tokens should be securely stored
    And sensitive information should be encrypted at rest
    
    # Privacy controls
    When I access privacy settings
    Then I should have control over data sharing preferences
    And I should be able to export all my data
    And I should be able to delete my account and all associated data
    And privacy controls should be consistent across all platforms
    
    # Session security
    When I log in on a new device
    Then I should receive security notifications on other devices
    And I should be able to review and revoke active sessions
    And suspicious login attempts should be blocked and reported
    
    # Compliance verification
    When I request data export
    Then I should receive all my data in a standard format
    And the export should include all platforms' data
    And data should be complete and in human-readable format
    When I request account deletion
    Then all my data should be removed from all platforms
    And deletion should be confirmed within required timeframes
    And no data should remain accessible after deletion confirmation