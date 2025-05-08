package com.barrows.travller.api.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the Spaceship class.
 *
 * Note: Spaceships are stored in a database and accessed through the SpaceshipRepository interface.
 *
 * @see com.barrows.travller.api.repository.SpaceshipRepository
 */
public class SpaceshipTest {

    @Test
    public void testSpaceshipCreation() {
        // Test creating a spaceship directly
        Spaceship scout = new Spaceship("Scout", SpaceshipType.SCOUT);
        assertEquals("Scout", scout.getName());
        assertEquals(SpaceshipType.SCOUT, scout.getType());

        // Test creating a spaceship with the factory
        Spaceship freeTrader = SpaceshipFactory.createFreeTrader();
        assertEquals("Free Trader", freeTrader.getName());
        assertEquals(SpaceshipType.TRADER, freeTrader.getType());
        assertEquals(new BigDecimal("37.0"), freeTrader.getCostMCr());

        // Test features
        assertTrue(freeTrader.getFeatures().contains("Cargo Handling Equipment"));
        assertTrue(freeTrader.getFeatures().contains("Computer/1"));
    }

    @Test
    public void testSpaceshipMethods() {
        Spaceship patrolCruiser = SpaceshipFactory.createPatrolCruiser();

        // Test damage application
        assertEquals(400, patrolCruiser.getHullPoints()); // Initial hull points
        patrolCruiser.applyDamage(20);
        assertEquals(388, patrolCruiser.getHullPoints()); // 20 damage - 8 armor = 12 damage to hull

        // Test repair
        patrolCruiser.repair(10, 0);
        assertEquals(398, patrolCruiser.getHullPoints());

        // Test operational check
        assertTrue(patrolCruiser.isOperational());
        patrolCruiser.applyDamage(500); // Apply enough damage to disable it
        assertFalse(patrolCruiser.isOperational());

        // Test legal check
        Spaceship yacht = SpaceshipFactory.createYacht();
        yacht.setRequiresPermit(false);
        assertTrue(yacht.isLegalAt(10));

        yacht.setRequiresPermit(true);
        yacht.setRestrictedLawLevel(5);
        assertTrue(yacht.isLegalAt(4));
        assertFalse(yacht.isLegalAt(5));
    }

    @Test
    public void testSpaceshipMaintenance() {
        Spaceship farTrader = SpaceshipFactory.createFarTrader();

        // Test initial condition
        assertEquals(100, farTrader.getCondition());

        // Test successful maintenance
        assertTrue(farTrader.performMaintenance(10)); // Skill check of 10 should succeed
        assertEquals(100, farTrader.getCondition()); // Already at max condition

        // Damage the spaceship first
        farTrader.applyDamage(30);
        int damagedCondition = farTrader.getCondition();
        assertTrue(damagedCondition < 100);

        // Test successful maintenance after damage
        assertTrue(farTrader.performMaintenance(10));
        assertTrue(farTrader.getCondition() > damagedCondition);

        // Test failed maintenance
        int currentCondition = farTrader.getCondition();
        assertFalse(farTrader.performMaintenance(2)); // Skill check of 2 should fail
        assertTrue(farTrader.getCondition() < currentCondition); // Failed maintenance should worsen condition
    }

    @Test
    public void testSpaceshipJumpCalculations() {
        Spaceship scout = SpaceshipFactory.createScout();

        // Test jump fuel calculations
        assertEquals(new BigDecimal("10.0"), scout.calculateFuelForJump(1)); // 100 tons * 0.1 * 1 parsec
        assertEquals(new BigDecimal("20.0"), scout.calculateFuelForJump(2)); // 100 tons * 0.1 * 2 parsecs
        assertEquals(new BigDecimal("-1"), scout.calculateFuelForJump(3)); // Beyond jump rating

        // Test fuel capacity checks
        scout.setFuelCapacity(new BigDecimal("30.0"));
        assertTrue(scout.hasEnoughFuelForJump(1));
        assertTrue(scout.hasEnoughFuelForJump(2));
        assertFalse(scout.hasEnoughFuelForJump(3));

        // Test jump execution
        assertTrue(scout.performJump(1));
        assertEquals(new BigDecimal("20.0"), scout.getFuelCapacity()); // 30 - 10 = 20
        assertTrue(scout.performJump(2)); // Still has enough fuel for a jump-2
        assertEquals(new BigDecimal("0.0"), scout.getFuelCapacity()); // 20 - 20 = 0
    }

    @Test
    public void testSpaceshipWeapons() {
        Spaceship patrolCruiser = SpaceshipFactory.createPatrolCruiser();

        // Test initial weapons
        assertTrue(patrolCruiser.getWeapons().contains("Triple Turret (Beam Laser)"));
        assertTrue(patrolCruiser.getWeapons().contains("Triple Turret (Missile Rack)"));
        assertTrue(patrolCruiser.getWeapons().contains("Spinal Mount (Particle Beam)"));

        // Test adding weapons
        patrolCruiser.addWeapon("Point Defense System");
        assertTrue(patrolCruiser.getWeapons().contains("Point Defense System"));
        assertEquals(4, patrolCruiser.getWeapons().size());
    }
}
