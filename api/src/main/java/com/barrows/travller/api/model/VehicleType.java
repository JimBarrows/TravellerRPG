package com.barrows.travller.api.model;

/**
 * Enum representing the different types of vehicles in the Traveller RPG universe.
 */
@lombok.Getter
public enum VehicleType {
    GROUND_CAR("Ground Car", "Standard wheeled vehicle for planetary travel"),
    GROUND_TRUCK("Ground Truck", "Heavy wheeled vehicle for cargo transport"),
    GROUND_MILITARY("Ground Military", "Armored or armed ground vehicle for military use"),
    GROUND_EXPLORATION("Ground Exploration", "Specialized vehicle for exploring rough terrain"),

    AIR_RAFT("Air/Raft", "Anti-gravity vehicle for short-range aerial transport"),
    AIRCRAFT("Aircraft", "Winged vehicle for atmospheric flight"),
    HELICOPTER("Helicopter", "Rotary-wing aircraft for vertical takeoff and landing"),
    VTOL("VTOL", "Vertical takeoff and landing aircraft"),

    GRAV_VEHICLE("Grav Vehicle", "Advanced anti-gravity vehicle"),
    GRAV_BELT("Grav Belt", "Personal anti-gravity device worn on the body"),
    GRAV_SLED("Grav Sled", "Anti-gravity platform for cargo transport"),

    WATERCRAFT_SMALL("Small Watercraft", "Small boat or personal watercraft"),
    WATERCRAFT_MEDIUM("Medium Watercraft", "Medium-sized boat or ship"),
    WATERCRAFT_LARGE("Large Watercraft", "Large ship or submarine"),

    SPACE_SHUTTLE("Space Shuttle", "Vehicle for travel between planetary surface and orbit"),
    SMALL_CRAFT("Small Craft", "Small spacecraft for local space travel"),

    WALKER("Walker", "Legged vehicle for rough terrain"),
    HOVER_VEHICLE("Hover Vehicle", "Vehicle that hovers above the surface"),

    TRACKED_VEHICLE("Tracked Vehicle", "Vehicle with continuous track instead of wheels"),
    WHEELED_VEHICLE("Wheeled Vehicle", "Standard vehicle with wheels"),

    EXOTIC("Exotic", "Unusual or alien vehicle with special capabilities");

    private final String displayName;
    private final String description;

    VehicleType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

}
