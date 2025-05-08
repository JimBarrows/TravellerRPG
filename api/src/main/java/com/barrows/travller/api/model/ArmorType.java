package com.barrows.travller.api.model;

/**
 * Enum representing the different types of armor in Traveller.
 */
@lombok.Getter
public enum ArmorType {
    CLOTH("Cloth"),
    MESH("Mesh"),
    FLAK("Flak"),
    ABLAT("Ablat"),
    REFLEC("Reflec"),
    COMBAT("Combat Armor"),
    BATTLE_DRESS("Battle Dress");

    private final String displayName;

    ArmorType(String displayName) {
        this.displayName = displayName;
    }

}
