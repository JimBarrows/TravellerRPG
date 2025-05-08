package com.barrows.travller.api.model;

/**
 * Factory class for creating standard subsectors in the Traveller RPG system.
 */
public class SubsectorFactory {

    /**
     * Creates a standard Imperial subsector.
     *
     * @return A new Imperial subsector
     */
    public static Subsector createImperialSubsector() {
        Subsector subsector = new Subsector("Regina", "A");

        // Add some standard worlds to the subsector
        World regina = WorldFactory.createWorld("Terra");
        regina.setName("Regina");
        regina.setHexCoordinates("1910");

        World efate = new World("Efate", "A646930-D", WorldType.GARDEN);
        efate.setTravelZone(TravelZone.GREEN);
        efate.addTradeCode("Hi");
        efate.addTradeCode("Cp");
        efate.setHexCoordinates("1705");
        efate.setGasGiants(1);

        World yori = new World("Yori", "C560768-6", WorldType.DESERT);
        yori.setTravelZone(TravelZone.GREEN);
        yori.addTradeCode("De");
        yori.setHexCoordinates("1803");

        World forboldn = new World("Forboldn", "C551000-7", WorldType.VACUUM);
        forboldn.setTravelZone(TravelZone.AMBER);
        forboldn.addTradeCode("Ba");
        forboldn.addTradeCode("Va");
        forboldn.setHexCoordinates("1902");

        // Add the worlds to the subsector
        subsector.addWorld(regina);
        subsector.addWorld(efate);
        subsector.addWorld(yori);
        subsector.addWorld(forboldn);

        subsector.setDescription("A key subsector in the Spinward Marches, containing the sector capital Regina.");

        return subsector;
    }

    /**
     * Creates a standard Sword Worlds subsector.
     *
     * @return A new Sword Worlds subsector
     */
    public static Subsector createSwordWorldsSubsector() {
        Subsector subsector = new Subsector("Sword Worlds", "J");

        // Add some standard worlds to the subsector
        World gram = new World("Gram", "A867A74-B", WorldType.GARDEN);
        gram.setTravelZone(TravelZone.GREEN);
        gram.addTradeCode("Hi");
        gram.addTradeCode("Cp");
        gram.setHexCoordinates("0711");
        gram.setGasGiants(2);
        gram.setCulturalDetails("The political and cultural center of the Sword Worlds Confederation. Strong martial tradition with Norse-inspired culture.");

        World sacnoth = new World("Sacnoth", "B765979-8", WorldType.GARDEN);
        sacnoth.setTravelZone(TravelZone.GREEN);
        sacnoth.addTradeCode("Hi");
        sacnoth.setHexCoordinates("0812");
        sacnoth.setGasGiants(1);

        World durendal = new World("Durendal", "A5548B7-9", WorldType.GARDEN);
        durendal.setTravelZone(TravelZone.GREEN);
        durendal.addTradeCode("Ag");
        durendal.setHexCoordinates("0912");

        // Add the worlds to the subsector
        subsector.addWorld(gram);
        subsector.addWorld(sacnoth);
        subsector.addWorld(durendal);

        subsector.setDescription("Home of the fiercely independent Sword Worlds Confederation, known for their martial culture and Norse-inspired traditions.");

        return subsector;
    }

    /**
     * Creates a standard Vargr subsector.
     *
     * @return A new Vargr subsector
     */
    public static Subsector createVargrSubsector() {
        Subsector subsector = new Subsector("Lair", "N");

        // Add some standard worlds to the subsector
        World lair = new World("Lair", "A984976-E", WorldType.GARDEN);
        lair.setTravelZone(TravelZone.GREEN);
        lair.addTradeCode("Hi");
        lair.addTradeCode("Cp");
        lair.setHexCoordinates("2811");
        lair.setGasGiants(1);
        lair.setCulturalDetails("Major Vargr world with a charismatic leader who has united several packs into a stable government.");

        World ruse = new World("Ruse", "B560887-7", WorldType.DESERT);
        ruse.setTravelZone(TravelZone.GREEN);
        ruse.addTradeCode("De");
        ruse.addTradeCode("Ri");
        ruse.setHexCoordinates("2913");

        World anarsi = new World("Anarsi", "C6A5303-9", WorldType.WATER_WORLD);
        anarsi.setTravelZone(TravelZone.AMBER);
        anarsi.addTradeCode("Wa");
        anarsi.addTradeCode("Lo");
        anarsi.setHexCoordinates("3012");

        // Add the worlds to the subsector
        subsector.addWorld(lair);
        subsector.addWorld(ruse);
        subsector.addWorld(anarsi);

        subsector.setDescription("A subsector dominated by Vargr corsairs and traders, with constantly shifting political alliances.");

        return subsector;
    }

    /**
     * Creates a standard Zhodani subsector.
     *
     * @return A new Zhodani subsector
     */
    public static Subsector createZhodaniSubsector() {
        Subsector subsector = new Subsector("Cronor", "Q");

        // Add some standard worlds to the subsector
        World cronor = new World("Cronor", "A889977-E", WorldType.GARDEN);
        cronor.setTravelZone(TravelZone.GREEN);
        cronor.addTradeCode("Hi");
        cronor.addTradeCode("Cp");
        cronor.setHexCoordinates("2416");
        cronor.setGasGiants(2);
        cronor.setCulturalDetails("Major administrative center of the Zhodani Consulate, with strong psionic traditions and a rigid class structure.");

        World atsa = new World("Atsa", "B567756-A", WorldType.GARDEN);
        atsa.setTravelZone(TravelZone.GREEN);
        atsa.addTradeCode("Ag");
        atsa.setHexCoordinates("2516");
        atsa.setGasGiants(1);

        World zamine = new World("Zamine", "A6A0532-B", WorldType.ASTEROID);
        zamine.setTravelZone(TravelZone.GREEN);
        zamine.addTradeCode("As");
        zamine.addTradeCode("Ni");
        zamine.setHexCoordinates("2617");

        // Add the worlds to the subsector
        subsector.addWorld(cronor);
        subsector.addWorld(atsa);
        subsector.addWorld(zamine);

        subsector.setDescription("A core subsector of the Zhodani Consulate, known for its psionic institutions and rigid social hierarchy.");

        return subsector;
    }

    /**
     * Creates a subsector by name.
     *
     * @param name The name of the subsector to create
     * @return A new subsector of the specified name, or null if not recognized
     */
    public static Subsector createSubsector(String name) {
        switch (name.toLowerCase()) {
            case "regina":
                return createImperialSubsector();
            case "sword worlds":
                return createSwordWorldsSubsector();
            case "lair":
                return createVargrSubsector();
            case "cronor":
                return createZhodaniSubsector();
            default:
                return null;
        }
    }
}
