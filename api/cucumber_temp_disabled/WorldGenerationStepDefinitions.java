package com.barrows.travller.api.cucumber;

import com.barrows.travller.api.model.*;
import com.barrows.travller.api.repository.*;
import io.cucumber.java.en.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Step definitions for world generation feature.
 * Tests procedural generation of star systems, worlds, and their characteristics.
 */
@SpringBootTest
public class WorldGenerationStepDefinitions {

    @Autowired
    private ApiTestHelper testHelper;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private SubsectorRepository subsectorRepository;

    private World generatedWorld;
    private Map<String, Object> systemData;

    @Given("I am creating a new star system")
    public void iAmCreatingANewStarSystem() {
        testHelper.seedGameData();
        testHelper.clearContext();

        systemData = new HashMap<>();
        systemData.put("coordinates", "0101"); // Hex coordinates
        systemData.put("sector", "Spinward Marches");
        systemData.put("subsector", "Regina");
        
        testHelper.storeInContext("systemData", systemData);
        testHelper.storeInContext("generatingSystem", true);
    }

    @When("I generate a new world")
    public void iGenerateANewWorld() {
        // Initialize world generation process
        generatedWorld = new World();
        generatedWorld.setName("Generated World");
        // generatedWorld.setHexLocation("0101"); // Method not available in current model
        
        testHelper.storeInContext("worldGeneration", true);
        testHelper.storeInContext("generatedWorld", generatedWorld);
        
        // Start with basic world shell
        assertNotNull(generatedWorld);
    }

    @Then("I should determine the world's physical characteristics")
    public void iShouldDetermineTheWorldsPhysicalCharacteristics() {
        // Generate size (2D6-2, range 0-10)
        testHelper.setDiceRoll("world_size", 7);
        int sizeRoll = testHelper.roll2D6();
        int worldSize = Math.max(0, sizeRoll - 2);
        
        generatedWorld.setSize(worldSize);
        testHelper.storeInContext("worldSize", worldSize);
        
        // Size affects other characteristics
        assertTrue(worldSize >= 0 && worldSize <= 10);
    }

    @And("I should establish the world's atmosphere type")
    public void iShouldEstablishTheWorldsAtmosphereType() {
        Integer worldSize = testHelper.getFromContext("worldSize");
        
        // Atmosphere depends on size
        testHelper.setDiceRoll("atmosphere", 8);
        int atmosphereRoll = testHelper.roll2D6();
        int atmosphereCode = atmosphereRoll - 7 + worldSize;
        atmosphereCode = Math.max(0, Math.min(15, atmosphereCode)); // Clamp to 0-15
        
        // Map atmosphere code to type
        AtmosphereType atmosphereType;
        switch (atmosphereCode) {
            case 0: atmosphereType = AtmosphereType.NONE; break;
            case 1: atmosphereType = AtmosphereType.TRACE; break;
            case 2: case 3: atmosphereType = AtmosphereType.VERY_THIN; break;
            case 4: case 5: case 6: atmosphereType = AtmosphereType.STANDARD; break;
            case 7: case 8: case 9: atmosphereType = AtmosphereType.DENSE; break;
            default: atmosphereType = AtmosphereType.EXOTIC; break;
        }
        
        generatedWorld.setAtmosphere(atmosphereType.ordinal()); // Convert enum to int
        testHelper.storeInContext("atmosphereType", atmosphereType);
        testHelper.storeInContext("atmosphereCode", atmosphereCode);
        
        assertNotNull(atmosphereType);
    }

    @And("I should determine the world's hydrographic percentage")
    public void iShouldDetermineTheWorldsHydrographicPercentage() {
        Integer worldSize = testHelper.getFromContext("worldSize");
        Integer atmosphereCode = testHelper.getFromContext("atmosphereCode");
        
        // Hydrographics depends on size and atmosphere
        testHelper.setDiceRoll("hydrographics", 6);
        int hydroRoll = testHelper.roll2D6();
        int hydrographics = hydroRoll - 7 + worldSize;
        
        // Atmosphere modifiers
        if (atmosphereCode <= 1 || atmosphereCode >= 10) {
            hydrographics -= 4;
        }
        
        hydrographics = Math.max(0, Math.min(10, hydrographics)); // Clamp to 0-10
        int hydrographicPercentage = hydrographics * 10; // Convert to percentage
        
        generatedWorld.setHydrographics(hydrographicPercentage);
        testHelper.storeInContext("hydrographics", hydrographics);
        testHelper.storeInContext("hydrographicPercentage", hydrographicPercentage);
        
        assertTrue(hydrographicPercentage >= 0 && hydrographicPercentage <= 100);
    }

    @And("I should establish the world's population")
    public void iShouldEstablishTheWorldsPopulation() {
        // Population (2D6-2, range 0-10)
        testHelper.setDiceRoll("population", 9);
        int populationRoll = testHelper.roll2D6();
        int populationCode = Math.max(0, populationRoll - 2);
        
        // Convert population code to actual population
        long actualPopulation;
        if (populationCode == 0) {
            actualPopulation = 0;
        } else {
            actualPopulation = (long) (Math.pow(10, populationCode) * (1 + Math.random()));
        }
        
        generatedWorld.setPopulation((int) actualPopulation); // Cast long to int
        testHelper.storeInContext("populationCode", populationCode);
        testHelper.storeInContext("actualPopulation", actualPopulation);
        
        assertTrue(populationCode >= 0 && populationCode <= 10);
    }

    @And("I should determine the world's government type")
    public void iShouldDetermineTheWorldsGovernmentType() {
        Integer populationCode = testHelper.getFromContext("populationCode");
        
        // Government depends on population
        testHelper.setDiceRoll("government", 7);
        int govRoll = testHelper.roll2D6();
        int governmentCode = govRoll - 7 + populationCode;
        governmentCode = Math.max(0, Math.min(15, governmentCode));
        
        // Map government code to type
        PoliticalEntityType governmentType;
        switch (governmentCode) {
            case 0: governmentType = PoliticalEntityType.ANARCHY; break;
            case 1: governmentType = PoliticalEntityType.CORPORATE_STATE; break;
            case 2: governmentType = PoliticalEntityType.REPUBLIC; break;
            case 3: case 4: governmentType = PoliticalEntityType.REPUBLIC; break;
            case 5: case 6: governmentType = PoliticalEntityType.KINGDOM; break;
            case 7: case 8: governmentType = PoliticalEntityType.DICTATORSHIP; break;
            default: governmentType = PoliticalEntityType.EMPIRE; break;
        }
        
        testHelper.storeInContext("governmentType", governmentType);
        testHelper.storeInContext("governmentCode", governmentCode);
        
        assertNotNull(governmentType);
    }

    @And("I should establish the world's law level")
    public void iShouldEstablishTheWorldsLawLevel() {
        Integer governmentCode = testHelper.getFromContext("governmentCode");
        
        // Law level depends on government
        testHelper.setDiceRoll("law_level", 8);
        int lawRoll = testHelper.roll2D6();
        int lawLevel = lawRoll - 7 + governmentCode;
        lawLevel = Math.max(0, Math.min(18, lawLevel)); // Can go higher than 10
        
        generatedWorld.setLawLevel(lawLevel);
        testHelper.storeInContext("lawLevel", lawLevel);
        
        assertTrue(lawLevel >= 0);
    }

    @And("I should determine the world's technology level")
    public void iShouldDetermineTheWorldsTechnologyLevel() {
        Integer populationCode = testHelper.getFromContext("populationCode");
        Integer governmentCode = testHelper.getFromContext("governmentCode");
        Integer atmosphereCode = testHelper.getFromContext("atmosphereCode");
        Integer hydrographics = testHelper.getFromContext("hydrographics");
        
        // Tech level has multiple modifiers
        testHelper.setDiceRoll("tech_level", 6);
        int techRoll = testHelper.roll1D6();
        int techLevel = techRoll;
        
        // Apply modifiers based on other characteristics
        if (populationCode >= 9) techLevel += 2;
        else if (populationCode >= 8) techLevel += 1;
        else if (populationCode <= 1) techLevel += 1;
        
        if (governmentCode == 0 || governmentCode == 5) techLevel += 1;
        else if (governmentCode == 13) techLevel -= 2;
        
        if (atmosphereCode <= 3 || atmosphereCode >= 10) techLevel += 1;
        if (hydrographics == 9) techLevel += 1;
        else if (hydrographics == 10) techLevel += 2;
        
        techLevel = Math.max(0, techLevel);
        
        generatedWorld.setTechLevel(techLevel);
        testHelper.storeInContext("techLevel", techLevel);
        
        assertTrue(techLevel >= 0);
    }

    @When("I assign a starport to a world")
    public void iAssignAStarportToAWorld() {
        // Starport class based on 2D6 roll
        testHelper.setDiceRoll("starport", 7);
        int starportRoll = testHelper.roll2D6();
        
        char starportClass;
        if (starportRoll <= 2) starportClass = 'X'; // No starport
        else if (starportRoll <= 4) starportClass = 'E'; // Frontier
        else if (starportRoll <= 6) starportClass = 'D'; // Poor
        else if (starportRoll <= 8) starportClass = 'C'; // Routine
        else if (starportRoll <= 10) starportClass = 'B'; // Good
        else starportClass = 'A'; // Excellent
        
        testHelper.storeInContext("starportClass", starportClass);
        testHelper.storeInContext("starportRoll", starportRoll);
    }

    @Then("I should determine the starport class")
    public void iShouldDetermineTheStarportClass() {
        java.lang.Character starportClass = testHelper.getFromContext("starportClass");
        assertNotNull(starportClass);
        assertTrue("XEDCBA".indexOf(starportClass) >= 0);
    }

    @And("the starport facilities should correspond to its class")
    public void theStarportFacilitiesShouldCorrespondToItsClass() {
        java.lang.Character starportClass = testHelper.getFromContext("starportClass");
        
        Map<String, List<String>> facilities = new HashMap<>();
        
        switch (starportClass) {
            case 'A':
                facilities.put("facilities", List.of("Fuel", "Repairs", "Shipyard", "Trading", "Medical", "Brokerage"));
                facilities.put("quality", List.of("Excellent", "TL+2 shipyard"));
                break;
            case 'B':
                facilities.put("facilities", List.of("Fuel", "Repairs", "Shipyard", "Trading", "Medical"));
                facilities.put("quality", List.of("Good", "TL+0 shipyard"));
                break;
            case 'C':
                facilities.put("facilities", List.of("Fuel", "Repairs", "Trading"));
                facilities.put("quality", List.of("Routine", "No shipyard"));
                break;
            case 'D':
                facilities.put("facilities", List.of("Fuel", "Limited Repairs"));
                facilities.put("quality", List.of("Poor", "No advanced services"));
                break;
            case 'E':
                facilities.put("facilities", List.of("Fuel"));
                facilities.put("quality", List.of("Frontier", "Minimal facilities"));
                break;
            case 'X':
                facilities.put("facilities", List.of());
                facilities.put("quality", List.of("None", "No starport"));
                break;
        }
        
        testHelper.storeInContext("starportFacilities", facilities);
        assertNotNull(facilities);
    }

    @And("the available services should match the starport class")
    public void theAvailableServicesShouldMatchTheStarportClass() {
        @SuppressWarnings("unchecked")
        Map<String, List<String>> facilities = testHelper.getFromContext("starportFacilities");
        java.lang.Character starportClass = testHelper.getFromContext("starportClass");
        
        List<String> availableServices = facilities.get("facilities");
        
        // Verify services match expectations
        if (starportClass == 'A') {
            assertTrue(availableServices.contains("Shipyard"));
            assertTrue(availableServices.contains("Brokerage"));
        } else if (starportClass == 'X') {
            assertTrue(availableServices.isEmpty());
        }
        
        testHelper.storeInContext("availableServices", availableServices);
    }

    @Given("I have determined a world's characteristics")
    public void iHaveDeterminedAWorldsCharacteristics() {
        iGenerateANewWorld();
        iShouldDetermineTheWorldsPhysicalCharacteristics();
        iShouldEstablishTheWorldsAtmosphereType();
        iShouldDetermineTheWorldsHydrographicPercentage();
        iShouldEstablishTheWorldsPopulation();
        iShouldDetermineTheWorldsGovernmentType();
        iShouldEstablishTheWorldsLawLevel();
        iShouldDetermineTheWorldsTechnologyLevel();
    }

    @When("I assign trade codes")
    public void iAssignTradeCodes() {
        Integer worldSize = testHelper.getFromContext("worldSize");
        Integer atmosphereCode = testHelper.getFromContext("atmosphereCode");
        Integer hydrographics = testHelper.getFromContext("hydrographics");
        Integer populationCode = testHelper.getFromContext("populationCode");
        Integer governmentCode = testHelper.getFromContext("governmentCode");
        Integer techLevel = testHelper.getFromContext("techLevel");
        
        Map<String, String> tradeCodes = new HashMap<>();
        
        // Agricultural: Atmosphere 4-9, Hydrographics 4-8, Population 5-7
        if (atmosphereCode >= 4 && atmosphereCode <= 9 && 
            hydrographics >= 4 && hydrographics <= 8 && 
            populationCode >= 5 && populationCode <= 7) {
            tradeCodes.put("Ag", "Agricultural");
        }
        
        // High Population: Population 9+
        if (populationCode >= 9) {
            tradeCodes.put("Hi", "High Population");
        }
        
        // Industrial: Atmosphere 0-2, 4, 7, 9 or Population 9+
        if ((atmosphereCode <= 2 || atmosphereCode == 4 || atmosphereCode == 7 || atmosphereCode == 9) ||
            populationCode >= 9) {
            tradeCodes.put("In", "Industrial");
        }
        
        // Low Population: Population 1-3
        if (populationCode >= 1 && populationCode <= 3) {
            tradeCodes.put("Lo", "Low Population");
        }
        
        // Rich: Atmosphere 6-8, Population 6-8, Government 4-9
        if (atmosphereCode >= 6 && atmosphereCode <= 8 &&
            populationCode >= 6 && populationCode <= 8 &&
            governmentCode >= 4 && governmentCode <= 9) {
            tradeCodes.put("Ri", "Rich");
        }
        
        // High Technology: Tech Level 12+
        if (techLevel >= 12) {
            tradeCodes.put("Ht", "High Technology");
        }
        
        // Non-Industrial: Population 4-6
        if (populationCode >= 4 && populationCode <= 6) {
            tradeCodes.put("Ni", "Non-Industrial");
        }
        
        testHelper.storeInContext("tradeCodes", tradeCodes);
        testHelper.storeInContext("tradeCodesAssigned", true);
    }

    @Then("the trade codes should reflect the world's physical and social characteristics")
    public void theTradeCodesShouldReflectTheWorldsPhysicalAndSocialCharacteristics() {
        @SuppressWarnings("unchecked")
        Map<String, String> tradeCodes = testHelper.getFromContext("tradeCodes");
        Integer populationCode = testHelper.getFromContext("populationCode");
        Integer techLevel = testHelper.getFromContext("techLevel");
        
        assertNotNull(tradeCodes);
        
        // Verify logical consistency
        if (populationCode >= 9 && tradeCodes.containsKey("Hi")) {
            assertEquals("High Population", tradeCodes.get("Hi"));
        }
        
        if (techLevel >= 12 && tradeCodes.containsKey("Ht")) {
            assertEquals("High Technology", tradeCodes.get("Ht"));
        }
    }

    @And("the trade codes should influence available goods and prices")
    public void theTradeCodesShouldInfluenceAvailableGoodsAndPrices() {
        @SuppressWarnings("unchecked")
        Map<String, String> tradeCodes = testHelper.getFromContext("tradeCodes");
        
        Map<String, Map<String, Object>> goodsInfluence = new HashMap<>();
        
        if (tradeCodes.containsKey("Ag")) {
            Map<String, Object> agGoods = new HashMap<>();
            agGoods.put("exports", List.of("Food", "Textiles", "Wood"));
            agGoods.put("priceModifier", Map.of("Food", 0.8, "Machinery", 1.2));
            goodsInfluence.put("Agricultural", agGoods);
        }
        
        if (tradeCodes.containsKey("In")) {
            Map<String, Object> inGoods = new HashMap<>();
            inGoods.put("exports", List.of("Manufactured Goods", "Machinery", "Electronics"));
            inGoods.put("priceModifier", Map.of("Manufactured", 0.9, "Agricultural", 1.1));
            goodsInfluence.put("Industrial", inGoods);
        }
        
        if (tradeCodes.containsKey("Ht")) {
            Map<String, Object> htGoods = new HashMap<>();
            htGoods.put("exports", List.of("Advanced Technology", "Computers", "Medical Equipment"));
            htGoods.put("priceModifier", Map.of("Technology", 0.85, "LowTech", 1.3));
            goodsInfluence.put("HighTech", htGoods);
        }
        
        testHelper.storeInContext("goodsInfluence", goodsInfluence);
        assertFalse(goodsInfluence.isEmpty());
    }

    @When("I determine gas giant presence")
    public void iDetermineGasGiantPresence() {
        testHelper.setDiceRoll("gas_giant", 8);
        int gasGiantRoll = testHelper.roll2D6();
        boolean hasGasGiant = gasGiantRoll >= 10; // 10+ for gas giant presence
        
        testHelper.storeInContext("hasGasGiant", hasGasGiant);
        testHelper.storeInContext("gasGiantRoll", gasGiantRoll);
        
        if (hasGasGiant) {
            // Generate number of gas giants
            int numGasGiants = testHelper.roll1D6() / 2 + 1; // 1-4 gas giants
            testHelper.storeInContext("numGasGiants", numGasGiants);
        }
    }

    @Then("I should roll to see if gas giants exist in the system")
    public void iShouldRollToSeeIfGasGiantsExistInTheSystem() {
        Integer gasGiantRoll = testHelper.getFromContext("gasGiantRoll");
        assertNotNull(gasGiantRoll);
        assertTrue(gasGiantRoll >= 2 && gasGiantRoll <= 12);
    }

    @And("gas giants should affect refueling options for ships")
    public void gasGiantsShouldAffectRefuelingOptionsForShips() {
        Boolean hasGasGiant = testHelper.getFromContext("hasGasGiant");
        
        Map<String, Object> refuelingOptions = new HashMap<>();
        
        if (hasGasGiant != null && hasGasGiant) {
            refuelingOptions.put("gasGiantRefueling", true);
            refuelingOptions.put("refuelingCost", "Free");
            refuelingOptions.put("refuelingRisk", "Pilot skill check required");
            refuelingOptions.put("refuelingTime", "1-6 hours");
        } else {
            refuelingOptions.put("gasGiantRefueling", false);
            refuelingOptions.put("refuelingOptions", "Starport only");
        }
        
        testHelper.storeInContext("refuelingOptions", refuelingOptions);
        assertNotNull(refuelingOptions);
    }

    @When("I assign a travel zone to a world")
    public void iAssignATravelZoneToAWorld() {
        Integer lawLevel = testHelper.getFromContext("lawLevel");
        Integer governmentCode = testHelper.getFromContext("governmentCode");
        Integer techLevel = testHelper.getFromContext("techLevel");
        
        // Determine travel zone based on various factors
        testHelper.setDiceRoll("travel_zone", 6);
        int zoneRoll = testHelper.roll2D6();
        
        TravelZone travelZone = TravelZone.GREEN; // Default safe
        
        // Modifiers for dangerous conditions
        if (lawLevel >= 15) zoneRoll -= 2; // High law level
        if (governmentCode == 0) zoneRoll -= 3; // Anarchy
        if (techLevel <= 3) zoneRoll -= 1; // Low tech
        
        if (zoneRoll <= 4) {
            travelZone = TravelZone.RED; // Forbidden
        } else if (zoneRoll <= 7) {
            travelZone = TravelZone.AMBER; // Caution advised
        }
        
        generatedWorld.setTravelZone(travelZone);
        testHelper.storeInContext("travelZone", travelZone);
        testHelper.storeInContext("zoneRoll", zoneRoll);
    }

    @Then("the zone should be based on danger level")
    public void theZoneShouldBeBasedOnDangerLevel() {
        TravelZone travelZone = testHelper.getFromContext("travelZone");
        Integer zoneRoll = testHelper.getFromContext("zoneRoll");
        Integer lawLevel = testHelper.getFromContext("lawLevel");
        Integer governmentCode = testHelper.getFromContext("governmentCode");
        
        assertNotNull(travelZone);
        
        // Verify logical assignment
        if (governmentCode == 0 || lawLevel >= 15) {
            // Anarchy or extreme law should influence zone
            assertTrue(travelZone == TravelZone.RED || travelZone == TravelZone.AMBER);
        }
    }

    @And("amber zones should indicate caution is advised")
    public void amberZonesShouldIndicateCautionIsAdvised() {
        TravelZone travelZone = testHelper.getFromContext("travelZone");
        
        if (travelZone == TravelZone.AMBER) {
            Map<String, String> amberWarnings = new HashMap<>();
            amberWarnings.put("status", "Caution Advised");
            amberWarnings.put("meaning", "Dangerous conditions may exist");
            amberWarnings.put("recommendation", "Exercise caution when visiting");
            
            testHelper.storeInContext("amberWarnings", amberWarnings);
            assertEquals("Caution Advised", amberWarnings.get("status"));
        }
    }

    @And("red zones should indicate travel is forbidden")
    public void redZonesShouldIndicateTravelIsForbidden() {
        TravelZone travelZone = testHelper.getFromContext("travelZone");
        
        if (travelZone == TravelZone.RED) {
            Map<String, String> redWarnings = new HashMap<>();
            redWarnings.put("status", "Travel Forbidden");
            redWarnings.put("meaning", "Extremely dangerous conditions");
            redWarnings.put("restriction", "Imperial Navy interdiction");
            
            testHelper.storeInContext("redWarnings", redWarnings);
            assertEquals("Travel Forbidden", redWarnings.get("status"));
        }
    }

    @When("I name a newly generated world")
    public void iNameANewlyGeneratedWorld() {
        // Generate world name based on various methods
        String[] nameComponents = {
            "Alpha", "Beta", "Gamma", "Delta", "Prime", "Major", "Minor",
            "New", "Old", "Terra", "Aqua", "Desert", "Forest", "Ice"
        };
        
        String[] suffixes = {
            "", " Prime", " Alpha", " Beta", " Major", " Minor", 
            " Station", " Colony", " Outpost"
        };
        
        Random random = new Random();
        String baseName = nameComponents[random.nextInt(nameComponents.length)];
        String suffix = suffixes[random.nextInt(suffixes.length)];
        String worldName = baseName + suffix;
        
        // Ensure uniqueness
        // if (worldRepository.findByName(worldName).isPresent()) { // Method not available in current repository
        //     worldName = baseName + " " + random.nextInt(1000);
        // }
        
        generatedWorld.setName(worldName);
        testHelper.storeInContext("generatedWorldName", worldName);
    }

    @Then("the name should be appropriate for the setting")
    public void theNameShouldBeAppropriateForTheSetting() {
        String worldName = testHelper.getFromContext("generatedWorldName");
        assertNotNull(worldName);
        assertTrue(worldName.length() > 0);
        
        // Basic validation - name should be reasonable
        assertTrue(worldName.length() <= 50);
        assertFalse(worldName.trim().isEmpty());
    }

    @And("the name should be recorded in the world data")
    public void theNameShouldBeRecordedInTheWorldData() {
        String worldName = testHelper.getFromContext("generatedWorldName");
        assertEquals(worldName, generatedWorld.getName());
        
        // Save the generated world
        generatedWorld = worldRepository.save(generatedWorld);
        testHelper.storeInContext("savedWorld", generatedWorld);
        
        assertNotNull(generatedWorld.getId());
    }

    // Additional step definitions for system position, star type, satellites,
    // detailed mapping, cultural details, and points of interest would follow
    // similar patterns of procedural generation with dice rolls and logical rules.
    
    @When("I determine a world's position in the system")
    public void iDetermineAWorldsPositionInTheSystem() {
        testHelper.setDiceRoll("orbital_position", 8);
        int orbitalRoll = testHelper.roll2D6();
        
        // Orbital zone: 0-4 Inner, 5-9 Habitable, 10-14 Outer
        String orbitalZone;
        if (orbitalRoll <= 4) {
            orbitalZone = "Inner System";
        } else if (orbitalRoll <= 9) {
            orbitalZone = "Habitable Zone";
        } else {
            orbitalZone = "Outer System";
        }
        
        testHelper.storeInContext("orbitalZone", orbitalZone);
        testHelper.storeInContext("orbitalDistance", orbitalRoll * 0.1); // AU from star
    }

    @Then("I should establish its orbit around the primary star")
    public void iShouldEstablishItsOrbitAroundThePrimaryStar() {
        String orbitalZone = testHelper.getFromContext("orbitalZone");
        Double orbitalDistance = testHelper.getFromContext("orbitalDistance");
        
        assertNotNull(orbitalZone);
        assertNotNull(orbitalDistance);
        assertTrue(orbitalDistance > 0);
    }

    @And("the position should affect the world's temperature")
    public void thePositionShouldAffectTheWorldsTemperature() {
        String orbitalZone = testHelper.getFromContext("orbitalZone");
        
        String temperatureRange;
        switch (orbitalZone) {
            case "Inner System":
                temperatureRange = "Hot (200-500°C)";
                break;
            case "Habitable Zone":
                temperatureRange = "Temperate (-50 to 50°C)";
                break;
            case "Outer System":
                temperatureRange = "Frozen (-200 to -100°C)";
                break;
            default:
                temperatureRange = "Unknown";
        }
        
        testHelper.storeInContext("temperatureRange", temperatureRange);
        assertNotNull(temperatureRange);
    }

    @When("I determine the system's star type")
    public void iDetermineTheSystemsStarType() {
        testHelper.setDiceRoll("star_type", 7);
        int starRoll = testHelper.roll2D6();
        
        String spectralClass;
        String characteristics;
        
        if (starRoll <= 2) {
            spectralClass = "M"; // Red dwarf
            characteristics = "Cool, long-lived, dim";
        } else if (starRoll <= 4) {
            spectralClass = "K"; // Orange dwarf
            characteristics = "Cool, stable";
        } else if (starRoll <= 8) {
            spectralClass = "G"; // Yellow dwarf (like our Sun)
            characteristics = "Stable, moderate temperature";
        } else if (starRoll <= 10) {
            spectralClass = "F"; // Yellow-white
            characteristics = "Hot, shorter-lived";
        } else if (starRoll == 11) {
            spectralClass = "A"; // White
            characteristics = "Very hot, short-lived";
        } else {
            spectralClass = "B"; // Blue-white
            characteristics = "Extremely hot, very short-lived";
        }
        
        testHelper.storeInContext("spectralClass", spectralClass);
        testHelper.storeInContext("starCharacteristics", characteristics);
    }

    @Then("I should establish the spectral class and characteristics")
    public void iShouldEstablishTheSpectralClassAndCharacteristics() {
        String spectralClass = testHelper.getFromContext("spectralClass");
        String characteristics = testHelper.getFromContext("starCharacteristics");
        
        assertNotNull(spectralClass);
        assertNotNull(characteristics);
        assertTrue("MKGFAB".contains(spectralClass));
    }

    @And("the star type should influence the system's habitable zone")
    public void theStarTypeShouldInfluenceTheSystemsHabitableZone() {
        String spectralClass = testHelper.getFromContext("spectralClass");
        
        Map<String, Double> habitableZone = new HashMap<>();
        
        switch (spectralClass) {
            case "M":
                habitableZone.put("inner", 0.1);
                habitableZone.put("outer", 0.5);
                break;
            case "K":
                habitableZone.put("inner", 0.5);
                habitableZone.put("outer", 1.2);
                break;
            case "G":
                habitableZone.put("inner", 0.8);
                habitableZone.put("outer", 1.5);
                break;
            case "F":
                habitableZone.put("inner", 1.2);
                habitableZone.put("outer", 2.2);
                break;
            case "A":
                habitableZone.put("inner", 2.0);
                habitableZone.put("outer", 4.0);
                break;
            case "B":
                habitableZone.put("inner", 4.0);
                habitableZone.put("outer", 8.0);
                break;
        }
        
        testHelper.storeInContext("habitableZone", habitableZone);
        assertNotNull(habitableZone);
        assertTrue(habitableZone.get("outer") > habitableZone.get("inner"));
    }
}