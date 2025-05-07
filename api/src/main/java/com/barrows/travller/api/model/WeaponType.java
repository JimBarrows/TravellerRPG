package com.barrows.travller.api.model;

/**
 * Enum representing the different types of weapons in Traveller.
 */
public enum WeaponType {
    MELEE("Melee"),
    PISTOL("Pistol"),
    RIFLE("Rifle"),
    SHOTGUN("Shotgun"),
    SUBMACHINE_GUN("Submachine Gun"),
    ASSAULT_RIFLE("Assault Rifle"),
    HEAVY_WEAPON("Heavy Weapon"),
    EXPLOSIVE("Explosive"),
    ENERGY("Energy"),
    NATURAL("Natural");

    private final String displayName;

    WeaponType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
