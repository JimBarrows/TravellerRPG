package com.barrows.travller.api.cucumber;

import com.barrows.travller.api.TestApiApplication;
import com.barrows.travller.api.TestcontainersConfiguration;
import io.cucumber.spring.CucumberContextConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for CucumberConfiguration class.
 * Validates that the configuration class has proper annotations and setup
 * to support BDD scenario execution with Spring Boot integration.
 */
class CucumberConfigurationTest {

    @Test
    void cucumberConfiguration_shouldHaveCucumberContextConfigurationAnnotation() {
        // Given: CucumberConfiguration class exists
        Class<?> configClass = CucumberConfiguration.class;
        
        // When: We check for required annotation
        boolean hasAnnotation = configClass.isAnnotationPresent(CucumberContextConfiguration.class);
        
        // Then: The annotation should be present
        assertThat(hasAnnotation)
            .as("CucumberConfiguration must have @CucumberContextConfiguration for Spring integration")
            .isTrue();
    }

    @Test
    void cucumberConfiguration_shouldHaveSpringBootTestAnnotation() {
        // Given: CucumberConfiguration class exists
        Class<?> configClass = CucumberConfiguration.class;
        
        // When: We check for SpringBootTest annotation
        boolean hasAnnotation = configClass.isAnnotationPresent(SpringBootTest.class);
        
        // Then: The annotation should be present
        assertThat(hasAnnotation)
            .as("CucumberConfiguration must have @SpringBootTest for Spring Boot integration")
            .isTrue();
    }

    @Test
    void cucumberConfiguration_shouldSpecifyCorrectTestApplication() {
        // Given: CucumberConfiguration class has SpringBootTest annotation
        Class<?> configClass = CucumberConfiguration.class;
        SpringBootTest annotation = configClass.getAnnotation(SpringBootTest.class);
        
        // When: We check the configured classes
        Class<?>[] configuredClasses = annotation.classes();
        
        // Then: It should specify TestApiApplication
        assertThat(configuredClasses)
            .as("CucumberConfiguration should specify TestApiApplication as the test class")
            .contains(TestApiApplication.class);
    }

    @Test
    void cucumberConfiguration_shouldUseRandomPortWebEnvironment() {
        // Given: CucumberConfiguration class has SpringBootTest annotation
        Class<?> configClass = CucumberConfiguration.class;
        SpringBootTest annotation = configClass.getAnnotation(SpringBootTest.class);
        
        // When: We check the web environment configuration
        SpringBootTest.WebEnvironment webEnvironment = annotation.webEnvironment();
        
        // Then: It should use RANDOM_PORT for test isolation
        assertThat(webEnvironment)
            .as("CucumberConfiguration should use RANDOM_PORT for web environment isolation")
            .isEqualTo(SpringBootTest.WebEnvironment.RANDOM_PORT);
    }

    @Test
    void cucumberConfiguration_shouldImportTestcontainersConfiguration() {
        // Given: CucumberConfiguration class exists
        Class<?> configClass = CucumberConfiguration.class;
        
        // When: We check for Import annotation
        boolean hasImportAnnotation = configClass.isAnnotationPresent(Import.class);
        
        // Then: The Import annotation should be present
        assertThat(hasImportAnnotation)
            .as("CucumberConfiguration should import TestcontainersConfiguration")
            .isTrue();
            
        // And: It should import the correct configuration class
        Import importAnnotation = configClass.getAnnotation(Import.class);
        Class<?>[] importedClasses = importAnnotation.value();
        
        assertThat(importedClasses)
            .as("CucumberConfiguration should import TestcontainersConfiguration for container setup")
            .contains(TestcontainersConfiguration.class);
    }

    @Test
    void cucumberConfiguration_shouldBeInCorrectPackage() {
        // Given: CucumberConfiguration class exists
        Class<?> configClass = CucumberConfiguration.class;
        
        // When: We check the package name
        String packageName = configClass.getPackageName();
        
        // Then: It should be in the cucumber package for proper glue path resolution
        assertThat(packageName)
            .as("CucumberConfiguration should be in the cucumber package for glue path resolution")
            .isEqualTo("com.barrows.travller.api.cucumber");
    }

    @Test
    void cucumberConfiguration_shouldBePublicClass() {
        // Given: CucumberConfiguration class exists
        Class<?> configClass = CucumberConfiguration.class;
        
        // When: We check the class modifiers
        boolean isPublic = java.lang.reflect.Modifier.isPublic(configClass.getModifiers());
        
        // Then: The class should be public for Spring to access it
        assertThat(isPublic)
            .as("CucumberConfiguration should be public for Spring framework access")
            .isTrue();
    }

    @Test
    void cucumberConfiguration_shouldNotBeAbstractClass() {
        // Given: CucumberConfiguration class exists
        Class<?> configClass = CucumberConfiguration.class;
        
        // When: We check if the class is abstract
        boolean isAbstract = java.lang.reflect.Modifier.isAbstract(configClass.getModifiers());
        
        // Then: The class should not be abstract
        assertThat(isAbstract)
            .as("CucumberConfiguration should not be abstract - it needs to be instantiable")
            .isFalse();
    }

    @Test
    void cucumberConfiguration_shouldHaveDefaultConstructor() {
        // Given: CucumberConfiguration class exists
        Class<?> configClass = CucumberConfiguration.class;
        
        // When: We check for constructors
        boolean hasDefaultConstructor = false;
        try {
            configClass.getDeclaredConstructor();
            hasDefaultConstructor = true;
        } catch (NoSuchMethodException e) {
            // Default constructor not explicitly declared, check if it's implicit
            hasDefaultConstructor = configClass.getDeclaredConstructors().length == 0;
        }
        
        // Then: A default constructor should be available
        assertThat(hasDefaultConstructor)
            .as("CucumberConfiguration should have a default constructor for Spring instantiation")
            .isTrue();
    }
}