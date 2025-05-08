package com.barrows.travller.api.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

        // Test creating a race with the factory
        Race aslan = RaceFactory.createAslan();
        assertEquals("Aslan", aslan.getName());
        assertEquals(RaceType.ASLAN, aslan.getType());
        assertEquals(1, aslan.getCharacteristicModifier(CharacteristicType.STRENGTH));
        assertEquals(1, aslan.getCharacteristicModifier(CharacteristicType.DEXTERITY));

        // Test special abilities
        assertTrue(aslan.getSpecialAbilities().contains("Natural Weapons (claws)"));
        assertTrue(aslan.getSpecialAbilities().contains("Territorial Instinct"));
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

        // Change race to Aslan
        human.setRace(RaceFactory.createAslan());

        // Verify racial modifiers are applied
        assertEquals(11, human.getCharacteristic(CharacteristicType.STRENGTH).getValue()); // +1
        assertEquals(9, human.getCharacteristic(CharacteristicType.DEXTERITY).getValue()); // +1
        assertEquals(9, human.getCharacteristic(CharacteristicType.ENDURANCE).getValue()); // No change

        // Change race to Vargr
        human.setRace(RaceFactory.createVargr());

        // Verify racial modifiers are applied (and old ones removed)
        assertEquals(10, human.getCharacteristic(CharacteristicType.STRENGTH).getValue()); // Back to original
        assertEquals(9, human.getCharacteristic(CharacteristicType.DEXTERITY).getValue()); // +1
        assertEquals(8, human.getCharacteristic(CharacteristicType.ENDURANCE).getValue()); // -1
    }

    @Test
    public void testCharacterCreationWithRace() {
        // Create a character with a specific race
        Character hivers = new Character("Hive Mind", RaceType.HIVERS);

        // Add characteristics
        hivers.addCharacteristic(new Characteristic(CharacteristicType.STRENGTH, 10));
        hivers.addCharacteristic(new Characteristic(CharacteristicType.INTELLIGENCE, 10));

        // Verify racial modifiers are applied
        assertEquals(8, hivers.getCharacteristic(CharacteristicType.STRENGTH).getValue()); // -2
        assertEquals(12, hivers.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue()); // +2

        // Verify race information
        assertEquals(RaceType.HIVERS, hivers.getRace().getType());
        assertTrue(hivers.getRace().getSpecialAbilities().contains("Six Limbs"));
    }
}
