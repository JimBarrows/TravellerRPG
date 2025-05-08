package com.barrows.travller.api.model;

/**
 * Enum representing the different types of environments in Traveller.
 */
@lombok.Getter
public enum EnvironmentType {
    PLANETARY_SURFACE("Planetary Surface"),
    UNDERWATER("Underwater"),
    VACUUM("Vacuum"),
    SPACE("Space"),
    URBAN("Urban"),
    WILDERNESS("Wilderness"),
    DESERT("Desert"),
    ARCTIC("Arctic"),
    JUNGLE("Jungle"),
    MOUNTAIN("Mountain"),
    ORBITAL("Orbital"),
    SHIP_INTERIOR("Ship Interior"),
    STATION_INTERIOR("Station Interior");

    private final String displayName;

    EnvironmentType(String displayName) {
        this.displayName = displayName;
    }

}
