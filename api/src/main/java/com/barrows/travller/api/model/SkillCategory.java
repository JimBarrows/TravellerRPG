package com.barrows.travller.api.model;

/**
 * Enum representing the different categories of skills in Traveller.
 */
@lombok.Getter
public enum SkillCategory {
    COMBAT("Combat"),
    SPACE("Space"),
    VEHICLE("Vehicle"),
    TECHNICAL("Technical"),
    PHYSICAL("Physical"),
    SOCIAL("Social"),
    SCIENCE("Science"),
    TRADE("Trade");

    private final String displayName;

    SkillCategory(String displayName) {
        this.displayName = displayName;
    }

}
