package com.barrows.travller.api.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.math.BigDecimal;

/**
 * Tests for the Animal class.
 *
 * Note: Animals are stored in a database and accessed through the AnimalRepository interface.
 *
 * @see com.barrows.travller.api.repository.AnimalRepository
 */
public class AnimalTest {

    @Test
    public void testAnimalCreation() {
        // Test creating an animal directly
        Animal dog = new Animal("Dog", AnimalType.DOMESTIC);
        assertEquals("Dog", dog.getName());
        assertEquals(AnimalType.DOMESTIC, dog.getType());

        // Test creating an animal with the factory
        Animal horse = AnimalFactory.createHorse();
        assertEquals("Horse", horse.getName());
        assertEquals(AnimalType.MOUNT, horse.getType());
        assertEquals(BigDecimal.valueOf(500.0), horse.getWeight());

        // Test special traits
        assertTrue(horse.getSpecialTraits().contains("Fast Runner"));
        assertTrue(horse.getSpecialTraits().contains("Beast of Burden"));
    }

    @Test
    public void testAnimalMethods() {
        Animal horse = AnimalFactory.createHorse();

        // Test carrying capacity
        assertEquals(BigDecimal.valueOf(120.0), horse.getCarryingCapacity()); // 12 strength * 10

        // Test dangerous check
        assertFalse(horse.isDangerous());

        Animal bear = AnimalFactory.createBear();
        assertTrue(bear.isDangerous());

        // Test adding attacks
        bear.addAttack("Roar: Intimidation check");
        assertTrue(bear.getAttacks().contains("Roar: Intimidation check"));
    }

    // Note: The AnimalCatalog test has been removed as the class has been deprecated and removed.
    // Animals are now stored in a database and accessed through the AnimalRepository interface.
}
