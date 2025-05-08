package com.barrows.travller.api.cucumber;

import com.barrows.travller.api.TestApiApplication;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Configuration class for Cucumber tests.
 * This class integrates Cucumber with Spring Boot test context.
 */
@CucumberContextConfiguration
@SpringBootTest(classes = TestApiApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class CucumberConfiguration {
    // This class is intentionally empty. It's used only as a holder for the annotations.
}
