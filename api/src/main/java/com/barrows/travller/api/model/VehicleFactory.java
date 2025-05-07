package com.barrows.travller.api.model;

/**
 * Factory class for creating standard vehicles in the Traveller RPG system.
 */
public class VehicleFactory {

    /**
     * Creates a standard ground car.
     *
     * @return A new ground car vehicle
     */
    public static Vehicle createGroundCar() {
        Vehicle vehicle = new Vehicle("Ground Car", VehicleType.GROUND_CAR);
        vehicle.setDescription("A standard wheeled vehicle for planetary travel");
        vehicle.setTechLevel(5);
        vehicle.setCost(6000);
        vehicle.setWeight(1.5);
        vehicle.setRequiredSkill("Drive");
        vehicle.setCrewRequired(1);
        vehicle.setPassengerCapacity(3);
        vehicle.setCargoCapacity(0.2);
        vehicle.setMaxSpeed(120);
        vehicle.setCruisingSpeed(80);
        vehicle.setRange(400);
        vehicle.setArmorRating(2);
        vehicle.setHullPoints(15);
        vehicle.setMaxHullPoints(15);
        vehicle.setFuelType("Chemical");
        vehicle.setFuelConsumption("10 liters per 100 km");
        vehicle.setMaintenanceRequirements("Monthly check-up");
        vehicle.addFeature("Basic Navigation");
        vehicle.addFeature("Climate Control");
        return vehicle;
    }

    /**
     * Creates a standard air/raft.
     *
     * @return A new air/raft vehicle
     */
    public static Vehicle createAirRaft() {
        Vehicle vehicle = new Vehicle("Air/Raft", VehicleType.AIR_RAFT);
        vehicle.setDescription("Anti-gravity vehicle for short-range aerial transport");
        vehicle.setTechLevel(8);
        vehicle.setCost(50000);
        vehicle.setWeight(0.5);
        vehicle.setRequiredSkill("Flyer");
        vehicle.setCrewRequired(1);
        vehicle.setPassengerCapacity(3);
        vehicle.setCargoCapacity(0.1);
        vehicle.setMaxSpeed(400);
        vehicle.setCruisingSpeed(150);
        vehicle.setRange(1000);
        vehicle.setArmorRating(4);
        vehicle.setHullPoints(12);
        vehicle.setMaxHullPoints(12);
        vehicle.setFuelType("Power Cells");
        vehicle.setFuelConsumption("1 power cell per 10 hours");
        vehicle.setMaintenanceRequirements("Quarterly maintenance");
        vehicle.addFeature("Anti-Gravity");
        vehicle.addFeature("Enclosed Cabin");
        vehicle.addFeature("Navigation System");
        return vehicle;
    }

    /**
     * Creates a standard grav vehicle.
     *
     * @return A new grav vehicle
     */
    public static Vehicle createGravVehicle() {
        Vehicle vehicle = new Vehicle("Grav Vehicle", VehicleType.GRAV_VEHICLE);
        vehicle.setDescription("Advanced anti-gravity vehicle for high-speed travel");
        vehicle.setTechLevel(9);
        vehicle.setCost(120000);
        vehicle.setWeight(2.0);
        vehicle.setRequiredSkill("Flyer");
        vehicle.setCrewRequired(1);
        vehicle.setPassengerCapacity(5);
        vehicle.setCargoCapacity(0.5);
        vehicle.setMaxSpeed(800);
        vehicle.setCruisingSpeed(400);
        vehicle.setRange(2000);
        vehicle.setArmorRating(6);
        vehicle.setHullPoints(20);
        vehicle.setMaxHullPoints(20);
        vehicle.setFuelType("Power Cells");
        vehicle.setFuelConsumption("1 power cell per 5 hours");
        vehicle.setMaintenanceRequirements("Monthly maintenance");
        vehicle.addFeature("Advanced Anti-Gravity");
        vehicle.addFeature("Luxury Interior");
        vehicle.addFeature("Advanced Navigation");
        vehicle.addFeature("Autopilot");
        return vehicle;
    }

    /**
     * Creates a standard ground truck.
     *
     * @return A new ground truck vehicle
     */
    public static Vehicle createGroundTruck() {
        Vehicle vehicle = new Vehicle("Ground Truck", VehicleType.GROUND_TRUCK);
        vehicle.setDescription("Heavy wheeled vehicle for cargo transport");
        vehicle.setTechLevel(5);
        vehicle.setCost(15000);
        vehicle.setWeight(5.0);
        vehicle.setRequiredSkill("Drive");
        vehicle.setCrewRequired(1);
        vehicle.setPassengerCapacity(2);
        vehicle.setCargoCapacity(10.0);
        vehicle.setMaxSpeed(90);
        vehicle.setCruisingSpeed(60);
        vehicle.setRange(600);
        vehicle.setArmorRating(3);
        vehicle.setHullPoints(25);
        vehicle.setMaxHullPoints(25);
        vehicle.setFuelType("Chemical");
        vehicle.setFuelConsumption("20 liters per 100 km");
        vehicle.setMaintenanceRequirements("Monthly check-up");
        vehicle.addFeature("Cargo Space");
        vehicle.addFeature("Rugged Suspension");
        return vehicle;
    }

    /**
     * Creates a standard military ground vehicle.
     *
     * @return A new military ground vehicle
     */
    public static Vehicle createGroundMilitary() {
        Vehicle vehicle = new Vehicle("ATV", VehicleType.GROUND_MILITARY);
        vehicle.setDescription("Armored tactical vehicle for military operations");
        vehicle.setTechLevel(7);
        vehicle.setCost(80000);
        vehicle.setWeight(8.0);
        vehicle.setRequiredSkill("Drive");
        vehicle.setCrewRequired(2);
        vehicle.setPassengerCapacity(6);
        vehicle.setCargoCapacity(1.0);
        vehicle.setMaxSpeed(110);
        vehicle.setCruisingSpeed(70);
        vehicle.setRange(800);
        vehicle.setArmorRating(12);
        vehicle.setHullPoints(40);
        vehicle.setMaxHullPoints(40);
        vehicle.setFuelType("Chemical");
        vehicle.setFuelConsumption("25 liters per 100 km");
        vehicle.setMaintenanceRequirements("Weekly maintenance");
        vehicle.setRequiresPermit(true);
        vehicle.setRestrictedLawLevel(3);
        vehicle.addFeature("Heavy Armor");
        vehicle.addFeature("All-Terrain Capability");
        vehicle.addFeature("Military Comms");
        vehicle.addWeapon("Heavy Machine Gun");
        return vehicle;
    }

    /**
     * Creates a standard watercraft.
     *
     * @return A new watercraft
     */
    public static Vehicle createWatercraft() {
        Vehicle vehicle = new Vehicle("Motorboat", VehicleType.WATERCRAFT_SMALL);
        vehicle.setDescription("Small motorized boat for water travel");
        vehicle.setTechLevel(5);
        vehicle.setCost(8000);
        vehicle.setWeight(0.8);
        vehicle.setRequiredSkill("Seafarer");
        vehicle.setCrewRequired(1);
        vehicle.setPassengerCapacity(4);
        vehicle.setCargoCapacity(0.3);
        vehicle.setMaxSpeed(60);
        vehicle.setCruisingSpeed(40);
        vehicle.setRange(200);
        vehicle.setArmorRating(1);
        vehicle.setHullPoints(10);
        vehicle.setMaxHullPoints(10);
        vehicle.setFuelType("Chemical");
        vehicle.setFuelConsumption("15 liters per hour");
        vehicle.setMaintenanceRequirements("Seasonal maintenance");
        vehicle.addFeature("Waterproof Storage");
        vehicle.addFeature("Navigation Lights");
        return vehicle;
    }

    /**
     * Creates a standard aircraft.
     *
     * @return A new aircraft
     */
    public static Vehicle createAircraft() {
        Vehicle vehicle = new Vehicle("Light Aircraft", VehicleType.AIRCRAFT);
        vehicle.setDescription("Small winged aircraft for atmospheric flight");
        vehicle.setTechLevel(6);
        vehicle.setCost(100000);
        vehicle.setWeight(1.5);
        vehicle.setRequiredSkill("Flyer");
        vehicle.setCrewRequired(1);
        vehicle.setPassengerCapacity(3);
        vehicle.setCargoCapacity(0.2);
        vehicle.setMaxSpeed(300);
        vehicle.setCruisingSpeed(200);
        vehicle.setRange(1500);
        vehicle.setArmorRating(2);
        vehicle.setHullPoints(15);
        vehicle.setMaxHullPoints(15);
        vehicle.setFuelType("Aviation Fuel");
        vehicle.setFuelConsumption("30 liters per hour");
        vehicle.setMaintenanceRequirements("Pre-flight check, 50-hour maintenance");
        vehicle.addFeature("Flight Instruments");
        vehicle.addFeature("Radio Communications");
        return vehicle;
    }

    /**
     * Creates a standard hover vehicle.
     *
     * @return A new hover vehicle
     */
    public static Vehicle createHoverVehicle() {
        Vehicle vehicle = new Vehicle("Hovercraft", VehicleType.HOVER_VEHICLE);
        vehicle.setDescription("Vehicle that hovers above the surface on a cushion of air");
        vehicle.setTechLevel(7);
        vehicle.setCost(40000);
        vehicle.setWeight(2.0);
        vehicle.setRequiredSkill("Flyer");
        vehicle.setCrewRequired(1);
        vehicle.setPassengerCapacity(6);
        vehicle.setCargoCapacity(1.0);
        vehicle.setMaxSpeed(150);
        vehicle.setCruisingSpeed(100);
        vehicle.setRange(500);
        vehicle.setArmorRating(3);
        vehicle.setHullPoints(18);
        vehicle.setMaxHullPoints(18);
        vehicle.setFuelType("Chemical");
        vehicle.setFuelConsumption("20 liters per hour");
        vehicle.setMaintenanceRequirements("Monthly maintenance");
        vehicle.addFeature("Amphibious");
        vehicle.addFeature("All-Terrain Capability");
        return vehicle;
    }

    /**
     * Creates a vehicle by name.
     *
     * @param name The name of the vehicle to create
     * @return A new vehicle of the specified name, or null if not recognized
     */
    public static Vehicle createVehicle(String name) {
        switch (name.toLowerCase()) {
            case "ground car":
                return createGroundCar();
            case "air/raft":
            case "air raft":
                return createAirRaft();
            case "grav vehicle":
                return createGravVehicle();
            case "ground truck":
            case "truck":
                return createGroundTruck();
            case "atv":
            case "military vehicle":
                return createGroundMilitary();
            case "motorboat":
            case "boat":
                return createWatercraft();
            case "light aircraft":
            case "aircraft":
                return createAircraft();
            case "hovercraft":
                return createHoverVehicle();
            default:
                return null;
        }
    }
}
