package com.barrows.travller.api.model;

/**
 * Enum representing the different types of characteristics in Traveller.
 */
public enum CharacteristicType {
    STRENGTH("Strength", "STR"),
    DEXTERITY("Dexterity", "DEX"),
    ENDURANCE("Endurance", "END"),
    INTELLIGENCE("Intelligence", "INT"),
    EDUCATION("Education", "EDU"),
    SOCIAL_STANDING("Social Standing", "SOC");

    private final String fullName;
    private final String abbreviation;

    CharacteristicType(String fullName, String abbreviation) {
        this.fullName = fullName;
        this.abbreviation = abbreviation;
    }

    public String getFullName() {
        return fullName;
    }

    public String getAbbreviation() {
        return abbreviation;
    }
}
