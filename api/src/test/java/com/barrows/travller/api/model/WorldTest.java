package com.barrows.travller.api.model;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Tests for the World class.
 */
public class WorldTest {

    @Test
    public void testWorldCreation() {
        // Test creating a world directly
        World world = new World("Test World", "A123456-7", WorldType.GARDEN);
        assertEquals("Test World", world.getName());
        assertEquals("A123456-7", world.getUwp());
        assertEquals(WorldType.GARDEN, world.getType());

        // Test UWP parsing
        assertEquals('A', world.getStarportClass());
        assertEquals(1, world.getSize());
        assertEquals(2, world.getAtmosphere());
        assertEquals(3, world.getHydrographics());
        assertEquals(4, world.getPopulation());
        assertEquals(5, world.getGovernment());
        assertEquals(6, world.getLawLevel());
        assertEquals(7, world.getTechLevel());
    }

    @Test
    public void testWorldFactory() {
        // Test creating a world with the factory
        World earth = WorldFactory.createEarthLikeWorld();
        assertEquals("Terra", earth.getName());
        assertEquals(WorldType.GARDEN, earth.getType());
        assertEquals(TravelZone.GREEN, earth.getTravelZone());

        // Test trade codes
        assertTrue(earth.getTradeCodes().contains("Ag"));
        assertTrue(earth.getTradeCodes().contains("Ri"));
        assertTrue(earth.getTradeCodes().contains("Hi"));

        // Test other properties
        assertEquals(1, earth.getGasGiants());
        assertEquals(3, earth.getSystemPosition());
        assertEquals(1, earth.getSatellites());

        // Test bases and points of interest
        assertTrue(earth.getBases().contains("Naval Base"));
        assertTrue(earth.getBases().contains("Scout Base"));
        assertTrue(earth.getPointsOfInterest().contains("United Nations Headquarters"));
    }

    @Test
    public void testWorldMethods() {
        World world = new World("Test World", "A123456-7", WorldType.GARDEN);

        // Test adding trade codes
        world.addTradeCode("Ag");
        world.addTradeCode("Ri");
        assertTrue(world.getTradeCodes().contains("Ag"));
        assertTrue(world.getTradeCodes().contains("Ri"));
        assertEquals(2, world.getTradeCodes().size());

        // Test adding bases
        world.addBase("Naval Base");
        world.addBase("Scout Base");
        assertTrue(world.getBases().contains("Naval Base"));
        assertTrue(world.getBases().contains("Scout Base"));
        assertEquals(2, world.getBases().size());

        // Test adding points of interest
        world.addPointOfInterest("Capital City");
        world.addPointOfInterest("Ancient Ruins");
        assertTrue(world.getPointsOfInterest().contains("Capital City"));
        assertTrue(world.getPointsOfInterest().contains("Ancient Ruins"));
        assertEquals(2, world.getPointsOfInterest().size());

        // Test setting travel zone
        world.setTravelZone(TravelZone.AMBER);
        assertEquals(TravelZone.AMBER, world.getTravelZone());

        // Test setting hex coordinates
        world.setHexCoordinates("0101");
        assertEquals("0101", world.getHexCoordinates());
    }

    @Test
    public void testWorldRelationships() {
        World world = new World("Test World", "A123456-7", WorldType.GARDEN);

        // Test subsector relationship
        Subsector subsector = new Subsector("Test Subsector");
        subsector.addWorld(world);
        assertEquals(subsector, world.getSubsector());
        assertEquals(1, subsector.getWorlds().size());
        assertTrue(subsector.getWorlds().contains(world));

        // Test political entity relationship
        PoliticalEntity politicalEntity = new PoliticalEntity("Test Empire", PoliticalEntityType.EMPIRE);
        politicalEntity.addControlledWorld(world);
        assertEquals(politicalEntity, world.getPoliticalEntity());
        assertEquals(1, politicalEntity.getControlledWorlds().size());
        assertTrue(politicalEntity.getControlledWorlds().contains(world));
    }
}
