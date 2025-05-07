package com.barrows.travller.api.model;

/**
 * Factory class for creating standard worlds in the Traveller RPG system.
 */
public class WorldFactory {

    /**
     * Creates a standard Earth-like world.
     *
     * @return A new Earth-like world
     */
    public static World createEarthLikeWorld() {
        World world = new World("Terra", "A7A78A9-F", WorldType.GARDEN);
        world.setTravelZone(TravelZone.GREEN);
        world.addTradeCode("Ag");
        world.addTradeCode("Ri");
        world.addTradeCode("Hi");
        world.addTradeCode("Cp");
        world.setGasGiants(1);
        world.setSystemPosition(3);
        world.setSatellites(1);
        world.setCulturalDetails("Birthplace of humanity, with diverse cultures and a long history of technological development.");
        world.addPointOfInterest("United Nations Headquarters");
        world.addPointOfInterest("Ancient historical sites");
        world.addBase("Naval Base");
        world.addBase("Scout Base");
        return world;
    }

    /**
     * Creates a standard desert world.
     *
     * @return A new desert world
     */
    public static World createDesertWorld() {
        World world = new World("Dune", "B567300-9", WorldType.DESERT);
        world.setTravelZone(TravelZone.AMBER);
        world.addTradeCode("De");
        world.addTradeCode("Lo");
        world.setGasGiants(2);
        world.setSystemPosition(2);
        world.setSatellites(0);
        world.setCulturalDetails("Harsh desert environment with nomadic tribes that have adapted to the extreme conditions.");
        world.addPointOfInterest("Vast sand dunes");
        world.addPointOfInterest("Ancient ruins buried in the sand");
        world.addBase("Research Station");
        return world;
    }

    /**
     * Creates a standard ice world.
     *
     * @return A new ice world
     */
    public static World createIceWorld() {
        World world = new World("Frostheim", "C563201-7", WorldType.ICE);
        world.setTravelZone(TravelZone.GREEN);
        world.addTradeCode("Ic");
        world.addTradeCode("Lo");
        world.setGasGiants(0);
        world.setSystemPosition(5);
        world.setSatellites(2);
        world.setCulturalDetails("Small population living in underground habitats to escape the freezing surface temperatures.");
        world.addPointOfInterest("Massive glaciers");
        world.addPointOfInterest("Subterranean thermal springs");
        return world;
    }

    /**
     * Creates a standard high-tech world.
     *
     * @return A new high-tech world
     */
    public static World createHighTechWorld() {
        World world = new World("Nova Prime", "A788989-F", WorldType.HIGH_TECH);
        world.setTravelZone(TravelZone.GREEN);
        world.addTradeCode("Hi");
        world.addTradeCode("Ht");
        world.addTradeCode("Ri");
        world.setGasGiants(1);
        world.setSystemPosition(2);
        world.setSatellites(3);
        world.setCulturalDetails("Advanced technological society with automated systems handling most manual labor. Strong focus on scientific research and development.");
        world.addPointOfInterest("Orbital research stations");
        world.addPointOfInterest("Massive arcology cities");
        world.addBase("Naval Base");
        world.addBase("Research Facility");
        return world;
    }

    /**
     * Creates a standard agricultural world.
     *
     * @return A new agricultural world
     */
    public static World createAgriculturalWorld() {
        World world = new World("Harvest", "B678786-8", WorldType.AGRICULTURAL);
        world.setTravelZone(TravelZone.GREEN);
        world.addTradeCode("Ag");
        world.addTradeCode("Ga");
        world.setGasGiants(1);
        world.setSystemPosition(3);
        world.setSatellites(1);
        world.setCulturalDetails("Primarily agricultural society with vast farmlands and ranches. Major exporter of food and organic goods.");
        world.addPointOfInterest("Massive grain fields");
        world.addPointOfInterest("Agricultural research centers");
        world.addBase("Scout Base");
        return world;
    }

    /**
     * Creates a standard industrial world.
     *
     * @return A new industrial world
     */
    public static World createIndustrialWorld() {
        World world = new World("Forge", "A887989-C", WorldType.INDUSTRIAL);
        world.setTravelZone(TravelZone.GREEN);
        world.addTradeCode("In");
        world.addTradeCode("Hi");
        world.setGasGiants(2);
        world.setSystemPosition(4);
        world.setSatellites(0);
        world.setCulturalDetails("Heavy industrial world with massive factories and refineries. Major producer of manufactured goods and technology.");
        world.addPointOfInterest("Massive factory complexes");
        world.addPointOfInterest("Orbital shipyards");
        world.addBase("Naval Base");
        return world;
    }

    /**
     * Creates a standard water world.
     *
     * @return A new water world
     */
    public static World createWaterWorld() {
        World world = new World("Aquarius", "B56A768-9", WorldType.WATER_WORLD);
        world.setTravelZone(TravelZone.GREEN);
        world.addTradeCode("Wa");
        world.addTradeCode("Fl");
        world.setGasGiants(1);
        world.setSystemPosition(3);
        world.setSatellites(2);
        world.setCulturalDetails("Ocean world with floating cities and underwater habitats. Economy based on aquaculture and resource extraction from the sea floor.");
        world.addPointOfInterest("Floating metropolis");
        world.addPointOfInterest("Deep sea research stations");
        world.addBase("Naval Base");
        return world;
    }

    /**
     * Creates a standard asteroid belt.
     *
     * @return A new asteroid belt world
     */
    public static World createAsteroidBelt() {
        World world = new World("Ceres Belt", "B000357-B", WorldType.ASTEROID);
        world.setTravelZone(TravelZone.GREEN);
        world.addTradeCode("As");
        world.addTradeCode("Lo");
        world.setGasGiants(1);
        world.setSystemPosition(4);
        world.setSatellites(0);
        world.setCulturalDetails("Mining communities spread across multiple asteroids. Independent-minded population with a frontier mentality.");
        world.addPointOfInterest("Major mining operations");
        world.addPointOfInterest("Hollowed-out asteroid habitats");
        world.addBase("Scout Base");
        return world;
    }

    /**
     * Creates a world by name.
     *
     * @param name The name of the world to create
     * @return A new world of the specified name, or null if not recognized
     */
    public static World createWorld(String name) {
        switch (name.toLowerCase()) {
            case "terra":
            case "earth":
                return createEarthLikeWorld();
            case "dune":
                return createDesertWorld();
            case "frostheim":
                return createIceWorld();
            case "nova prime":
                return createHighTechWorld();
            case "harvest":
                return createAgriculturalWorld();
            case "forge":
                return createIndustrialWorld();
            case "aquarius":
                return createWaterWorld();
            case "ceres belt":
                return createAsteroidBelt();
            default:
                return null;
        }
    }
}
