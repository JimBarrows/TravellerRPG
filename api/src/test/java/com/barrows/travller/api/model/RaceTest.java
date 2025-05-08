package com.barrows.travller.api.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Tests for the Race and related classes.
 */
public class RaceTest {

    @Test
    public void testRaceCreation() {
        // Test creating a race directly
        Race human = new Race(RaceType.HUMAN);
        assertEquals("Human", human.getName());
        assertEquals(RaceType.HUMAN, human.getType());
    }

    @Test
    public void testCharacterWithRace() {
        // Create a human character
        Character human = new Character("John Doe");
        assertEquals(RaceType.HUMAN, human.getRace().getType());

        // Add characteristics
        human.addCharacteristic(new Characteristic(CharacteristicType.STRENGTH, 10));
        human.addCharacteristic(new Characteristic(CharacteristicType.DEXTERITY, 8));
        human.addCharacteristic(new Characteristic(CharacteristicType.ENDURANCE, 9));
        human.addCharacteristic(new Characteristic(CharacteristicType.INTELLIGENCE, 7));

        // Verify characteristics
        assertEquals(10, human.getCharacteristic(CharacteristicType.STRENGTH).getValue());
        assertEquals(8, human.getCharacteristic(CharacteristicType.DEXTERITY).getValue());
    }

    @Test
    public void testCharacterCreationWithRace() {
        // Create a character with a specific race
        Character hivers = new Character("Hive Mind", RaceType.HIVERS);

        // Add characteristics
        hivers.addCharacteristic(new Characteristic(CharacteristicType.STRENGTH, 10));
        hivers.addCharacteristic(new Characteristic(CharacteristicType.INTELLIGENCE, 10));

        // Verify race information
        assertEquals(RaceType.HIVERS, hivers.getRace().getType());
    }
}
