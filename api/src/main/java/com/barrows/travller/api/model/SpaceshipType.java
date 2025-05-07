package com.barrows.travller.api.model;

/**
 * Enum representing the different types of spaceships in the Traveller RPG universe.
 */
public enum SpaceshipType {
    SCOUT("Scout", "Small, fast ship designed for exploration and reconnaissance"),
    COURIER("Courier", "Small, fast ship designed for rapid delivery of messages and small cargo"),
    TRADER("Trader", "Commercial vessel designed for cargo transport between worlds"),
    FREIGHTER("Freighter", "Large commercial vessel designed for bulk cargo transport"),
    LINER("Liner", "Passenger vessel designed for comfortable transport of people"),
    YACHT("Yacht", "Luxury vessel for private owners, often with high-quality accommodations"),
    PATROL_SHIP("Patrol Ship", "Military or law enforcement vessel for system security"),
    CORVETTE("Corvette", "Small warship, typically the smallest class of military vessel"),
    DESTROYER("Destroyer", "Medium warship designed for escort and patrol duties"),
    CRUISER("Cruiser", "Large warship designed for independent operations"),
    DREADNOUGHT("Dreadnought", "Massive warship, typically the largest class of military vessel"),
    CARRIER("Carrier", "Military vessel designed to carry and support smaller craft"),
    RESEARCH_VESSEL("Research Vessel", "Ship equipped for scientific research and exploration"),
    MINING_SHIP("Mining Ship", "Vessel equipped for resource extraction from asteroids or planets"),
    COLONY_SHIP("Colony Ship", "Large vessel designed to transport colonists and equipment"),
    GENERATION_SHIP("Generation Ship", "Massive vessel designed for multi-generational interstellar travel"),
    FUEL_TANKER("Fuel Tanker", "Specialized vessel for transporting and refining fuel"),
    REPAIR_SHIP("Repair Ship", "Vessel equipped with facilities to repair other ships"),
    HOSPITAL_SHIP("Hospital Ship", "Vessel equipped with medical facilities"),
    SALVAGE_VESSEL("Salvage Vessel", "Ship designed to recover and salvage derelict vessels");

    private final String displayName;
    private final String description;

    SpaceshipType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
