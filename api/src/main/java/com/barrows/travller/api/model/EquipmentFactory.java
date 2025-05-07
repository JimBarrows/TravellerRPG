package com.barrows.travller.api.model;

/**
 * Factory class for creating standard equipment in the Traveller RPG system.
 */
public class EquipmentFactory {

    /**
     * Creates a standard comms unit.
     *
     * @return A new comms unit equipment
     */
    public static Equipment createCommsUnit() {
        Equipment equipment = new Equipment("Comms Unit", EquipmentType.COMMUNICATION);
        equipment.setDescription("A portable communication device with a range of about 10km");
        equipment.setTechLevel(8);
        equipment.setCost(250);
        equipment.setWeight(0.5);
        equipment.setRequiredSkill("Electronics");
        equipment.addFeature("10km Range");
        equipment.addFeature("Encrypted Channels");
        equipment.addFeature("Emergency Beacon");
        equipment.setPowerRequirements("Battery (1 week duration)");
        equipment.setMaintenanceRequirements("Annual check-up");
        return equipment;
    }

    /**
     * Creates a standard medkit.
     *
     * @return A new medkit equipment
     */
    public static Equipment createMedkit() {
        Equipment equipment = new Equipment("Medkit", EquipmentType.MEDICAL);
        equipment.setDescription("A comprehensive medical kit for field treatment");
        equipment.setTechLevel(7);
        equipment.setCost(1000);
        equipment.setWeight(3.0);
        equipment.setRequiredSkill("Medic");
        equipment.setSkillBonus(1);
        equipment.addFeature("Trauma Treatment");
        equipment.addFeature("Disease Diagnosis");
        equipment.addFeature("Basic Surgery");
        equipment.setMaintenanceRequirements("Replace consumables after use");
        return equipment;
    }

    /**
     * Creates a standard environment suit.
     *
     * @return A new environment suit equipment
     */
    public static Equipment createEnvironmentSuit() {
        Equipment equipment = new Equipment("Environment Suit", EquipmentType.SURVIVAL);
        equipment.setDescription("A suit designed to protect against hostile environments");
        equipment.setTechLevel(9);
        equipment.setCost(5000);
        equipment.setWeight(10.0);
        equipment.setRequiredSkill("Zero-G");
        equipment.addFeature("Radiation Protection");
        equipment.addFeature("Temperature Regulation");
        equipment.addFeature("Oxygen Supply (6 hours)");
        equipment.setPowerRequirements("Battery (12 hour duration)");
        equipment.setMaintenanceRequirements("Monthly check-up");
        equipment.setDurability(15);
        return equipment;
    }

    /**
     * Creates a standard computer terminal.
     *
     * @return A new computer terminal equipment
     */
    public static Equipment createComputerTerminal() {
        Equipment equipment = new Equipment("Computer Terminal", EquipmentType.COMPUTERS);
        equipment.setDescription("A portable computing device with advanced capabilities");
        equipment.setTechLevel(10);
        equipment.setCost(2000);
        equipment.setWeight(1.5);
        equipment.setRequiredSkill("Computer");
        equipment.setSkillBonus(1);
        equipment.addFeature("Data Analysis");
        equipment.addFeature("Network Access");
        equipment.addFeature("Programming Interface");
        equipment.setPowerRequirements("Battery (24 hour duration)");
        equipment.setMaintenanceRequirements("Software updates");
        return equipment;
    }

    /**
     * Creates a standard toolkit.
     *
     * @return A new toolkit equipment
     */
    public static Equipment createToolkit() {
        Equipment equipment = new Equipment("Toolkit", EquipmentType.TOOLS);
        equipment.setDescription("A comprehensive set of tools for mechanical and electronic repairs");
        equipment.setTechLevel(7);
        equipment.setCost(500);
        equipment.setWeight(5.0);
        equipment.setRequiredSkill("Mechanic");
        equipment.setSkillBonus(1);
        equipment.addFeature("Mechanical Tools");
        equipment.addFeature("Electronic Tools");
        equipment.addFeature("Diagnostic Equipment");
        equipment.setMaintenanceRequirements("Replace worn tools");
        return equipment;
    }

    /**
     * Creates a standard binoculars.
     *
     * @return A new binoculars equipment
     */
    public static Equipment createBinoculars() {
        Equipment equipment = new Equipment("Binoculars", EquipmentType.OPTICS);
        equipment.setDescription("High-powered optical magnification device");
        equipment.setTechLevel(5);
        equipment.setCost(100);
        equipment.setWeight(1.0);
        equipment.addFeature("10x Magnification");
        equipment.addFeature("Night Vision");
        equipment.addFeature("Range Finder");
        equipment.setPowerRequirements("Battery (1 month duration)");
        return equipment;
    }

    /**
     * Creates a standard survival kit.
     *
     * @return A new survival kit equipment
     */
    public static Equipment createSurvivalKit() {
        Equipment equipment = new Equipment("Survival Kit", EquipmentType.SURVIVAL);
        equipment.setDescription("Essential supplies for wilderness survival");
        equipment.setTechLevel(4);
        equipment.setCost(200);
        equipment.setWeight(2.0);
        equipment.setRequiredSkill("Survival");
        equipment.setSkillBonus(1);
        equipment.addFeature("Water Purification");
        equipment.addFeature("Fire Starting");
        equipment.addFeature("Emergency Shelter");
        equipment.addFeature("First Aid Supplies");
        equipment.setMaintenanceRequirements("Replace consumables after use");
        return equipment;
    }

    /**
     * Creates a standard portable power generator.
     *
     * @return A new portable power generator equipment
     */
    public static Equipment createPortablePowerGenerator() {
        Equipment equipment = new Equipment("Portable Power Generator", EquipmentType.POWER);
        equipment.setDescription("A compact generator for field power needs");
        equipment.setTechLevel(8);
        equipment.setCost(1500);
        equipment.setWeight(15.0);
        equipment.setRequiredSkill("Engineer");
        equipment.addFeature("1kW Output");
        equipment.addFeature("Fuel Efficient");
        equipment.addFeature("Multiple Outlets");
        equipment.setMaintenanceRequirements("Refuel as needed, maintenance every 100 hours");
        equipment.setDurability(20);
        return equipment;
    }

    /**
     * Creates equipment by name.
     *
     * @param name The name of the equipment to create
     * @return A new equipment item of the specified name, or null if not recognized
     */
    public static Equipment createEquipment(String name) {
        switch (name.toLowerCase()) {
            case "comms unit":
                return createCommsUnit();
            case "medkit":
                return createMedkit();
            case "environment suit":
                return createEnvironmentSuit();
            case "computer terminal":
                return createComputerTerminal();
            case "toolkit":
                return createToolkit();
            case "binoculars":
                return createBinoculars();
            case "survival kit":
                return createSurvivalKit();
            case "portable power generator":
                return createPortablePowerGenerator();
            default:
                return null;
        }
    }
}
