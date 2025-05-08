package com.barrows.travller.api.model;

/**
 * Enum representing the different types of atmospheres in Traveller.
 */
@lombok.Getter
public enum AtmosphereType {
    NONE("None", "Vacuum"),
    TRACE("Trace", "Extremely thin, requires vacc suit"),
    VERY_THIN("Very Thin", "Requires respirator"),
    THIN("Thin", "Breathable with effort"),
    STANDARD("Standard", "Earth-like, breathable"),
    DENSE("Dense", "High pressure but breathable"),
    VERY_DENSE("Very Dense", "Requires breathing apparatus"),
    EXOTIC("Exotic", "Unbreathable, requires filter"),
    CORROSIVE("Corrosive", "Damages equipment and lungs, requires vacc suit"),
    INSIDIOUS("Insidious", "Penetrates normal protection, requires specialized equipment"),
    DENSE_HIGH("Dense, High", "High pressure, high oxygen content"),
    THIN_LOW("Thin, Low", "Low pressure, low oxygen content");

    private final String displayName;
    private final String description;

    AtmosphereType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

}
