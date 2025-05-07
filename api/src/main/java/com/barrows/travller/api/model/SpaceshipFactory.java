package com.barrows.travller.api.model;

/**
 * Factory class for creating standard spaceships in the Traveller RPG system.
 */
public class SpaceshipFactory {

    /**
     * Creates a standard Scout ship.
     *
     * @return A new Scout spaceship
     */
    public static Spaceship createScout() {
        Spaceship spaceship = new Spaceship("Scout/Courier", SpaceshipType.SCOUT);
        spaceship.setDescription("A small, fast ship designed for exploration, reconnaissance, and courier duties");
        spaceship.setTechLevel(9);
        spaceship.setCostMCr(37.0);
        spaceship.setDisplacementTons(100);
        spaceship.setRequiredSkill("Pilot");
        spaceship.setCrewRequired(1);
        spaceship.setPassengerCapacity(2);
        spaceship.setCargoCapacity(3.0);
        spaceship.setJumpDriveRating(2);
        spaceship.setManeuverDriveRating(2);
        spaceship.setPowerPlantRating(2);
        spaceship.setArmorRating(4);
        spaceship.setHullPoints(100);
        spaceship.setMaxHullPoints(100);
        spaceship.setStructurePoints(20);
        spaceship.setMaxStructurePoints(20);
        spaceship.setFuelCapacity(22.0);
        spaceship.setHasFuelScoop(true);
        spaceship.setFuelConsumptionPerJump(20.0);
        spaceship.setMaintenanceRequirements("Monthly maintenance");
        spaceship.setAnnualMaintenanceCost(0.37);
        spaceship.addFeature("Advanced Sensors");
        spaceship.addFeature("Laboratory");
        spaceship.addFeature("Computer/1");
        spaceship.addWeapon("Pulse Laser");
        return spaceship;
    }

    /**
     * Creates a standard Free Trader.
     *
     * @return A new Free Trader spaceship
     */
    public static Spaceship createFreeTrader() {
        Spaceship spaceship = new Spaceship("Free Trader", SpaceshipType.TRADER);
        spaceship.setDescription("A common merchant vessel designed for cargo transport between worlds");
        spaceship.setTechLevel(9);
        spaceship.setCostMCr(37.0);
        spaceship.setDisplacementTons(200);
        spaceship.setRequiredSkill("Pilot");
        spaceship.setCrewRequired(4);
        spaceship.setPassengerCapacity(6);
        spaceship.setCargoCapacity(82.0);
        spaceship.setJumpDriveRating(1);
        spaceship.setManeuverDriveRating(1);
        spaceship.setPowerPlantRating(2);
        spaceship.setArmorRating(2);
        spaceship.setHullPoints(200);
        spaceship.setMaxHullPoints(200);
        spaceship.setStructurePoints(40);
        spaceship.setMaxStructurePoints(40);
        spaceship.setFuelCapacity(40.0);
        spaceship.setHasFuelScoop(true);
        spaceship.setFuelConsumptionPerJump(20.0);
        spaceship.setMaintenanceRequirements("Monthly maintenance");
        spaceship.setAnnualMaintenanceCost(0.37);
        spaceship.addFeature("Cargo Handling Equipment");
        spaceship.addFeature("Computer/1");
        spaceship.addWeapon("Double Turret (Beam Laser)");
        return spaceship;
    }

    /**
     * Creates a standard Far Trader.
     *
     * @return A new Far Trader spaceship
     */
    public static Spaceship createFarTrader() {
        Spaceship spaceship = new Spaceship("Far Trader", SpaceshipType.TRADER);
        spaceship.setDescription("An improved merchant vessel with better jump capability");
        spaceship.setTechLevel(10);
        spaceship.setCostMCr(45.0);
        spaceship.setDisplacementTons(200);
        spaceship.setRequiredSkill("Pilot");
        spaceship.setCrewRequired(5);
        spaceship.setPassengerCapacity(10);
        spaceship.setCargoCapacity(64.0);
        spaceship.setJumpDriveRating(2);
        spaceship.setManeuverDriveRating(1);
        spaceship.setPowerPlantRating(2);
        spaceship.setArmorRating(2);
        spaceship.setHullPoints(200);
        spaceship.setMaxHullPoints(200);
        spaceship.setStructurePoints(40);
        spaceship.setMaxStructurePoints(40);
        spaceship.setFuelCapacity(50.0);
        spaceship.setHasFuelScoop(true);
        spaceship.setFuelConsumptionPerJump(20.0);
        spaceship.setMaintenanceRequirements("Monthly maintenance");
        spaceship.setAnnualMaintenanceCost(0.45);
        spaceship.addFeature("Cargo Handling Equipment");
        spaceship.addFeature("Advanced Sensors");
        spaceship.addFeature("Computer/1");
        spaceship.addWeapon("Double Turret (Beam Laser)");
        spaceship.addWeapon("Double Turret (Missile Rack)");
        return spaceship;
    }

    /**
     * Creates a standard Yacht.
     *
     * @return A new Yacht spaceship
     */
    public static Spaceship createYacht() {
        Spaceship spaceship = new Spaceship("Yacht", SpaceshipType.YACHT);
        spaceship.setDescription("A luxury vessel for private owners, often with high-quality accommodations");
        spaceship.setTechLevel(10);
        spaceship.setCostMCr(40.0);
        spaceship.setDisplacementTons(100);
        spaceship.setRequiredSkill("Pilot");
        spaceship.setCrewRequired(3);
        spaceship.setPassengerCapacity(6);
        spaceship.setCargoCapacity(2.0);
        spaceship.setJumpDriveRating(2);
        spaceship.setManeuverDriveRating(2);
        spaceship.setPowerPlantRating(3);
        spaceship.setArmorRating(3);
        spaceship.setHullPoints(100);
        spaceship.setMaxHullPoints(100);
        spaceship.setStructurePoints(20);
        spaceship.setMaxStructurePoints(20);
        spaceship.setFuelCapacity(30.0);
        spaceship.setHasFuelScoop(true);
        spaceship.setFuelConsumptionPerJump(20.0);
        spaceship.setMaintenanceRequirements("Monthly maintenance");
        spaceship.setAnnualMaintenanceCost(0.4);
        spaceship.addFeature("Luxury Accommodations");
        spaceship.addFeature("Advanced Sensors");
        spaceship.addFeature("Computer/2");
        spaceship.addWeapon("Single Turret (Beam Laser)");
        return spaceship;
    }

    /**
     * Creates a standard Patrol Cruiser.
     *
     * @return A new Patrol Cruiser spaceship
     */
    public static Spaceship createPatrolCruiser() {
        Spaceship spaceship = new Spaceship("Patrol Cruiser", SpaceshipType.PATROL_SHIP);
        spaceship.setDescription("A military vessel used for system security and patrol duties");
        spaceship.setTechLevel(12);
        spaceship.setCostMCr(80.0);
        spaceship.setDisplacementTons(400);
        spaceship.setRequiredSkill("Pilot");
        spaceship.setCrewRequired(10);
        spaceship.setPassengerCapacity(6);
        spaceship.setCargoCapacity(10.0);
        spaceship.setJumpDriveRating(3);
        spaceship.setManeuverDriveRating(3);
        spaceship.setPowerPlantRating(3);
        spaceship.setArmorRating(8);
        spaceship.setHullPoints(400);
        spaceship.setMaxHullPoints(400);
        spaceship.setStructurePoints(80);
        spaceship.setMaxStructurePoints(80);
        spaceship.setFuelCapacity(120.0);
        spaceship.setHasFuelScoop(true);
        spaceship.setFuelConsumptionPerJump(40.0);
        spaceship.setMaintenanceRequirements("Weekly maintenance");
        spaceship.setAnnualMaintenanceCost(0.8);
        spaceship.setRequiresPermit(true);
        spaceship.setRestrictedLawLevel(3);
        spaceship.addFeature("Advanced Sensors");
        spaceship.addFeature("Military-grade Computer/3");
        spaceship.addFeature("Armory");
        spaceship.addFeature("Brig");
        spaceship.addWeapon("Triple Turret (Beam Laser)");
        spaceship.addWeapon("Triple Turret (Missile Rack)");
        spaceship.addWeapon("Spinal Mount (Particle Beam)");
        return spaceship;
    }

    /**
     * Creates a standard Subsidized Merchant.
     *
     * @return A new Subsidized Merchant spaceship
     */
    public static Spaceship createSubsidizedMerchant() {
        Spaceship spaceship = new Spaceship("Subsidized Merchant", SpaceshipType.FREIGHTER);
        spaceship.setDescription("A government-subsidized merchant vessel for frontier trade routes");
        spaceship.setTechLevel(9);
        spaceship.setCostMCr(59.0);
        spaceship.setDisplacementTons(400);
        spaceship.setRequiredSkill("Pilot");
        spaceship.setCrewRequired(9);
        spaceship.setPassengerCapacity(9);
        spaceship.setCargoCapacity(168.0);
        spaceship.setJumpDriveRating(1);
        spaceship.setManeuverDriveRating(1);
        spaceship.setPowerPlantRating(1);
        spaceship.setArmorRating(2);
        spaceship.setHullPoints(400);
        spaceship.setMaxHullPoints(400);
        spaceship.setStructurePoints(80);
        spaceship.setMaxStructurePoints(80);
        spaceship.setFuelCapacity(82.0);
        spaceship.setHasFuelScoop(true);
        spaceship.setFuelConsumptionPerJump(40.0);
        spaceship.setMaintenanceRequirements("Monthly maintenance");
        spaceship.setAnnualMaintenanceCost(0.59);
        spaceship.addFeature("Cargo Handling Equipment");
        spaceship.addFeature("Computer/1");
        spaceship.addWeapon("Double Turret (Beam Laser)");
        spaceship.addWeapon("Double Turret (Missile Rack)");
        return spaceship;
    }

    /**
     * Creates a spaceship by name.
     *
     * @param name The name of the spaceship to create
     * @return A new spaceship of the specified name, or null if not recognized
     */
    public static Spaceship createSpaceship(String name) {
        switch (name.toLowerCase()) {
            case "scout":
            case "scout/courier":
                return createScout();
            case "free trader":
                return createFreeTrader();
            case "far trader":
                return createFarTrader();
            case "yacht":
                return createYacht();
            case "patrol cruiser":
                return createPatrolCruiser();
            case "subsidized merchant":
                return createSubsidizedMerchant();
            default:
                return null;
        }
    }
}
