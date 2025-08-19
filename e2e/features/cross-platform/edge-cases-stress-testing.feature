@cross-platform @edge-cases @stress-testing @reliability
Feature: Cross-Platform Edge Cases and Stress Testing
  As a system administrator and user of the Traveller RPG platform
  I want the system to handle edge cases and high-stress scenarios gracefully
  So that the platform remains reliable and user-friendly under all conditions

  Background:
    Given the Traveller RPG platform is deployed across web, mobile, and API
    And monitoring and logging systems are active
    And I have access to test accounts with various permission levels

  @network-failures @resilience @recovery
  Scenario: Network failure resilience and graceful degradation
    Given I am actively using the platform on multiple devices
    And I have unsaved changes on both web and mobile
    
    # Complete network outage
    When the internet connection is completely lost
    Then web platform should detect the outage within 5 seconds
    And mobile app should switch to offline mode
    And unsaved changes should be preserved locally on both platforms
    And users should see clear "Offline Mode" indicators
    And critical functions should remain available offline
    
    # Partial network connectivity
    When network connection becomes intermittent
    With packet loss of 40% and latency spikes to 5000ms
    Then platforms should adapt to degraded connectivity:
      | platform | adaptive_behavior                              |
      | Web      | Increase retry intervals, simplify UI updates |
      | Mobile   | Buffer operations, reduce sync frequency      |
      | API      | Queue requests, batch responses               |
    And user experience should degrade gracefully
    And no data should be lost during connectivity issues
    
    # Network restoration
    When network connectivity is fully restored
    Then platforms should detect restoration within 10 seconds
    And automatic reconnection should occur
    And queued changes should sync in correct chronological order
    And conflict resolution should trigger if needed
    And users should receive "Connection restored" confirmation
    
    # Stress test: Multiple simultaneous outages
    When network fails while 100 users are actively playing
    Then all users should receive consistent offline experience
    And no user data should be lost
    And system should handle reconnection surge gracefully
    And session state should be preserved for all users

  @data-corruption @integrity @recovery
  Scenario: Data corruption detection and recovery
    Given I have complex characters with extensive game history
    And data integrity checking is enabled
    
    # Simulated data corruption
    When character data becomes corrupted during sync
    Due to "race condition" in concurrent updates
    Then corruption should be detected within next sync cycle
    And affected users should be notified immediately
    And corrupted data should be quarantined
    And automatic rollback should be offered to users
    
    # Manual corruption recovery
    When I choose manual recovery option
    Then I should see timeline of recent character changes
    And I should be able to select restoration point
    When I select restoration point "2 hours ago"
    Then character should be restored to that exact state
    And restoration should be verified across all platforms
    And audit log should record the recovery action
    
    # Preventive integrity measures
    When I make rapid successive changes across platforms
    Within a 30-second window
    Then system should detect potential race conditions
    And implement automatic conflict prevention
    And provide user feedback about synchronization status
    And ensure data consistency through ACID properties
    
    # Stress test: Mass corruption scenario
    When 50 characters experience simultaneous corruption
    Then system should prioritize recovery operations
    And mass recovery tools should be available
    And administrators should receive priority alerts
    And recovery progress should be tracked and reported

  @concurrent-users @race-conditions @stress
  Scenario: High concurrency and race condition handling
    Given 200 users are simultaneously active
    And they are performing overlapping operations
    
    # Character creation surge
    When 50 users simultaneously create characters
    At exactly the same timestamp
    Then all character creations should process successfully
    And each character should receive unique identifier
    And database constraints should prevent duplicates
    And character creation should complete within 30 seconds per user
    
    # Campaign joining race conditions  
    When 20 users try to join a campaign with only 1 slot remaining
    And they all click "Join" within the same second
    Then only 1 user should successfully join
    And remaining 19 should receive "Campaign Full" message
    And no duplicate memberships should occur
    And all users should see consistent campaign status
    
    # Simultaneous editing conflicts
    When multiple GMs edit the same campaign simultaneously:
      | gm_name | platform | edit_type        | timestamp  |
      | Alice   | web      | Add NPC          | 14:30:00.1 |
      | Bob     | mobile   | Modify setting   | 14:30:00.3 |
      | Carol   | web      | Update timeline  | 14:30:00.2 |
    Then edits should be processed in chronological order
    And each editor should see others' changes in real-time
    And merge conflicts should be resolved automatically where possible
    And manual resolution should be required only for true conflicts
    
    # Load stress testing
    When user count increases to 500 concurrent users
    Then system performance should remain within acceptable limits:
      | metric                 | maximum_acceptable |
      | Response time          | < 3 seconds       |
      | Database connections   | < 80% of pool     |
      | Memory usage           | < 85% of available|
      | CPU utilization        | < 75% sustained   |
    And auto-scaling should activate if thresholds are exceeded

  @memory-leaks @performance @degradation
  Scenario: Memory leak detection and performance degradation prevention
    Given the system has been running for 48 hours continuously
    And multiple users have been creating and modifying characters
    
    # Extended session testing
    When I maintain an active session for 8 hours
    With continuous character editing and campaign participation
    Then browser memory usage should not exceed 500MB
    And mobile app memory should remain under 200MB
    And API server memory should be stable without growth
    And no memory leaks should be detected in any platform
    
    # Progressive load testing
    When system load gradually increases from 10 to 1000 users
    Over a period of 4 hours
    Then performance metrics should remain stable:
      | hour | users | response_time | memory_usage | cpu_usage |
      | 1    | 10    | 0.5s         | 45%          | 20%       |
      | 2    | 100   | 1.2s         | 65%          | 35%       |
      | 3    | 500   | 2.1s         | 75%          | 55%       |
      | 4    | 1000  | 2.8s         | 82%          | 70%       |
    And no performance cliff should occur
    And degradation should be gradual and predictable
    
    # Resource cleanup verification
    When users log out after extended sessions
    Then associated resources should be released within 60 seconds
    And session data should be properly garbage collected
    And database connections should return to pool
    And memory usage should decrease proportionally
    
    # Automatic performance recovery
    When performance degrades beyond acceptable thresholds
    Then system should automatically:
      | trigger_condition      | automatic_action                    |
      | Memory usage > 90%     | Force garbage collection            |
      | Response time > 5s     | Enable performance mode             |
      | Database connections   | Scale up connection pool           |
      | CPU usage > 85%        | Activate load balancing            |

  @database-failures @failover @recovery
  Scenario: Database failure and failover procedures
    Given the system uses database clustering for high availability
    And automatic failover is configured
    
    # Primary database failure
    When the primary database server fails unexpectedly
    Then failover should occur within 30 seconds
    And users should experience minimal service interruption
    And all in-flight transactions should be preserved or rolled back cleanly
    And users should receive brief "System maintenance" message during switch
    
    # Gradual database degradation
    When database performance degrades slowly
    With query times increasing from 100ms to 2000ms
    Then system should detect performance degradation
    And implement query optimization strategies
    And potentially switch to read replicas for query operations
    And alert administrators before complete failure
    
    # Database corruption scenarios
    When database corruption is detected in character data tables
    Then affected tables should be automatically isolated
    And system should switch to backup data sources
    And data recovery procedures should initiate automatically
    And users should be notified of temporary limitations
    
    # Split-brain prevention
    When network partition separates database nodes
    Then split-brain scenarios should be prevented through:
      | mechanism           | description                           |
      | Quorum-based voting | Require majority of nodes for writes |
      | Witness node        | Dedicated tie-breaker node           |
      | Fencing             | Isolate minority partition           |
    And data consistency should be maintained
    And conflicting writes should be prevented

  @api-rate-limits @abuse-prevention @security
  Scenario: API rate limiting and abuse prevention
    Given the GraphQL API has rate limiting enabled
    And I have accounts with different permission levels
    
    # Normal rate limit testing
    When I make API requests within normal limits
    At 10 requests per minute per user
    Then all requests should be processed successfully
    And response headers should include rate limit information:
      | header                | example_value |
      | X-RateLimit-Limit     | 60           |
      | X-RateLimit-Remaining | 50           |
      | X-RateLimit-Reset     | 1635724800   |
    
    # Rate limit exceeded
    When I exceed the rate limit with 100 requests in 1 minute
    Then excess requests should be rejected with HTTP 429
    And error message should indicate when requests can resume
    And legitimate requests should resume after cooldown period
    And rate limit violations should be logged
    
    # Burst protection
    When I send 50 simultaneous requests
    Then burst protection should activate
    And requests should be queued and processed at controlled rate
    And no requests should be lost due to burst
    And system stability should be maintained
    
    # Graduated penalties
    When I repeatedly violate rate limits
    Then penalties should escalate:
      | violation_count | penalty                    | duration  |
      | 1-2            | Standard rate limiting     | 1 minute  |
      | 3-5            | Reduced rate limit         | 10 minutes|
      | 6-10           | Severely limited access    | 1 hour    |
      | 11+            | Temporary account suspend  | 24 hours  |
    
    # API abuse scenarios
    When malicious requests attempt to:
      | abuse_type           | detection_method        | response        |
      | Query complexity     | Query depth analysis    | Reject query    |
      | Large result sets    | Result size limits      | Paginate        |
      | Expensive operations | Query cost calculation  | Rate limit      |
      | Authentication bypass| Token validation        | Block request   |
    Then system should detect and prevent abuse automatically
    And security events should be logged and monitored

  @mobile-edge-cases @platform-specific @device-limitations
  Scenario: Mobile platform edge cases and device limitations
    Given I am using the mobile app on various devices
    With different hardware capabilities and OS versions
    
    # Low memory device testing
    When using the app on a device with 2GB RAM
    And multiple apps are running in background
    Then the Traveller app should:
      | behavior              | implementation                    |
      | Memory management     | Release unused character data     |
      | Image optimization    | Load compressed portraits         |
      | Background processing | Pause non-critical sync operations|
      | UI simplification     | Show simplified character sheets  |
    And app should remain functional without crashes
    
    # Network switching scenarios
    When device switches between WiFi and cellular data
    During active character creation session
    Then app should detect network change within 5 seconds
    And seamlessly continue operations on new network
    And sync operations should resume automatically
    And user should see brief network change notification
    
    # Device rotation and multitasking
    When user rotates device during character creation
    Then form data should be preserved
    And UI should adapt to new orientation gracefully
    When user switches to another app briefly
    Then character creation progress should be saved
    And app should resume at exact same position
    
    # Battery optimization scenarios
    When device enters power saving mode
    Then app should reduce background activities:
      | activity_type      | power_save_behavior           |
      | Sync frequency     | Reduce to every 10 minutes    |
      | Animation          | Disable non-essential         |
      | Location services  | Pause unless actively needed  |
      | Push notifications | Batch and reduce frequency    |
    And essential functionality should remain available
    
    # Offline mode stress testing
    When device is offline for extended periods (6+ hours)
    And user continues using app extensively
    Then offline data should be properly maintained
    And storage limits should be managed efficiently
    And sync queue should be optimized to prevent overflow
    And user should receive storage warnings when needed

  @web-browser-compatibility @cross-browser @edge-cases  
  Scenario: Web browser compatibility and edge case handling
    Given the web application supports multiple browsers
    And I have access to different browser versions
    
    # Browser-specific feature testing
    When using the application across browsers:
      | browser        | version | expected_behavior                    |
      | Chrome         | Latest  | Full feature support                |
      | Firefox        | Latest  | Full feature support                |
      | Safari         | Latest  | Full support with WebKit quirks     |
      | Edge           | Latest  | Full feature support                |
      | Mobile Safari  | iOS 14+ | Touch-optimized interface           |
      | Chrome Mobile  | Android | Full mobile functionality           |
    Then all core features should work consistently
    And browser-specific optimizations should be applied
    And graceful degradation should occur for unsupported features
    
    # JavaScript disabled scenarios
    When JavaScript is disabled in the browser
    Then application should display informative message
    And basic HTML fallback should be available where possible
    And clear instructions for enabling JavaScript should be provided
    
    # Local storage limitations
    When browser local storage is disabled or full
    Then application should detect storage limitations
    And provide alternative data persistence methods
    And user should be informed of reduced functionality
    And critical operations should still work with server-side storage
    
    # Browser crash recovery
    When browser crashes during character creation
    And user restarts browser and returns to application
    Then session recovery should attempt to restore progress
    And auto-saved data should be available for restoration
    And user should be presented with recovery options
    And recovered data should be validated before restoration
    
    # Cross-tab synchronization
    When user has multiple tabs open with the same character
    And makes changes in one tab
    Then other tabs should receive updates within 30 seconds
    And conflicting changes should be prevented
    And tab focus should determine edit priority
    And users should be warned about multi-tab editing risks

  @security-stress @penetration @vulnerability
  Scenario: Security stress testing and vulnerability assessment
    Given security monitoring systems are active
    And I have appropriate authorization for security testing
    
    # Authentication stress testing
    When multiple authentication attempts occur simultaneously:
      | attempt_type        | count | timeframe | expected_result      |
      | Valid logins        | 100   | 1 minute  | All succeed          |
      | Invalid passwords   | 50    | 1 minute  | Rate limiting active |
      | Token refreshes     | 200   | 30 seconds| Handled gracefully   |
      | Account lockouts    | 10    | 5 minutes | Proper isolation     |
    Then system should handle all scenarios without degradation
    And security measures should remain effective under load
    And no valid users should be incorrectly blocked
    
    # Input validation stress testing
    When submitting various malicious inputs:
      | input_type          | payload_example           | expected_behavior    |
      | SQL injection       | '; DROP TABLE users; --   | Input sanitization   |
      | XSS attempts        | <script>alert('xss')</    | HTML encoding        |
      | Buffer overflow     | Very long character names | Length validation    |
      | Unicode attacks     | Malformed UTF-8           | Encoding validation  |
    Then all malicious inputs should be properly handled
    And no security vulnerabilities should be exploitable
    And error messages should not reveal system internals
    
    # Session management stress
    When managing large numbers of concurrent sessions:
      | scenario                    | session_count | behavior                    |
      | Normal concurrent sessions  | 1000         | All handled properly        |
      | Rapid session creation      | 100/minute   | Rate limiting applied       |
      | Session hijacking attempts  | 50           | Detected and blocked        |
      | Expired token usage         | 200          | Properly rejected           |
    Then session security should remain robust
    And performance should not degrade due to session overhead
    
    # Data privacy stress testing
    When processing requests that might expose private data:
      | test_scenario              | privacy_requirement           |
      | Character data access      | Only owner can view           |
      | Campaign member info       | Only members see details      |
      | Cross-tenant data leaks    | Strict tenant isolation       |
      | Admin privilege escalation | Role-based access control     |
    Then privacy boundaries should be maintained under all conditions
    And data leakage should be impossible
    And audit logs should capture all access attempts