package com.barrows.travller.api.cucumber;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Simple step definitions to test Cucumber runtime configuration.
 * These steps validate basic Spring context integration.
 */
@SpringBootTest
public class SimpleRuntimeStepDefinitions {

    @Autowired(required = false)
    private ApplicationContext applicationContext;

    private boolean testExecuted = false;

    @Given("the Spring application context is available")
    public void the_spring_application_context_is_available() {
        assertThat(applicationContext)
            .as("Spring application context should be available")
            .isNotNull();
    }

    @When("I run a simple test scenario")
    public void i_run_a_simple_test_scenario() {
        testExecuted = true;
    }

    @Then("the test should pass without configuration errors")
    public void the_test_should_pass_without_configuration_errors() {
        assertThat(testExecuted)
            .as("Test should have executed successfully")
            .isTrue();
            
        assertThat(applicationContext)
            .as("Application context should remain available")
            .isNotNull();
    }
}