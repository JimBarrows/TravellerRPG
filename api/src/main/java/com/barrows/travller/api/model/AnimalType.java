package com.barrows.travller.api.model;

/**
 * Enum representing the different types of animals in the Traveller RPG universe.
 */
@lombok.Getter
public enum AnimalType {
    DOMESTIC("Domestic", "Animals bred for companionship or work"),
    LIVESTOCK("Livestock", "Animals raised for food, materials, or labor"),
    MOUNT("Mount", "Animals used for riding or as beasts of burden"),
    WILD_HERBIVORE("Wild Herbivore", "Wild plant-eating animals"),
    WILD_OMNIVORE("Wild Omnivore", "Wild animals that eat both plants and meat"),
    WILD_CARNIVORE("Wild Carnivore", "Wild meat-eating predators"),
    AQUATIC("Aquatic", "Animals that live primarily in water"),
    AVIAN("Avian", "Flying or bird-like animals"),
    EXOTIC("Exotic", "Unusual or alien animals with special traits"),
    DANGEROUS("Dangerous", "Particularly hazardous animals");

    private final String displayName;
    private final String description;

    AnimalType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

}
