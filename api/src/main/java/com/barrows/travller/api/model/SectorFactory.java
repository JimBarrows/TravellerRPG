package com.barrows.travller.api.model;

/**
 * Factory class for creating standard sectors in the Traveller RPG system.
 */
public class SectorFactory {

    /**
     * Creates a standard Spinward Marches sector.
     *
     * @return A new Spinward Marches sector
     */
    public static Sector createSpinwardMarches() {
        Sector sector = new Sector("Spinward Marches", "1120");

        // Add some standard subsectors to the sector
        Subsector regina = SubsectorFactory.createSubsector("Regina");
        Subsector swordWorlds = SubsectorFactory.createSubsector("Sword Worlds");

        // Create a simple Jewell subsector
        Subsector jewellSubsector = new Subsector("Jewell", "B");
        World jewellWorld = new World("Jewell", "A777999-C", WorldType.GARDEN);
        jewellWorld.setTravelZone(TravelZone.GREEN);
        jewellWorld.addTradeCode("Hi");
        jewellWorld.addTradeCode("Ri");
        jewellWorld.setHexCoordinates("1106");
        jewellWorld.setGasGiants(1);
        jewellWorld.setCulturalDetails("A wealthy Imperial world with significant naval presence.");
        jewellWorld.addBase("Naval Base");
        jewellWorld.addBase("Scout Base");
        jewellWorld.addPointOfInterest("Jewell Starport");
        jewellWorld.addPointOfInterest("Imperial Naval Academy");
        jewellWorld.addTradeCode("Cp");

        jewellSubsector.addWorld(jewellWorld);

        // Add the subsectors to the sector
        sector.addSubsector(regina);
        sector.addSubsector(swordWorlds);
        sector.addSubsector(jewellSubsector);

        sector.setDescription("A frontier sector of the Third Imperium, bordering the Zhodani Consulate and other interstellar powers. Known for its strategic importance and frequent border conflicts.");

        return sector;
    }

    /**
     * Creates a standard Solomani Rim sector.
     *
     * @return A new Solomani Rim sector
     */
    public static Sector createSolomaniRim() {
        Sector sector = new Sector("Solomani Rim", "1827");

        // Create a simple Terra subsector
        Subsector terra = new Subsector("Terra", "F");
        World earth = WorldFactory.createEarthLikeWorld();
        earth.setHexCoordinates("1827");
        terra.addWorld(earth);

        // Create a simple Alpha Centauri subsector
        Subsector alphaCentauri = new Subsector("Alpha Centauri", "G");
        World prometheus = new World("Prometheus", "A867956-D", WorldType.GARDEN);
        prometheus.setTravelZone(TravelZone.GREEN);
        prometheus.addTradeCode("Hi");
        prometheus.addTradeCode("Ri");
        prometheus.setHexCoordinates("1927");
        prometheus.setGasGiants(2);
        prometheus.setCulturalDetails("One of the first extrasolar colonies of humanity, with a proud tradition of independence.");
        alphaCentauri.addWorld(prometheus);

        // Add the subsectors to the sector
        sector.addSubsector(terra);
        sector.addSubsector(alphaCentauri);

        sector.setDescription("The birthplace of humanity and the heart of the Solomani Confederation. Contains Terra (Earth) and many of the oldest human colonies.");

        return sector;
    }

    /**
     * Creates a standard Zhodani Core sector.
     *
     * @return A new Zhodani Core sector
     */
    public static Sector createZhodaniCore() {
        Sector sector = new Sector("Zhodani Core", "-320");

        // Add the Cronor subsector
        Subsector cronor = SubsectorFactory.createSubsector("Cronor");

        // Create a simple Zhdant subsector (Zhodani homeworld)
        Subsector zhdant = new Subsector("Zhdant", "P");
        World zhodane = new World("Zhodane", "A9A7A87-F", WorldType.GARDEN);
        zhodane.setTravelZone(TravelZone.GREEN);
        zhodane.addTradeCode("Hi");
        zhodane.addTradeCode("Ri");
        zhodane.addTradeCode("Cp");
        zhodane.setHexCoordinates("2318");
        zhodane.setGasGiants(1);
        zhodane.setCulturalDetails("The homeworld of the Zhodani and capital of the Zhodani Consulate. Known for its advanced psionic institutions and rigid three-tiered social structure.");
        zhodane.addBase("Naval Base");
        zhodane.addBase("Psionic Institute");
        zhodane.addPointOfInterest("Consular Palace");
        zhodane.addPointOfInterest("Grand Psionic Academy");

        zhdant.addWorld(zhodane);

        // Add the subsectors to the sector
        sector.addSubsector(cronor);
        sector.addSubsector(zhdant);

        sector.setDescription("The heart of the Zhodani Consulate, containing the Zhodani homeworld and the central institutions of their psionic society.");

        return sector;
    }

    /**
     * Creates a sector by name.
     *
     * @param name The name of the sector to create
     * @return A new sector of the specified name, or null if not recognized
     */
    public static Sector createSector(String name) {
        switch (name.toLowerCase()) {
            case "spinward marches":
                return createSpinwardMarches();
            case "solomani rim":
                return createSolomaniRim();
            case "zhodani core":
                return createZhodaniCore();
            default:
                return null;
        }
    }
}
