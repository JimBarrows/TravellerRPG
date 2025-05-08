package com.barrows.travller.api.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the Vehicle class.
 *
 * Note: Vehicles are stored in a database and accessed through the VehicleRepository interface.
 *
 * @see com.barrows.travller.api.repository.VehicleRepository
 */
public class VehicleTest {

    @Test
    public void testVehicleCreation() {
        // Test creating a vehicle directly
        Vehicle groundCar = new Vehicle("Ground Car", VehicleType.GROUND_CAR);
        assertEquals("Ground Car", groundCar.getName());
        assertEquals(VehicleType.GROUND_CAR, groundCar.getType());

        // Test creating a vehicle with the factory
        Vehicle airRaft = VehicleFactory.createAirRaft();
        assertEquals("Air/Raft", airRaft.getName());
        assertEquals(VehicleType.AIR_RAFT, airRaft.getType());
        assertEquals(50000, airRaft.getCost());

        // Test features
        assertTrue(airRaft.getFeatures().contains("Anti-Gravity"));
        assertTrue(airRaft.getFeatures().contains("Enclosed Cabin"));
    }

    @Test
    public void testVehicleMethods() {
        Vehicle militaryVehicle = VehicleFactory.createGroundMilitary();

        // Test damage application
        assertEquals(40, militaryVehicle.getHullPoints()); // Initial hull points
        militaryVehicle.applyDamage(20);
        assertEquals(32, militaryVehicle.getHullPoints()); // 20 damage - 12 armor = 8 damage to hull

        // Test repair
        militaryVehicle.repair(5);
        assertEquals(37, militaryVehicle.getHullPoints());

        // Test operational check
        assertTrue(militaryVehicle.isOperational());
        militaryVehicle.applyDamage(100); // Apply enough damage to disable it
        assertFalse(militaryVehicle.isOperational());

        // Test legal check
        Vehicle groundCar = VehicleFactory.createGroundCar();
        groundCar.setRequiresPermit(false);
        assertTrue(groundCar.isLegalAt(10));

        groundCar.setRequiresPermit(true);
        groundCar.setRestrictedLawLevel(5);
        assertTrue(groundCar.isLegalAt(4));
        assertFalse(groundCar.isLegalAt(5));
    }

    @Test
    public void testVehicleMaintenance() {
        Vehicle hovercraft = VehicleFactory.createHoverVehicle();

        // Test initial condition
        assertEquals(100, hovercraft.getCondition());

        // Test successful maintenance
        assertTrue(hovercraft.performMaintenance(10)); // Skill check of 10 should succeed
        assertEquals(100, hovercraft.getCondition()); // Already at max condition

        // Damage the vehicle first
        hovercraft.applyDamage(10);
        int damagedCondition = hovercraft.getCondition();
        assertTrue(damagedCondition < 100);

        // Test successful maintenance after damage
        assertTrue(hovercraft.performMaintenance(10));
        assertTrue(hovercraft.getCondition() > damagedCondition);

        // Test failed maintenance
        int currentCondition = hovercraft.getCondition();
        assertFalse(hovercraft.performMaintenance(2)); // Skill check of 2 should fail
        assertTrue(hovercraft.getCondition() < currentCondition); // Failed maintenance should worsen condition
    }

    @Test
    public void testVehicleOperationSkillModifier() {
        Vehicle vehicle = new Vehicle("Test Vehicle", VehicleType.GROUND_CAR);

        // Test excellent condition
        vehicle.setCondition(100);
        assertEquals(1, vehicle.getOperationSkillModifier());

        // Test good condition
        vehicle.setCondition(80);
        assertEquals(0, vehicle.getOperationSkillModifier());

        // Test fair condition
        vehicle.setCondition(60);
        assertEquals(-1, vehicle.getOperationSkillModifier());

        // Test poor condition
        vehicle.setCondition(40);
        assertEquals(-2, vehicle.getOperationSkillModifier());

        // Test bad condition
        vehicle.setCondition(20);
        assertEquals(-3, vehicle.getOperationSkillModifier());
    }

    @Test
    public void testVehicleWeapons() {
        Vehicle militaryVehicle = VehicleFactory.createGroundMilitary();

        // Test initial weapons
        assertTrue(militaryVehicle.getWeapons().contains("Heavy Machine Gun"));

        // Test adding weapons
        militaryVehicle.addWeapon("Missile Launcher");
        assertTrue(militaryVehicle.getWeapons().contains("Missile Launcher"));
        assertEquals(2, militaryVehicle.getWeapons().size());
    }
}
