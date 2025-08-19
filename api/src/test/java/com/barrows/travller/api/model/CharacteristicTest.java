package com.barrows.travller.api.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the Characteristic class.
 * Tests cover all the business logic including modifiers, damage, healing, and aging effects.
 */
public class CharacteristicTest {

    private Characteristic strength;
    private Characteristic intelligence;

    @BeforeEach
    public void setUp() {
        strength = new Characteristic(CharacteristicType.STRENGTH, 10);
        intelligence = new Characteristic(CharacteristicType.INTELLIGENCE, 8);
    }

    @Test
    public void testCharacteristicCreation() {
        assertEquals(CharacteristicType.STRENGTH, strength.getType());
        assertEquals(10, strength.getValue());
        assertEquals(10, strength.getOriginalValue());
    }

    @Test
    public void testNoArgsConstructor() {
        Characteristic characteristic = new Characteristic();
        assertNull(characteristic.getType());
        assertEquals(0, characteristic.getValue());
        assertEquals(0, characteristic.getOriginalValue());
    }

    @ParameterizedTest
    @CsvSource({
        "0, -3",
        "1, -3", 
        "2, -2",
        "3, -2",
        "4, -1",
        "5, -1",
        "6, 0",
        "7, 0", 
        "8, 0",
        "9, 1",
        "10, 1",
        "11, 1",
        "12, 2",
        "13, 2",
        "14, 2",
        "15, 3",
        "16, 3",
        "18, 3"
    })
    public void testGetModifier(int value, int expectedModifier) {
        Characteristic characteristic = new Characteristic(CharacteristicType.DEXTERITY, value);
        assertEquals(expectedModifier, characteristic.getModifier());
    }

    @Test
    public void testApplyDamage() {
        // Apply moderate damage
        assertEquals(7, strength.applyDamage(3));
        assertEquals(7, strength.getValue());
        assertEquals(10, strength.getOriginalValue()); // Original should remain unchanged
        
        // Apply more damage
        assertEquals(2, strength.applyDamage(5));
        assertEquals(2, strength.getValue());
        
        // Test damage that would go negative - should not go below 0
        assertEquals(0, strength.applyDamage(5));
        assertEquals(0, strength.getValue());
    }

    @Test
    public void testHeal() {
        // First damage the characteristic
        strength.applyDamage(6); // Strength is now 4
        assertEquals(4, strength.getValue());
        
        // Heal part of the damage
        assertEquals(7, strength.heal(3));
        assertEquals(7, strength.getValue());
        
        // Heal more than the damage - should not exceed original value
        assertEquals(10, strength.heal(5));
        assertEquals(10, strength.getValue());
        assertEquals(10, strength.getOriginalValue());
    }

    @Test
    public void testApplyAging() {
        // Apply aging effects
        assertEquals(8, strength.applyAging(2));
        assertEquals(8, strength.getValue());
        assertEquals(8, strength.getOriginalValue()); // Original should also be reduced
        
        // Apply more aging
        assertEquals(5, strength.applyAging(3));
        assertEquals(5, strength.getValue());
        assertEquals(5, strength.getOriginalValue());
        
        // Test aging that would go negative - should not go below 0
        assertEquals(0, strength.applyAging(10));
        assertEquals(0, strength.getValue());
        assertEquals(0, strength.getOriginalValue());
    }

    @Test
    public void testComplexScenario() {
        // Create a character with 12 strength
        Characteristic str = new Characteristic(CharacteristicType.STRENGTH, 12);
        
        // Apply some damage
        str.applyDamage(3); // Now 9
        assertEquals(9, str.getValue());
        assertEquals(1, str.getModifier()); // Modifier should be +1 for value 9
        
        // Heal partially
        str.heal(2); // Now 11
        assertEquals(11, str.getValue());
        assertEquals(1, str.getModifier()); // Modifier should still be +1
        
        // Apply aging (permanent reduction)
        str.applyAging(1); // Value and original both reduced by 1
        assertEquals(10, str.getValue());
        assertEquals(11, str.getOriginalValue()); // Original was 12, aged to 11
        
        // Now healing can only go to the new aged maximum
        str.applyDamage(5); // Down to 5
        assertEquals(5, str.getValue());
        str.heal(10); // Try to heal a lot
        assertEquals(11, str.getValue()); // Should only heal to aged maximum
    }

    @Test
    public void testDifferentCharacteristicTypes() {
        Characteristic endurance = new Characteristic(CharacteristicType.ENDURANCE, 6);
        Characteristic education = new Characteristic(CharacteristicType.EDUCATION, 14);
        Characteristic social = new Characteristic(CharacteristicType.SOCIAL_STANDING, 9);
        
        assertEquals(CharacteristicType.ENDURANCE, endurance.getType());
        assertEquals(CharacteristicType.EDUCATION, education.getType());
        assertEquals(CharacteristicType.SOCIAL_STANDING, social.getType());
        
        assertEquals(0, endurance.getModifier());
        assertEquals(2, education.getModifier());
        assertEquals(1, social.getModifier());
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 1, 5, 10, 15, 20})
    public void testZeroDamageAndHeal(int initialValue) {
        Characteristic characteristic = new Characteristic(CharacteristicType.DEXTERITY, initialValue);
        
        // Applying zero damage should not change value
        int originalValue = characteristic.getValue();
        assertEquals(originalValue, characteristic.applyDamage(0));
        assertEquals(originalValue, characteristic.getValue());
        
        // Applying zero heal should not change value
        assertEquals(originalValue, characteristic.heal(0));
        assertEquals(originalValue, characteristic.getValue());
        
        // Applying zero aging should not change values
        assertEquals(originalValue, characteristic.applyAging(0));
        assertEquals(originalValue, characteristic.getValue());
        assertEquals(initialValue, characteristic.getOriginalValue());
    }
}