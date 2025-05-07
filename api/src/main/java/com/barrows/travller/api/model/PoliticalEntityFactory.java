package com.barrows.travller.api.model;

/**
 * Factory class for creating standard political entities in the Traveller RPG system.
 */
public class PoliticalEntityFactory {

    /**
     * Creates the Third Imperium political entity.
     *
     * @return A new Third Imperium political entity
     */
    public static PoliticalEntity createThirdImperium() {
        PoliticalEntity imperium = new PoliticalEntity("Third Imperium", PoliticalEntityType.EMPIRE);
        imperium.setGovernmentType(6); // Captive Government/Colony
        imperium.setTechLevel(15); // TL 15 (Imperial average is 12, but highest is 15)
        imperium.setFoundingDate("0");
        imperium.setDescription("The largest interstellar empire in charted space, spanning over 11,000 worlds across hundreds of subsectors. Founded by Cleon Zhunastu after the Long Night, it has endured for over a thousand years. The Imperium is characterized by a policy of non-interference in local planetary affairs as long as Imperial laws are followed and taxes paid.");

        imperium.addCharacteristic("Ruled by an Emperor/Empress");
        imperium.addCharacteristic("Nobility system with hereditary titles");
        imperium.addCharacteristic("Decentralized governance");
        imperium.addCharacteristic("Strong military (Imperial Navy)");
        imperium.addCharacteristic("Interstellar trade network");

        return imperium;
    }

    /**
     * Creates the Zhodani Consulate political entity.
     *
     * @return A new Zhodani Consulate political entity
     */
    public static PoliticalEntity createZhodaniConsulate() {
        PoliticalEntity zhodani = new PoliticalEntity("Zhodani Consulate", PoliticalEntityType.OLIGARCHY);
        zhodani.setGovernmentType(10); // Charismatic Oligarchy
        zhodani.setTechLevel(15);
        zhodani.setFoundingDate("-6000");
        zhodani.setDescription("A major human interstellar state ruled by psionic nobles. The Zhodani society is divided into three classes: nobles (who must be psionic), intendants (administrators and managers), and proles (the common citizens). The use of psionics is integrated into all aspects of Zhodani society, unlike in the Imperium where it is often feared and restricted.");

        zhodani.addCharacteristic("Psionic ruling class");
        zhodani.addCharacteristic("Three-tiered social structure");
        zhodani.addCharacteristic("Thought police");
        zhodani.addCharacteristic("Centralized governance");
        zhodani.addCharacteristic("Expansionist policy");

        return zhodani;
    }

    /**
     * Creates the Solomani Confederation political entity.
     *
     * @return A new Solomani Confederation political entity
     */
    public static PoliticalEntity createSolomaniConfederation() {
        PoliticalEntity solomani = new PoliticalEntity("Solomani Confederation", PoliticalEntityType.CONFEDERATION);
        solomani.setGovernmentType(7); // Balkanized
        solomani.setTechLevel(14);
        solomani.setFoundingDate("871");
        solomani.setDescription("A human-supremacist interstellar state centered on Terra (Earth), the original homeworld of humanity. The Solomani Confederation broke away from the Third Imperium during the Solomani Rim War. It promotes the idea that humans from Earth (Solomani) are superior to other human subspecies and non-human races.");

        solomani.addCharacteristic("Human supremacist ideology");
        solomani.addCharacteristic("Loose confederation of worlds");
        solomani.addCharacteristic("Strong military");
        solomani.addCharacteristic("Hostile to the Imperium");
        solomani.addCharacteristic("Controls Terra (Earth)");

        return solomani;
    }

    /**
     * Creates the Sword Worlds Confederation political entity.
     *
     * @return A new Sword Worlds Confederation political entity
     */
    public static PoliticalEntity createSwordWorldsConfederation() {
        PoliticalEntity swordWorlds = new PoliticalEntity("Sword Worlds Confederation", PoliticalEntityType.CONFEDERATION);
        swordWorlds.setGovernmentType(7); // Balkanized
        swordWorlds.setTechLevel(11);
        swordWorlds.setFoundingDate("73");
        swordWorlds.setDescription("A loose confederation of independent worlds with a strong martial tradition and Norse-inspired culture. The Sword Worlds are named after legendary swords from Norse and Finnish mythology. They have a history of conflict with the Imperium and the Darrians, and have been used as a buffer state between the Imperium and the Zhodani Consulate.");

        swordWorlds.addCharacteristic("Martial culture");
        swordWorlds.addCharacteristic("Norse-inspired traditions");
        swordWorlds.addCharacteristic("Independent spirit");
        swordWorlds.addCharacteristic("Frequent internal conflicts");
        swordWorlds.addCharacteristic("Buffer state between major powers");

        return swordWorlds;
    }

    /**
     * Creates the Aslan Hierate political entity.
     *
     * @return A new Aslan Hierate political entity
     */
    public static PoliticalEntity createAslanHierate() {
        PoliticalEntity aslan = new PoliticalEntity("Aslan Hierate", PoliticalEntityType.HEGEMONY);
        aslan.setGovernmentType(2); // Participating Democracy
        aslan.setTechLevel(13);
        aslan.setFoundingDate("-2500");
        aslan.setDescription("A loose collection of clan holdings of the Aslan, a major non-human race resembling anthropomorphic lions. The Hierate is not a unified government but rather thousands of independent clan territories. Male Aslan are concerned with territory and honor, while females manage business and trade. Land ownership is the foundation of Aslan society.");

        aslan.addCharacteristic("Clan-based society");
        aslan.addCharacteristic("Strong territorial instincts");
        aslan.addCharacteristic("Gender-based division of roles");
        aslan.addCharacteristic("Honor-focused culture");
        aslan.addCharacteristic("Expansionist tendencies");

        return aslan;
    }

    /**
     * Creates a political entity by name.
     *
     * @param name The name of the political entity to create
     * @return A new political entity of the specified name, or null if not recognized
     */
    public static PoliticalEntity createPoliticalEntity(String name) {
        switch (name.toLowerCase()) {
            case "third imperium":
            case "imperium":
                return createThirdImperium();
            case "zhodani consulate":
            case "zhodani":
                return createZhodaniConsulate();
            case "solomani confederation":
            case "solomani":
                return createSolomaniConfederation();
            case "sword worlds confederation":
            case "sword worlds":
                return createSwordWorldsConfederation();
            case "aslan hierate":
            case "aslan":
                return createAslanHierate();
            default:
                return null;
        }
    }
}
