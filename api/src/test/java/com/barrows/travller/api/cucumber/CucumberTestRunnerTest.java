package com.barrows.travller.api.cucumber;

import org.junit.jupiter.api.Test;
import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for CucumberTest runner class.
 * Validates that the test runner has proper JUnit Platform Suite configuration
 * to execute Cucumber scenarios with correct glue paths and plugins.
 */
class CucumberTestRunnerTest {

    @Test
    void cucumberTestRunner_shouldHaveSuiteAnnotation() {
        // Given: CucumberTest class exists
        Class<?> runnerClass = CucumberTest.class;
        
        // When: We check for Suite annotation
        boolean hasSuiteAnnotation = runnerClass.isAnnotationPresent(Suite.class);
        
        // Then: The annotation should be present
        assertThat(hasSuiteAnnotation)
            .as("CucumberTest should have @Suite annotation for JUnit Platform integration")
            .isTrue();
    }

    @Test
    void cucumberTestRunner_shouldIncludeCucumberEngine() {
        // Given: CucumberTest class exists
        Class<?> runnerClass = CucumberTest.class;
        
        // When: We check the IncludeEngines annotation
        IncludeEngines annotation = runnerClass.getAnnotation(IncludeEngines.class);
        
        // Then: The annotation should be present and include cucumber engine
        assertThat(annotation)
            .as("CucumberTest should have @IncludeEngines annotation")
            .isNotNull();
            
        String[] engines = annotation.value();
        assertThat(engines)
            .as("CucumberTest should include cucumber engine")
            .contains("cucumber");
    }

    @Test
    void cucumberTestRunner_shouldSelectCorrectClasspathResource() {
        // Given: CucumberTest class exists
        Class<?> runnerClass = CucumberTest.class;
        
        // When: We check the SelectClasspathResource annotation
        SelectClasspathResource annotation = runnerClass.getAnnotation(SelectClasspathResource.class);
        
        // Then: The annotation should be present with correct resource path
        assertThat(annotation)
            .as("CucumberTest should have @SelectClasspathResource annotation")
            .isNotNull();
            
        String resourcePath = annotation.value();
        assertThat(resourcePath)
            .as("CucumberTest should select features from correct classpath location")
            .isNotEmpty()
            .contains("features");
    }

    @Test
    void cucumberTestRunner_shouldHaveCorrectGlueConfiguration() {
        // Given: CucumberTest class exists
        Class<?> runnerClass = CucumberTest.class;
        
        // When: We check for ConfigurationParameter annotations
        ConfigurationParameter[] parameters = runnerClass.getAnnotationsByType(ConfigurationParameter.class);
        
        // Then: There should be configuration parameters
        assertThat(parameters)
            .as("CucumberTest should have configuration parameters")
            .isNotEmpty();
            
        // And: One of them should be for glue path
        boolean hasGlueConfig = false;
        String glueValue = null;
        
        for (ConfigurationParameter param : parameters) {
            if (GLUE_PROPERTY_NAME.equals(param.key())) {
                hasGlueConfig = true;
                glueValue = param.value();
                break;
            }
        }
        
        assertThat(hasGlueConfig)
            .as("CucumberTest should have glue path configuration")
            .isTrue();
            
        assertThat(glueValue)
            .as("CucumberTest glue path should point to cucumber package")
            .isEqualTo("com.barrows.travller.api.cucumber");
    }

    @Test
    void cucumberTestRunner_shouldHavePluginConfiguration() {
        // Given: CucumberTest class exists
        Class<?> runnerClass = CucumberTest.class;
        
        // When: We check for plugin configuration
        ConfigurationParameter[] parameters = runnerClass.getAnnotationsByType(ConfigurationParameter.class);
        
        // Then: There should be a plugin configuration
        boolean hasPluginConfig = false;
        String pluginValue = null;
        
        for (ConfigurationParameter param : parameters) {
            if (PLUGIN_PROPERTY_NAME.equals(param.key())) {
                hasPluginConfig = true;
                pluginValue = param.value();
                break;
            }
        }
        
        assertThat(hasPluginConfig)
            .as("CucumberTest should have plugin configuration for reporting")
            .isTrue();
            
        assertThat(pluginValue)
            .as("CucumberTest should configure pretty printer and HTML report")
            .contains("pretty")
            .contains("html:");
    }

    @Test
    void cucumberTestRunner_shouldHaveCucumberTag() {
        // Given: CucumberTest class exists
        Class<?> runnerClass = CucumberTest.class;
        
        // When: We check for JUnit tag annotation
        org.junit.jupiter.api.Tag tagAnnotation = runnerClass.getAnnotation(org.junit.jupiter.api.Tag.class);
        
        // Then: The class should be tagged for test categorization
        assertThat(tagAnnotation)
            .as("CucumberTest should have @Tag annotation for test categorization")
            .isNotNull();
            
        String tagValue = tagAnnotation.value();
        assertThat(tagValue)
            .as("CucumberTest should be tagged as cucumber test")
            .isEqualTo("cucumber");
    }

    @Test
    void cucumberTestRunner_shouldBeInCorrectPackage() {
        // Given: CucumberTest class exists
        Class<?> runnerClass = CucumberTest.class;
        
        // When: We check the package name
        String packageName = runnerClass.getPackageName();
        
        // Then: It should be in the cucumber package
        assertThat(packageName)
            .as("CucumberTest should be in the cucumber package")
            .isEqualTo("com.barrows.travller.api.cucumber");
    }

    @Test
    void cucumberTestRunner_shouldBePublicClass() {
        // Given: CucumberTest class exists
        Class<?> runnerClass = CucumberTest.class;
        
        // When: We check the class modifiers
        boolean isPublic = java.lang.reflect.Modifier.isPublic(runnerClass.getModifiers());
        
        // Then: The class should be public
        assertThat(isPublic)
            .as("CucumberTest should be public for JUnit Platform to discover it")
            .isTrue();
    }

    @Test
    void cucumberTestRunner_shouldBeEmptyTestClass() {
        // Given: CucumberTest class exists
        Class<?> runnerClass = CucumberTest.class;
        
        // When: We check for declared methods
        Method[] declaredMethods = runnerClass.getDeclaredMethods();
        
        // Then: The class should have no methods (it's just an annotation holder)
        assertThat(declaredMethods)
            .as("CucumberTest should be empty - it's just an annotation holder")
            .isEmpty();
    }

    @Test
    void cucumberTestRunner_shouldNotBeAbstract() {
        // Given: CucumberTest class exists
        Class<?> runnerClass = CucumberTest.class;
        
        // When: We check if the class is abstract
        boolean isAbstract = java.lang.reflect.Modifier.isAbstract(runnerClass.getModifiers());
        
        // Then: The class should not be abstract
        assertThat(isAbstract)
            .as("CucumberTest should not be abstract - JUnit needs to instantiate it")
            .isFalse();
    }
}