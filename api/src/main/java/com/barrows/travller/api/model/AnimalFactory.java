package com.barrows.travller.api.model;

/**
 * Factory class for creating standard animals in the Traveller RPG system.
 */
public class AnimalFactory {

    /**
     * Creates a standard dog.
     *
     * @return A new dog animal
     */
    public static Animal createDog() {
        Animal animal = new Animal("Dog", AnimalType.DOMESTIC);
        animal.setDescription("A loyal canine companion");
        animal.setWeight(25.0);
        animal.setHabitat("Domestic environments, human settlements");
        animal.setMovementSpeed(12);
        animal.setStrength(5);
        animal.setDexterity(8);
        animal.setEndurance(6);
        animal.setIntelligence(4);
        animal.addAttack("Bite: 1D-3 damage");
        animal.addSpecialTrait("Keen Sense of Smell");
        animal.addSpecialTrait("Loyal Companion");
        animal.setCost(200);
        animal.setTechLevel(1);
        animal.setDomesticated(true);
        animal.setTrainable(true);
        return animal;
    }

    /**
     * Creates a standard horse.
     *
     * @return A new horse animal
     */
    public static Animal createHorse() {
        Animal animal = new Animal("Horse", AnimalType.MOUNT);
        animal.setDescription("A common riding and draft animal");
        animal.setWeight(500.0);
        animal.setHabitat("Plains, grasslands, human settlements");
        animal.setMovementSpeed(24);
        animal.setStrength(12);
        animal.setDexterity(8);
        animal.setEndurance(10);
        animal.setIntelligence(3);
        animal.addAttack("Kick: 2D damage");
        animal.addSpecialTrait("Fast Runner");
        animal.addSpecialTrait("Beast of Burden");
        animal.setCost(1000);
        animal.setTechLevel(1);
        animal.setDomesticated(true);
        animal.setTrainable(true);
        return animal;
    }

    /**
     * Creates a standard cow.
     *
     * @return A new cow animal
     */
    public static Animal createCow() {
        Animal animal = new Animal("Cow", AnimalType.LIVESTOCK);
        animal.setDescription("A common source of meat, milk, and leather");
        animal.setWeight(700.0);
        animal.setHabitat("Farms, grasslands");
        animal.setMovementSpeed(8);
        animal.setStrength(10);
        animal.setDexterity(4);
        animal.setEndurance(8);
        animal.setIntelligence(2);
        animal.addAttack("Gore: 1D damage");
        animal.addSpecialTrait("Food Source");
        animal.setCost(500);
        animal.setTechLevel(1);
        animal.setDomesticated(true);
        animal.setTrainable(false);
        return animal;
    }

    /**
     * Creates a standard wolf.
     *
     * @return A new wolf animal
     */
    public static Animal createWolf() {
        Animal animal = new Animal("Wolf", AnimalType.WILD_CARNIVORE);
        animal.setDescription("A pack-hunting predator");
        animal.setWeight(50.0);
        animal.setHabitat("Forests, mountains, plains");
        animal.setMovementSpeed(15);
        animal.setStrength(7);
        animal.setDexterity(9);
        animal.setEndurance(8);
        animal.setIntelligence(4);
        animal.addAttack("Bite: 2D-2 damage");
        animal.addSpecialTrait("Pack Hunter");
        animal.addSpecialTrait("Keen Senses");
        animal.setCost(0); // Wild animals typically don't have a purchase cost
        animal.setTechLevel(0);
        animal.setDomesticated(false);
        animal.setTrainable(true); // With difficulty
        return animal;
    }

    /**
     * Creates a standard deer.
     *
     * @return A new deer animal
     */
    public static Animal createDeer() {
        Animal animal = new Animal("Deer", AnimalType.WILD_HERBIVORE);
        animal.setDescription("A swift forest-dwelling herbivore");
        animal.setWeight(150.0);
        animal.setHabitat("Forests, woodlands");
        animal.setMovementSpeed(20);
        animal.setStrength(6);
        animal.setDexterity(10);
        animal.setEndurance(7);
        animal.setIntelligence(3);
        animal.addAttack("Antlers: 1D damage (males only)");
        animal.addSpecialTrait("Fast Runner");
        animal.addSpecialTrait("Skittish");
        animal.setCost(0); // Wild animals typically don't have a purchase cost
        animal.setTechLevel(0);
        animal.setDomesticated(false);
        animal.setTrainable(false);
        return animal;
    }

    /**
     * Creates a standard bear.
     *
     * @return A new bear animal
     */
    public static Animal createBear() {
        Animal animal = new Animal("Bear", AnimalType.DANGEROUS);
        animal.setDescription("A large, powerful omnivorous predator");
        animal.setWeight(400.0);
        animal.setHabitat("Forests, mountains");
        animal.setMovementSpeed(12);
        animal.setArmorRating(1);
        animal.setStrength(14);
        animal.setDexterity(6);
        animal.setEndurance(12);
        animal.setIntelligence(3);
        animal.addAttack("Claws: 3D damage");
        animal.addAttack("Bite: 2D damage");
        animal.addSpecialTrait("Powerful");
        animal.addSpecialTrait("Territorial");
        animal.setCost(0); // Wild animals typically don't have a purchase cost
        animal.setTechLevel(0);
        animal.setDomesticated(false);
        animal.setTrainable(false);
        return animal;
    }

    /**
     * Creates a standard alien mount (example of an exotic animal).
     *
     * @return A new alien mount animal
     */
    public static Animal createAlienMount() {
        Animal animal = new Animal("Gcarth", AnimalType.EXOTIC);
        animal.setDescription("A six-legged reptilian mount native to high-gravity worlds");
        animal.setWeight(800.0);
        animal.setHabitat("Rocky terrain, mountains on high-gravity worlds");
        animal.setMovementSpeed(18);
        animal.setArmorRating(3);
        animal.setStrength(16);
        animal.setDexterity(7);
        animal.setEndurance(14);
        animal.setIntelligence(3);
        animal.addAttack("Tail Swipe: 2D damage");
        animal.addSpecialTrait("High-G Adapted");
        animal.addSpecialTrait("Sure-footed");
        animal.addSpecialTrait("Heat Resistant");
        animal.setCost(5000);
        animal.setTechLevel(9);
        animal.setDomesticated(true);
        animal.setTrainable(true);
        return animal;
    }

    /**
     * Creates an animal by name.
     *
     * @param name The name of the animal to create
     * @return A new animal of the specified name, or null if not recognized
     */
    public static Animal createAnimal(String name) {
        switch (name.toLowerCase()) {
            case "dog":
                return createDog();
            case "horse":
                return createHorse();
            case "cow":
                return createCow();
            case "wolf":
                return createWolf();
            case "deer":
                return createDeer();
            case "bear":
                return createBear();
            case "gcarth":
            case "alien mount":
                return createAlienMount();
            default:
                return null;
        }
    }
}
