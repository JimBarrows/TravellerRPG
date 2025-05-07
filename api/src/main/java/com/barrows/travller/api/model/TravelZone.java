package com.barrows.travller.api.model;

/**
 * Enum representing the different travel zones in the Traveller RPG system.
 * Travel zones indicate the safety and legality of travel to a world.
 */
public enum TravelZone {
    GREEN("Green", "Safe for travel, no special restrictions"),
    AMBER("Amber", "Caution advised, potential dangers or restrictions"),
    RED("Red", "Travel forbidden, extremely dangerous or restricted");

    private final String displayName;
    private final String description;

    TravelZone(String displayName, String description) {
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
