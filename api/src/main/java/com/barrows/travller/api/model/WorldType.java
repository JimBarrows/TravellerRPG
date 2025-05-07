package com.barrows.travller.api.model;

/**
 * Enum representing the different types of worlds in Traveller.
 */
public enum WorldType {
    GARDEN("Garden World"),
    DESERT("Desert World"),
    ICE("Ice World"),
    OCEAN("Ocean World"),
    ASTEROID("Asteroid"),
    VACUUM("Vacuum World"),
    HIGH_GRAVITY("High-Gravity World"),
    LOW_GRAVITY("Low-Gravity World"),
    HIGH_TECH("High-Tech World"),
    LOW_TECH("Low-Tech World"),
    HIGH_POPULATION("High-Population World"),
    LOW_POPULATION("Low-Population World"),
    AGRICULTURAL("Agricultural World"),
    INDUSTRIAL("Industrial World"),
    PRIMITIVE("Primitive World"),
    WATER_WORLD("Water World");

    private final String displayName;

    WorldType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
