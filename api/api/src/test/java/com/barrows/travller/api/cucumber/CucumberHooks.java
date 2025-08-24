package com.barrows.travller.api.cucumber;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.BeforeAll;
import io.cucumber.java.AfterAll;
import io.cucumber.java.Scenario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Cucumber hooks for test setup and teardown.
 * Manages test data, database state, and test context across scenarios.
 */
@SpringBootTest
@ActiveProfiles("test")
public class CucumberHooks {

    @Autowired
    private ApiTestHelper testHelper;

    @Autowired
    private TestDataManager testDataManager;

    private static boolean suiteSetupComplete = false;

    /**
     * Runs once before all scenarios in the test suite.
     */
    @BeforeAll
    public static void beforeAllScenarios() {
        System.out.println("=== Starting Traveller RPG API BDD Test Suite ===");
    }

    /**
     * Runs once after all scenarios in the test suite.
     */
    @AfterAll
    public static void afterAllScenarios() {
        System.out.println("=== Completed Traveller RPG API BDD Test Suite ===");
    }

    /**
     * Runs before each scenario.
     * Sets up clean test state and seeds necessary data.
     */
    @Before
    @Transactional
    public void beforeScenario(Scenario scenario) {
        System.out.println("Starting scenario: " + scenario.getName());
        
        // Clear any previous test context
        if (testHelper != null) {
            testHelper.clearContext();
        }
        
        // Seed standard game data if not already done
        if (testDataManager != null && !testDataManager.isDataSeeded()) {
            testDataManager.seedStandardGameData();
            System.out.println("Seeded " + testDataManager.getCreatedEntitiesCount() + " test entities");
        }
        
        // Store scenario information for later use
        if (testHelper != null) {
            testHelper.storeInContext("currentScenario", scenario.getName());
            testHelper.storeInContext("scenarioStartTime", System.currentTimeMillis());
        }
        
        suiteSetupComplete = true;
    }

    /**
     * Runs after each scenario.
     * Cleans up scenario-specific data and logs results.
     */
    @After
    public void afterScenario(Scenario scenario) {
        long startTime = 0;
        if (testHelper != null) {
            Long scenarioStartTime = testHelper.getFromContext("scenarioStartTime");
            if (scenarioStartTime != null) {
                startTime = scenarioStartTime;
            }
        }
        
        long duration = System.currentTimeMillis() - startTime;
        String status = scenario.isFailed() ? "FAILED" : "PASSED";
        
        System.out.println("Completed scenario: " + scenario.getName() + 
                         " [" + status + "] in " + duration + "ms");
        
        // Log failure details if scenario failed
        if (scenario.isFailed()) {
            System.err.println("Scenario failed: " + scenario.getName());
            
            // Log any test context that might help with debugging
            if (testHelper != null) {
                logTestContext();
            }
        }
        
        // Clean up scenario-specific test data
        if (testHelper != null) {
            testHelper.cleanupTestData();
        }
        
        // Clear test context for next scenario
        if (testHelper != null) {
            testHelper.clearContext();
        }
    }

    /**
     * Logs current test context for debugging purposes.
     */
    private void logTestContext() {
        try {
            System.err.println("=== Test Context at Failure ===");
            // This would log relevant context information
            // In a real implementation, you might want to log:
            // - Current character state
            // - Last API responses
            // - Test data that was created
            // - Configuration values
            System.err.println("Test context logging not fully implemented");
            System.err.println("===============================");
        } catch (Exception e) {
            System.err.println("Failed to log test context: " + e.getMessage());
        }
    }

    /**
     * Hook for scenarios tagged with @database
     * Ensures clean database state for scenarios that need it.
     */
    @Before("@database")
    public void beforeDatabaseScenario(Scenario scenario) {
        System.out.println("Setting up clean database state for: " + scenario.getName());
        // Additional database setup if needed
    }

    /**
     * Hook for scenarios tagged with @api
     * Ensures API services are ready for testing.
     */
    @Before("@api") 
    public void beforeApiScenario(Scenario scenario) {
        System.out.println("Setting up API test context for: " + scenario.getName());
        
        if (testHelper != null) {
            // Verify API test infrastructure is ready
            testHelper.storeInContext("apiTestMode", true);
        }
    }

    /**
     * Hook for scenarios tagged with @graphql
     * Sets up GraphQL-specific test context.
     */
    @Before("@graphql")
    public void beforeGraphQLScenario(Scenario scenario) {
        System.out.println("Setting up GraphQL test context for: " + scenario.getName());
        
        if (testHelper != null) {
            testHelper.storeInContext("graphqlTestMode", true);
        }
    }

    /**
     * Hook for scenarios tagged with @character
     * Sets up character-related test data.
     */
    @Before("@character")
    public void beforeCharacterScenario(Scenario scenario) {
        System.out.println("Setting up character test context for: " + scenario.getName());
        // Could pre-create test characters or set up character-specific state
    }

    /**
     * Hook for scenarios tagged with @combat
     * Sets up combat-related test data.
     */
    @Before("@combat")
    public void beforeCombatScenario(Scenario scenario) {
        System.out.println("Setting up combat test context for: " + scenario.getName());
        // Could pre-create combatants, weapons, and armor
    }

    /**
     * Hook for scenarios tagged with @trading
     * Sets up trading-related test data.
     */
    @Before("@trading")
    public void beforeTradingScenario(Scenario scenario) {
        System.out.println("Setting up trading test context for: " + scenario.getName());
        // Could pre-create trade goods, markets, and pricing data
    }

    /**
     * Hook for scenarios tagged with @space
     * Sets up space travel-related test data.
     */
    @Before("@space")
    public void beforeSpaceScenario(Scenario scenario) {
        System.out.println("Setting up space travel test context for: " + scenario.getName());
        // Could pre-create spaceships, star systems, and navigation data
    }

    /**
     * Hook for scenarios tagged with @campaign
     * Sets up campaign management test data.
     */
    @Before("@campaign")
    public void beforeCampaignScenario(Scenario scenario) {
        System.out.println("Setting up campaign management test context for: " + scenario.getName());
        // Could pre-create campaigns, GMs, and players
    }

    /**
     * Hook for scenarios tagged with @cleanup
     * Ensures extra cleanup for scenarios that create lots of data.
     */
    @After("@cleanup")
    public void afterCleanupScenario(Scenario scenario) {
        System.out.println("Performing extra cleanup for: " + scenario.getName());
        
        if (testDataManager != null) {
            // Could perform additional cleanup beyond the standard cleanup
        }
    }

    /**
     * Hook for scenarios tagged with @slow
     * Logs timing information for performance monitoring.
     */
    @After("@slow")
    public void afterSlowScenario(Scenario scenario) {
        Long startTime = null;
        if (testHelper != null) {
            startTime = testHelper.getFromContext("scenarioStartTime");
        }
        
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            System.out.println("Slow scenario '" + scenario.getName() + "' completed in " + duration + "ms");
            
            if (duration > 10000) { // More than 10 seconds
                System.err.println("WARNING: Scenario took longer than expected: " + duration + "ms");
            }
        }
    }

    /**
     * Returns whether the test suite setup is complete.
     */
    public static boolean isSuiteSetupComplete() {
        return suiteSetupComplete;
    }
}