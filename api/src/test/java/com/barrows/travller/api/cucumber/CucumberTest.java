package com.barrows.travller.api.cucumber;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;

/**
 * Cucumber test runner that runs all features found in the classpath.
 */
@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("../../../../../../../../../features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.barrows.travller.api.cucumber")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty, html:target/cucumber-reports/cucumber.html")
@org.junit.jupiter.api.Tag("cucumber")
public class CucumberTest {
    // This class is intentionally empty. It's used only as a holder for the annotations.
}
