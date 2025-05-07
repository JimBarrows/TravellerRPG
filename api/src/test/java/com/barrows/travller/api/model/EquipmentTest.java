package com.barrows.travller.api.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the Equipment class.
 *
 * Note: Equipment items are stored in a database and accessed through the EquipmentRepository interface.
 *
 * @see com.barrows.travller.api.repository.EquipmentRepository
 */
public class EquipmentTest {

    @Test
    public void testEquipmentCreation() {
        // Test creating equipment directly
        Equipment comms = new Equipment("Comms Unit", EquipmentType.COMMUNICATION);
        assertEquals("Comms Unit", comms.getName());
        assertEquals(EquipmentType.COMMUNICATION, comms.getType());

        // Test creating equipment with the factory
        Equipment medkit = EquipmentFactory.createMedkit();
        assertEquals("Medkit", medkit.getName());
        assertEquals(EquipmentType.MEDICAL, medkit.getType());
        assertEquals(1000, medkit.getCost());

        // Test features
        assertTrue(medkit.getFeatures().contains("Trauma Treatment"));
        assertTrue(medkit.getFeatures().contains("Disease Diagnosis"));
    }

    @Test
    public void testEquipmentMethods() {
        Equipment envSuit = EquipmentFactory.createEnvironmentSuit();

        // Test condition and damage
        assertEquals(100, envSuit.getCondition());
        envSuit.applyDamage(30);
        assertEquals(70, envSuit.getCondition());

        // Test repair
        envSuit.repair(20);
        assertEquals(90, envSuit.getCondition());

        // Test functional check
        assertTrue(envSuit.isFunctional());
        envSuit.applyDamage(100); // Apply enough damage to break it
        assertFalse(envSuit.isFunctional());

        // Test legal check
        Equipment comms = EquipmentFactory.createCommsUnit();
        comms.setRequiresPermit(false);
        assertTrue(comms.isLegalAt(10));

        comms.setRequiresPermit(true);
        comms.setRestrictedLawLevel(5);
        assertTrue(comms.isLegalAt(4));
        assertFalse(comms.isLegalAt(5));
    }

    // Note: The EquipmentCatalog test has been removed as the class has been deprecated and removed.
    // Equipment items are now stored in a database and accessed through the EquipmentRepository interface.
}
