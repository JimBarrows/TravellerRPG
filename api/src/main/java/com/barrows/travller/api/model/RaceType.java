package com.barrows.travller.api.model;

/**
 * Enum representing the different races in the Traveller RPG universe.
 * Human is the default race, but there are several alien races as well.
 */
public enum RaceType {
    HUMAN("Human", "The dominant species in the Imperium, originating from Terra (Earth)."),
    ASLAN("Aslan", "Feline-like aliens with a strong honor culture and territorial instincts."),
    VARGR("Vargr", "Canine-derived species known for their charismatic leaders and pack mentality."),
    HIVERS("Hivers", "Six-limbed, non-humanoid aliens with advanced technology and a consensus-based society."),
    K_KREE("K'kree", "Massive, centaur-like herbivores with a strong herd mentality and xenophobia."),
    DROYNE("Droyne", "Small, winged aliens with a caste-based society determined by ritual."),
    ZHODANI("Zhodani", "Human-derived race with strong psionic abilities and a three-tiered society."),
    SOLOMANI("Solomani", "Humans who trace their ancestry directly to Earth."),
    VILANI("Vilani", "The first humans to develop interstellar travel, with a culture emphasizing stability."),
    MIXED_VILANI_SOLOMANI("Mixed Vilani-Solomani", "Humans of mixed Vilani and Solomani heritage, common in the Imperium."),
    SWORD_WORLDER("Sword Worlder", "Humans from the Sword Worlds with a martial culture."),
    DARRIAN("Darrian", "Humans with a highly technological society."),
    FLORIANI("Floriani", "Humans from a world with a rigid, caste-based society."),
    MIXED_HUMAN("Mixed Human", "Humans of mixed heritage from various human subspecies."),
    OTHER("Other", "Other races not specifically categorized.");

    private final String displayName;
    private final String description;

    RaceType(String displayName, String description) {
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
