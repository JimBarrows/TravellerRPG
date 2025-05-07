package com.barrows.travller.api.model;

/**
 * Enum representing the different visibility conditions in Traveller.
 */
public enum VisibilityType {
    CLEAR("Clear", 0),
    LIGHT_COVER("Light Cover", -1),
    MODERATE_COVER("Moderate Cover", -2),
    HEAVY_COVER("Heavy Cover", -3),
    TOTAL_COVER("Total Cover", -4),
    DARKNESS("Darkness", -2),
    SMOKE("Smoke", -2),
    FOG("Fog", -3),
    UNDERWATER("Underwater", -4);

    private final String displayName;
    private final int modifier;

    VisibilityType(String displayName, int modifier) {
        this.displayName = displayName;
        this.modifier = modifier;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getModifier() {
        return modifier;
    }
}
