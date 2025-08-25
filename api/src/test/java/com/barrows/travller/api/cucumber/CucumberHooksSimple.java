package com.barrows.travller.api.cucumber;

import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.BeforeAll;
import io.cucumber.java.AfterAll;
import io.cucumber.java.Scenario;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Simplified Cucumber hooks for basic test setup and teardown.
 * Manages basic test lifecycle without complex dependencies.
 */
@SpringBootTest
@ActiveProfiles("test")
public class CucumberHooksSimple {

    private static boolean suiteSetupComplete = false;

    @BeforeAll
    public static void beforeAllScenarios() {
        System.out.println("=== Starting Traveller RPG API BDD Test Suite ===");
    }

    @AfterAll
    public static void afterAllScenarios() {
        System.out.println("=== Completed Traveller RPG API BDD Test Suite ===");
    }

    @Before
    @Transactional
    public void beforeScenario(Scenario scenario) {
        System.out.println("Starting scenario: " + scenario.getName());
        suiteSetupComplete = true;
    }

    @After
    public void afterScenario(Scenario scenario) {
        String status = scenario.isFailed() ? "FAILED" : "PASSED";
        System.out.println("Completed scenario: " + scenario.getName() + " [" + status + "]");
        
        if (scenario.isFailed()) {
            System.err.println("Scenario failed: " + scenario.getName());
        }
    }

    public static boolean isSuiteSetupComplete() {
        return suiteSetupComplete;
    }
}