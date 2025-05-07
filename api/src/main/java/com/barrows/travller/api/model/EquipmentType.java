package com.barrows.travller.api.model;

/**
 * Enum representing the different types of equipment in the Traveller RPG universe.
 */
public enum EquipmentType {
    CLOTHING("Clothing", "Garments and protective wear"),
    ELECTRONICS("Electronics", "Electronic devices and gadgets"),
    MEDICAL("Medical", "Medical supplies and equipment"),
    SURVIVAL("Survival", "Gear for survival in hostile environments"),
    TOOLS("Tools", "Implements for construction, repair, and crafting"),
    COMMUNICATION("Communication", "Devices for communication"),
    SENSORS("Sensors", "Equipment for detection and analysis"),
    COMPUTERS("Computers", "Computing and data processing equipment"),
    PERSONAL_ACCESSORIES("Personal Accessories", "Personal items and accessories"),
    AUGMENTATION("Augmentation", "Cybernetic and biological enhancements"),
    STORAGE("Storage", "Containers and storage solutions"),
    CAMPING("Camping", "Equipment for outdoor living"),
    OPTICS("Optics", "Visual enhancement and recording devices"),
    POWER("Power", "Power generation and storage equipment"),
    MISCELLANEOUS("Miscellaneous", "Items that don't fit other categories");

    private final String displayName;
    private final String description;

    EquipmentType(String displayName, String description) {
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
