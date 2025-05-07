package com.barrows.travller.api.model;

/**
 * Factory class for creating standard races in the Traveller RPG system.
 */
public class RaceFactory {

    /**
     * Creates a Human race.
     *
     * @return A new Human race
     */
    public static Race createHuman() {
        Race race = new Race(RaceType.HUMAN);
        race.setLifespan("80-120 years");
        race.setAppearance("Bipedal humanoids with varied physical characteristics");
        return race;
    }

    /**
     * Creates an Aslan race.
     *
     * @return A new Aslan race
     */
    public static Race createAslan() {
        Race race = new Race(RaceType.ASLAN);
        race.addCharacteristicModifier(CharacteristicType.STRENGTH, 1);
        race.addCharacteristicModifier(CharacteristicType.DEXTERITY, 1);
        race.addSpecialAbility("Natural Weapons (claws)");
        race.addSpecialAbility("Territorial Instinct");
        race.setLifespan("60-90 years");
        race.setAppearance("Feline-like humanoids with manes and tawny fur");
        return race;
    }

    /**
     * Creates a Vargr race.
     *
     * @return A new Vargr race
     */
    public static Race createVargr() {
        Race race = new Race(RaceType.VARGR);
        race.addCharacteristicModifier(CharacteristicType.DEXTERITY, 1);
        race.addCharacteristicModifier(CharacteristicType.ENDURANCE, -1);
        race.addSpecialAbility("Enhanced Smell");
        race.addSpecialAbility("Pack Mentality");
        race.setLifespan("40-60 years");
        race.setAppearance("Canine-derived humanoids with fur and muzzles");
        return race;
    }

    /**
     * Creates a Hivers race.
     *
     * @return A new Hivers race
     */
    public static Race createHivers() {
        Race race = new Race(RaceType.HIVERS);
        race.addCharacteristicModifier(CharacteristicType.STRENGTH, -2);
        race.addCharacteristicModifier(CharacteristicType.INTELLIGENCE, 2);
        race.addSpecialAbility("Six Limbs");
        race.addSpecialAbility("Consensus Decision Making");
        race.setLifespan("150-200 years");
        race.setAppearance("Six-limbed, non-humanoid aliens with radial symmetry");
        return race;
    }

    /**
     * Creates a K'kree race.
     *
     * @return A new K'kree race
     */
    public static Race createKKree() {
        Race race = new Race(RaceType.K_KREE);
        race.addCharacteristicModifier(CharacteristicType.STRENGTH, 2);
        race.addCharacteristicModifier(CharacteristicType.DEXTERITY, -1);
        race.addSpecialAbility("Herbivore");
        race.addSpecialAbility("Herd Mentality");
        race.addSpecialAbility("Xenophobia");
        race.setLifespan("90-120 years");
        race.setAppearance("Massive, centaur-like herbivores with two arms and four legs");
        return race;
    }

    /**
     * Creates a Droyne race.
     *
     * @return A new Droyne race
     */
    public static Race createDroyne() {
        Race race = new Race(RaceType.DROYNE);
        race.addCharacteristicModifier(CharacteristicType.STRENGTH, -2);
        race.addCharacteristicModifier(CharacteristicType.DEXTERITY, 1);
        race.addSpecialAbility("Caste-Based Society");
        race.addSpecialAbility("Wings (Limited Flight)");
        race.setLifespan("40-60 years");
        race.setAppearance("Small, winged aliens with chitinous exoskeletons");
        return race;
    }

    /**
     * Creates a Zhodani race.
     *
     * @return A new Zhodani race
     */
    public static Race createZhodani() {
        Race race = new Race(RaceType.ZHODANI);
        race.addCharacteristicModifier(CharacteristicType.INTELLIGENCE, 1);
        race.addSpecialAbility("Psionic Potential");
        race.addSpecialAbility("Three-Tiered Society");
        race.setLifespan("80-120 years");
        race.setAppearance("Human-like with subtle differences in facial structure");
        return race;
    }

    /**
     * Creates a race by type.
     *
     * @param type The type of race to create
     * @return A new race of the specified type
     */
    public static Race createRace(RaceType type) {
        switch (type) {
            case HUMAN:
                return createHuman();
            case ASLAN:
                return createAslan();
            case VARGR:
                return createVargr();
            case HIVERS:
                return createHivers();
            case K_KREE:
                return createKKree();
            case DROYNE:
                return createDroyne();
            case ZHODANI:
                return createZhodani();
            default:
                return new Race(type);
        }
    }
}
