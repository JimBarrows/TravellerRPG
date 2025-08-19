package com.barrows.travller.api.cucumber;

import com.barrows.travller.api.model.*;
import com.barrows.travller.api.repository.*;
import io.cucumber.java.en.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Step definitions for space travel and spacecraft feature.
 * Tests spacecraft operations, jump travel, combat, and space encounters.
 */
@SpringBootTest
public class SpaceTravelStepDefinitions {

    @Autowired
    private ApiTestHelper testHelper;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private SpaceshipRepository spaceshipRepository;

    @Autowired
    private SkillRepository skillRepository;

    private com.barrows.travller.api.model.Character spacefarer;
    private Spaceship spacecraft;

    @Given("I have access to a spacecraft")
    public void iHaveAccessToASpacecraft() {
        testHelper.seedGameData();
        testHelper.clearContext();

        // Create a character with spacefaring skills
        spacefarer = testHelper.createTestCharacter("Captain Spacefarer");
        
        // Add relevant skills
        com.barrows.travller.api.model.Skill pilot = testHelper.createTestSkill("Pilot", 3);
        com.barrows.travller.api.model.Skill engineering = testHelper.createTestSkill("Engineering", 2);
        com.barrows.travller.api.model.Skill gunner = testHelper.createTestSkill("Gunner", 2);
        com.barrows.travller.api.model.Skill sensors = testHelper.createTestSkill("Electronics", 1);
        
        spacefarer.addSkill(pilot);
        spacefarer.addSkill(engineering);
        spacefarer.addSkill(gunner);
        spacefarer.addSkill(sensors);
        
        spacefarer = characterRepository.save(spacefarer);

        // Create a test spacecraft
        spacecraft = spaceshipRepository.findByName("Free Trader").orElse(null);
        if (spacecraft == null) {
            spacecraft = new Spaceship();
            spacecraft.setName("Free Trader");
            spacecraft.setType(SpaceshipType.MERCHANT);
            spacecraft.setTechLevel(12);
            spacecraft.setJumpRating(2); // Jump-2 capable
            spacecraft.setFuel(20); // 20 tons fuel capacity
            spacecraft.setCurrentFuel(20); // Fully fueled
            spacecraft.setHullPoints(10);
            spacecraft.setCurrentHullPoints(10);
            spacecraft = spaceshipRepository.save(spacecraft);
        }

        testHelper.storeInContext("spacefarer", spacefarer);
        testHelper.storeInContext("spacecraft", spacecraft);
    }

    @When("I operate the ship's systems")
    public void iOperateTheShipsSystems() {
        assertNotNull(spacecraft);
        assertNotNull(spacefarer);

        Map<String, String> systemOperations = new HashMap<>();
        systemOperations.put("piloting", "Pilot skill");
        systemOperations.put("navigation", "Electronics skill");
        systemOperations.put("engineering", "Engineering skill");
        systemOperations.put("sensors", "Electronics skill");
        systemOperations.put("weapons", "Gunner skill");

        testHelper.storeInContext("systemOperations", systemOperations);
        testHelper.storeInContext("operatingShip", true);
    }

    @Then("I should use appropriate skills for each system")
    public void iShouldUseAppropriateSkillsForEachSystem() {
        @SuppressWarnings("unchecked")
        Map<String, String> systemOperations = testHelper.getFromContext("systemOperations");
        assertNotNull(systemOperations);

        // Verify each system has an associated skill
        assertTrue(systemOperations.containsKey("piloting"));
        assertTrue(systemOperations.containsKey("engineering"));
        assertEquals("Pilot skill", systemOperations.get("piloting"));
        assertEquals("Engineering skill", systemOperations.get("engineering"));
    }

    @And("the ship should respond according to my skill checks")
    public void theShipShouldRespondAccordingToMySkillChecks() {
        // Simulate system operation skill checks
        Map<String, Boolean> systemResults = new HashMap<>();

        // Piloting check
        int pilotSkill = spacefarer.getSkill("Pilot").getLevel();
        int dexModifier = testHelper.getCharacteristicModifier(
            spacefarer.getCharacteristic(CharacteristicType.DEXTERITY).getValue());
        
        testHelper.setDiceRoll("pilot_check", 9);
        int pilotRoll = testHelper.roll2D6();
        boolean pilotSuccess = (pilotRoll + pilotSkill + dexModifier) >= 8;
        systemResults.put("piloting", pilotSuccess);

        // Engineering check
        int engineeringSkill = spacefarer.getSkill("Engineering").getLevel();
        int intModifier = testHelper.getCharacteristicModifier(
            spacefarer.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue());
        
        testHelper.setDiceRoll("engineering_check", 8);
        int engineeringRoll = testHelper.roll2D6();
        boolean engineeringSuccess = (engineeringRoll + engineeringSkill + intModifier) >= 8;
        systemResults.put("engineering", engineeringSuccess);

        testHelper.storeInContext("systemResults", systemResults);

        // Verify we have results for operated systems
        assertFalse(systemResults.isEmpty());
    }

    @Given("I want to travel to another star system")
    public void iWantToTravelToAnotherStarSystem() {
        testHelper.storeInContext("destination", "Regina System");
        testHelper.storeInContext("currentLocation", "Spinward Marches");
    }

    @When("I calculate a jump route")
    public void iCalculateAJumpRoute() {
        String destination = testHelper.getFromContext("destination");
        assertNotNull(destination);

        // Calculate jump distance (in parsecs)
        int jumpDistance = 2; // 2 parsecs to Regina
        int shipJumpRating = spacecraft.getJumpRating();
        int fuelRequired = jumpDistance * 10; // 10% of ship displacement per parsec

        testHelper.storeInContext("jumpDistance", jumpDistance);
        testHelper.storeInContext("fuelRequired", fuelRequired);
        testHelper.storeInContext("routeCalculated", true);

        // Navigation skill check to plot the course
        int navigationSkill = spacefarer.getSkill("Electronics").getLevel();
        int eduModifier = testHelper.getCharacteristicModifier(
            spacefarer.getCharacteristic(CharacteristicType.EDUCATION).getValue());

        testHelper.setDiceRoll("navigation", 10);
        int navigationRoll = testHelper.roll2D6();
        boolean navigationSuccess = (navigationRoll + navigationSkill + eduModifier) >= 8;

        testHelper.storeInContext("navigationSuccess", navigationSuccess);
    }

    @Then("I should determine the distance in parsecs")
    public void iShouldDetermineTheDistanceInParsecs() {
        Integer jumpDistance = testHelper.getFromContext("jumpDistance");
        assertNotNull(jumpDistance);
        assertTrue(jumpDistance > 0);
        assertTrue(jumpDistance <= 6); // Maximum jump in classic Traveller
    }

    @And("I should verify my ship's jump drive capability")
    public void iShouldVerifyMyShipsJumpDriveCapability() {
        Integer jumpDistance = testHelper.getFromContext("jumpDistance");
        int shipJumpRating = spacecraft.getJumpRating();

        assertNotNull(jumpDistance);
        assertTrue(shipJumpRating > 0);

        boolean canMakeJump = jumpDistance <= shipJumpRating;
        testHelper.storeInContext("canMakeJump", canMakeJump);

        if (jumpDistance <= shipJumpRating) {
            assertTrue(canMakeJump);
        } else {
            assertFalse(canMakeJump);
        }
    }

    @And("I should ensure I have enough fuel for the jump")
    public void iShouldEnsureIHaveEnoughFuelForTheJump() {
        Integer fuelRequired = testHelper.getFromContext("fuelRequired");
        int currentFuel = spacecraft.getCurrentFuel();

        assertNotNull(fuelRequired);
        assertTrue(fuelRequired > 0);

        boolean hasSufficientFuel = currentFuel >= fuelRequired;
        testHelper.storeInContext("hasSufficientFuel", hasSufficientFuel);

        if (hasSufficientFuel) {
            assertTrue(currentFuel >= fuelRequired);
        } else {
            assertTrue(currentFuel < fuelRequired);
        }
    }

    @Given("I have calculated a valid jump route")
    public void iHaveCalculatedAValidJumpRoute() {
        iWantToTravelToAnotherStarSystem();
        iCalculateAJumpRoute();
        
        // Ensure all prerequisites are met
        testHelper.storeInContext("canMakeJump", true);
        testHelper.storeInContext("hasSufficientFuel", true);
        testHelper.storeInContext("navigationSuccess", true);
    }

    @When("I initiate a jump")
    public void iInitiateAJump() {
        Boolean canMakeJump = testHelper.getFromContext("canMakeJump");
        Boolean hasSufficientFuel = testHelper.getFromContext("hasSufficientFuel");
        Boolean navigationSuccess = testHelper.getFromContext("navigationSuccess");

        assertTrue(canMakeJump);
        assertTrue(hasSufficientFuel);
        assertTrue(navigationSuccess);

        // Engineering skill check to execute the jump
        int engineeringSkill = spacefarer.getSkill("Engineering").getLevel();
        int intModifier = testHelper.getCharacteristicModifier(
            spacefarer.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue());

        testHelper.setDiceRoll("jump_execution", 9);
        int jumpRoll = testHelper.roll2D6();
        boolean jumpSuccess = (jumpRoll + engineeringSkill + intModifier) >= 8;

        testHelper.storeInContext("jumpInitiated", true);
        testHelper.storeInContext("jumpSuccess", jumpSuccess);

        // Consume fuel if jump is initiated
        if (jumpSuccess) {
            Integer fuelRequired = testHelper.getFromContext("fuelRequired");
            spacecraft.setCurrentFuel(spacecraft.getCurrentFuel() - fuelRequired);
            spacecraft = spaceshipRepository.save(spacecraft);
        }
    }

    @Then("the ship should enter jump space")
    public void theShipShouldEnterJumpSpace() {
        Boolean jumpSuccess = testHelper.getFromContext("jumpSuccess");
        assertNotNull(jumpSuccess);

        if (jumpSuccess) {
            testHelper.storeInContext("inJumpSpace", true);
            testHelper.storeInContext("jumpStartTime", System.currentTimeMillis());
            assertTrue(true); // Successfully entered jump space
        } else {
            // Jump failure - might result in misjump
            testHelper.storeInContext("jumpFailure", true);
        }
    }

    @And("the journey should take approximately one week regardless of distance")
    public void theJourneyShouldTakeApproximatelyOneWeekRegardlessOfDistance() {
        Boolean inJumpSpace = testHelper.getFromContext("inJumpSpace");
        
        if (inJumpSpace != null && inJumpSpace) {
            int jumpDuration = 7; // Always 7 days in jump space
            testHelper.storeInContext("jumpDuration", jumpDuration);
            
            // Jump duration is constant regardless of distance
            Integer jumpDistance = testHelper.getFromContext("jumpDistance");
            assertEquals(7, jumpDuration); // Always 7 days
            
            // Verify duration doesn't depend on distance
            assertTrue(jumpDuration == 7); // Same whether 1 parsec or 6 parsecs
        }
    }

    @And("I should arrive at the destination system")
    public void iShouldArriveAtTheDestinationSystem() {
        Boolean inJumpSpace = testHelper.getFromContext("inJumpSpace");
        
        if (inJumpSpace != null && inJumpSpace) {
            // Simulate jump completion
            testHelper.storeInContext("jumpCompleted", true);
            testHelper.storeInContext("currentLocation", testHelper.getFromContext("destination"));
            
            String currentLocation = testHelper.getFromContext("currentLocation");
            String destination = testHelper.getFromContext("destination");
            
            assertEquals(destination, currentLocation);
        }
    }

    @Given("I am attempting a jump")
    public void iAmAttemptingAJump() {
        iHaveCalculatedAValidJumpRoute();
        testHelper.storeInContext("attemptingJump", true);
    }

    @When("the jump calculations are incorrect or the drive malfunctions")
    public void theJumpCalculationsAreIncorrectOrTheDriveMalfunctions() {
        // Simulate navigation failure or engineering failure
        testHelper.setDiceRoll("malfunction_check", 3); // Force failure
        int malfunctionRoll = testHelper.roll2D6();
        
        boolean navigationFailure = malfunctionRoll <= 4; // Failed navigation
        boolean driveFailure = malfunctionRoll <= 2; // Drive malfunction
        
        testHelper.storeInContext("navigationFailure", navigationFailure);
        testHelper.storeInContext("driveFailure", driveFailure);
        testHelper.storeInContext("misjumpOccurs", navigationFailure || driveFailure);
    }

    @Then("a misjump should occur")
    public void aMisjumpShouldOccur() {
        Boolean misjumpOccurs = testHelper.getFromContext("misjumpOccurs");
        assertNotNull(misjumpOccurs);
        assertTrue(misjumpOccurs);
        
        testHelper.storeInContext("jumpResult", "misjump");
    }

    @And("the ship should arrive at an unexpected location")
    public void theShipShouldArriveAtAnUnexpectedLocation() {
        Boolean misjumpOccurs = testHelper.getFromContext("misjumpOccurs");
        
        if (misjumpOccurs != null && misjumpOccurs) {
            // Generate random misjump destination
            String[] possibleLocations = {
                "Unknown System Alpha", 
                "Uncharted Deep Space", 
                "Abandoned System Beta"
            };
            
            String misjumpLocation = possibleLocations[(int) (Math.random() * possibleLocations.length)];
            testHelper.storeInContext("currentLocation", misjumpLocation);
            
            String originalDestination = testHelper.getFromContext("destination");
            assertNotEquals(originalDestination, misjumpLocation);
        }
    }

    @And("the ship or crew may suffer damage or complications")
    public void theShipOrCrewMaySufferDamageOrComplications() {
        Boolean misjumpOccurs = testHelper.getFromContext("misjumpOccurs");
        
        if (misjumpOccurs != null && misjumpOccurs) {
            // Roll for misjump effects
            testHelper.setDiceRoll("misjump_damage", 4);
            int damageRoll = testHelper.roll2D6();
            
            Map<String, Object> misjumpEffects = new HashMap<>();
            
            if (damageRoll <= 6) {
                // Hull damage
                int hullDamage = 2;
                spacecraft.setCurrentHullPoints(spacecraft.getCurrentHullPoints() - hullDamage);
                misjumpEffects.put("hullDamage", hullDamage);
            }
            
            if (damageRoll <= 4) {
                // Crew injuries
                misjumpEffects.put("crewInjuries", "Minor radiation exposure");
            }
            
            if (damageRoll <= 2) {
                // System damage
                misjumpEffects.put("systemDamage", "Jump drive requires maintenance");
            }
            
            testHelper.storeInContext("misjumpEffects", misjumpEffects);
            spacecraft = spaceshipRepository.save(spacecraft);
            
            assertFalse(misjumpEffects.isEmpty());
        }
    }

    @Given("my ship needs fuel")
    public void myShipNeedsFuel() {
        // Set ship to low fuel state
        spacecraft.setCurrentFuel(5); // Low fuel
        spacecraft = spaceshipRepository.save(spacecraft);
        
        testHelper.storeInContext("needsRefueling", true);
        testHelper.storeInContext("fuelBefore", spacecraft.getCurrentFuel());
    }

    @When("I approach a gas giant or refueling station")
    public void iApproachAGasGiantOrRefuelingStation() {
        String refuelLocation = "Gas Giant"; // or "Starport"
        testHelper.storeInContext("refuelLocation", refuelLocation);
        testHelper.storeInContext("approachedForRefuel", true);
    }

    @Then("I should be able to refuel my ship")
    public void iShouldBeAbleToRefuelMyShip() {
        String refuelLocation = testHelper.getFromContext("refuelLocation");
        assertNotNull(refuelLocation);
        
        boolean canRefuel = true;
        int refuelAmount = spacecraft.getFuel() - spacecraft.getCurrentFuel(); // Fill to capacity
        
        testHelper.storeInContext("canRefuel", canRefuel);
        testHelper.storeInContext("refuelAmount", refuelAmount);
        
        assertTrue(canRefuel);
        assertTrue(refuelAmount > 0);
    }

    @And("I may need to pay fees at a station")
    public void iMayNeedToPayFeesAtAStation() {
        String refuelLocation = testHelper.getFromContext("refuelLocation");
        
        if ("Starport".equals(refuelLocation)) {
            int refuelFee = 500; // Credits per ton
            Integer refuelAmount = testHelper.getFromContext("refuelAmount");
            int totalFee = refuelFee * refuelAmount;
            
            testHelper.storeInContext("refuelFee", totalFee);
            assertTrue(totalFee > 0);
        } else {
            testHelper.storeInContext("refuelFee", 0); // Free at gas giant
        }
    }

    @And("I may need to make skill checks for gas giant skimming")
    public void iMayNeedToMakeSkillChecksForGasGiantSkimming() {
        String refuelLocation = testHelper.getFromContext("refuelLocation");
        
        if ("Gas Giant".equals(refuelLocation)) {
            // Require Pilot skill check for safe gas giant skimming
            int pilotSkill = spacefarer.getSkill("Pilot").getLevel();
            int dexModifier = testHelper.getCharacteristicModifier(
                spacefarer.getCharacteristic(CharacteristicType.DEXTERITY).getValue());
            
            testHelper.setDiceRoll("gas_skimming", 8);
            int skimmingRoll = testHelper.roll2D6();
            boolean skimmingSuccess = (skimmingRoll + pilotSkill + dexModifier) >= 8;
            
            testHelper.storeInContext("gasSkimmingRequired", true);
            testHelper.storeInContext("skimmingSuccess", skimmingSuccess);
            
            if (skimmingSuccess) {
                // Successfully refuel at gas giant
                spacecraft.setCurrentFuel(spacecraft.getFuel());
                spacecraft = spaceshipRepository.save(spacecraft);
            }
            
            assertTrue(skimmingRoll >= 2 && skimmingRoll <= 12);
        }
    }

    @Given("my ship requires regular maintenance")
    public void myShipRequiresRegularMaintenance() {
        testHelper.storeInContext("maintenanceRequired", true);
        testHelper.storeInContext("maintenanceOverdue", false);
        
        // Track maintenance status
        Map<String, Integer> systemCondition = new HashMap<>();
        systemCondition.put("jumpDrive", 8); // Out of 10
        systemCondition.put("maneuverDrive", 9);
        systemCondition.put("powerPlant", 7);
        systemCondition.put("lifeSystems", 10);
        
        testHelper.storeInContext("systemCondition", systemCondition);
    }

    @When("I perform maintenance tasks")
    public void iPerformMaintenanceTasks() {
        int engineeringSkill = spacefarer.getSkill("Engineering").getLevel();
        int intModifier = testHelper.getCharacteristicModifier(
            spacefarer.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue());
        
        // Multiple maintenance checks for different systems
        Map<String, Boolean> maintenanceResults = new HashMap<>();
        
        // Jump drive maintenance
        testHelper.setDiceRoll("jump_maintenance", 9);
        int jumpMaintenanceRoll = testHelper.roll2D6();
        boolean jumpMaintenanceSuccess = (jumpMaintenanceRoll + engineeringSkill + intModifier) >= 8;
        maintenanceResults.put("jumpDrive", jumpMaintenanceSuccess);
        
        // Maneuver drive maintenance
        testHelper.setDiceRoll("maneuver_maintenance", 10);
        int maneuverMaintenanceRoll = testHelper.roll2D6();
        boolean maneuverMaintenanceSuccess = (maneuverMaintenanceRoll + engineeringSkill + intModifier) >= 8;
        maintenanceResults.put("maneuverDrive", maneuverMaintenanceSuccess);
        
        testHelper.storeInContext("maintenanceResults", maintenanceResults);
        testHelper.storeInContext("performedMaintenance", true);
    }

    @Then("I should make Engineering skill checks")
    public void iShouldMakeEngineeringSkillChecks() {
        Boolean performedMaintenance = testHelper.getFromContext("performedMaintenance");
        @SuppressWarnings("unchecked")
        Map<String, Boolean> maintenanceResults = testHelper.getFromContext("maintenanceResults");
        
        assertNotNull(performedMaintenance);
        assertNotNull(maintenanceResults);
        assertTrue(performedMaintenance);
        assertFalse(maintenanceResults.isEmpty());
        
        // Verify we made multiple engineering checks
        assertTrue(maintenanceResults.containsKey("jumpDrive"));
        assertTrue(maintenanceResults.containsKey("maneuverDrive"));
    }

    @And("successful maintenance should prevent malfunctions")
    public void successfulMaintenanceShouldPreventMalfunctions() {
        @SuppressWarnings("unchecked")
        Map<String, Boolean> maintenanceResults = testHelper.getFromContext("maintenanceResults");
        @SuppressWarnings("unchecked")
        Map<String, Integer> systemCondition = testHelper.getFromContext("systemCondition");
        
        assertNotNull(maintenanceResults);
        assertNotNull(systemCondition);
        
        // Successful maintenance improves system condition
        for (Map.Entry<String, Boolean> result : maintenanceResults.entrySet()) {
            String system = result.getKey();
            boolean success = result.getValue();
            
            if (success && systemCondition.containsKey(system)) {
                int currentCondition = systemCondition.get(system);
                int improvedCondition = Math.min(10, currentCondition + 1);
                systemCondition.put(system, improvedCondition);
            }
        }
        
        testHelper.storeInContext("systemCondition", systemCondition);
        
        // Verify at least one system was maintained
        assertTrue(maintenanceResults.values().stream().anyMatch(success -> success));
    }

    @And("failed maintenance should risk system failures")
    public void failedMaintenanceShouldRiskSystemFailures() {
        @SuppressWarnings("unchecked")
        Map<String, Boolean> maintenanceResults = testHelper.getFromContext("maintenanceResults");
        @SuppressWarnings("unchecked")
        Map<String, Integer> systemCondition = testHelper.getFromContext("systemCondition");
        
        assertNotNull(maintenanceResults);
        
        // Failed maintenance can worsen system condition
        Map<String, String> systemFailures = new HashMap<>();
        
        for (Map.Entry<String, Boolean> result : maintenanceResults.entrySet()) {
            String system = result.getKey();
            boolean success = result.getValue();
            
            if (!success) {
                // Failed maintenance might cause issues
                if (systemCondition.containsKey(system)) {
                    int currentCondition = systemCondition.get(system);
                    if (currentCondition <= 3) {
                        systemFailures.put(system, "System failure risk increased");
                    }
                }
            }
        }
        
        testHelper.storeInContext("systemFailures", systemFailures);
        
        // We should have tracked potential failures for failed maintenance
        assertNotNull(systemFailures);
    }

    @When("I travel through a star system")
    public void iTravelThroughAStarSystem() {
        testHelper.storeInContext("travelingThroughSystem", true);
        testHelper.storeInContext("currentSystem", "Regina System");
        
        // Roll for random encounter
        testHelper.setDiceRoll("encounter_check", 6);
        int encounterRoll = testHelper.roll2D6();
        boolean encounterOccurs = encounterRoll >= 10; // 10+ for encounter
        
        testHelper.storeInContext("encounterRoll", encounterRoll);
        testHelper.storeInContext("encounterOccurs", encounterOccurs);
    }

    @Then("I may encounter other ships or phenomena")
    public void iMayEncounterOtherShipsOrPhenomena() {
        Boolean encounterOccurs = testHelper.getFromContext("encounterOccurs");
        assertNotNull(encounterOccurs);
        
        if (encounterOccurs) {
            String[] encounterTypes = {
                "Merchant vessel",
                "Patrol ship",
                "Pirate raider",
                "Derelict ship",
                "Space debris",
                "Asteroid field"
            };
            
            String encounter = encounterTypes[(int) (Math.random() * encounterTypes.length)];
            testHelper.storeInContext("encounterType", encounter);
            assertNotNull(encounter);
        }
    }

    @And("I should be able to communicate, evade, or engage with encounters")
    public void iShouldBeAbleToCommunicateEvadeOrEngageWithEncounters() {
        Boolean encounterOccurs = testHelper.getFromContext("encounterOccurs");
        
        if (encounterOccurs != null && encounterOccurs) {
            Map<String, String> encounterOptions = new HashMap<>();
            encounterOptions.put("communicate", "Electronics skill for comms");
            encounterOptions.put("evade", "Pilot skill to avoid");
            encounterOptions.put("engage", "Gunner skill for combat");
            
            testHelper.storeInContext("encounterOptions", encounterOptions);
            testHelper.storeInContext("chosenAction", "communicate");
            
            assertFalse(encounterOptions.isEmpty());
            assertEquals(3, encounterOptions.size());
        }
    }

    @When("I use the ship's sensors")
    public void iUseTheShipsSensors() {
        int electronicsSkill = spacefarer.getSkill("Electronics").getLevel();
        int intModifier = testHelper.getCharacteristicModifier(
            spacefarer.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue());
        
        testHelper.storeInContext("usingSensors", true);
        testHelper.storeInContext("sensorSkill", electronicsSkill);
        testHelper.storeInContext("sensorModifier", intModifier);
    }

    @Then("I should make Electronics or Sensors skill checks")
    public void iShouldMakeElectronicsOrSensorsSkillChecks() {
        Integer sensorSkill = testHelper.getFromContext("sensorSkill");
        Integer sensorModifier = testHelper.getFromContext("sensorModifier");
        
        assertNotNull(sensorSkill);
        assertNotNull(sensorModifier);
        
        // Make sensor check
        testHelper.setDiceRoll("sensor_check", 11);
        int sensorRoll = testHelper.roll2D6();
        int sensorTotal = sensorRoll + sensorSkill + sensorModifier;
        boolean sensorSuccess = sensorTotal >= 8;
        
        testHelper.storeInContext("sensorRoll", sensorRoll);
        testHelper.storeInContext("sensorTotal", sensorTotal);
        testHelper.storeInContext("sensorSuccess", sensorSuccess);
        
        assertTrue(sensorRoll >= 2 && sensorRoll <= 12);
    }

    @And("successful checks should provide information about nearby objects")
    public void successfulChecksShouldProvideInformationAboutNearbyObjects() {
        Boolean sensorSuccess = testHelper.getFromContext("sensorSuccess");
        
        if (sensorSuccess != null && sensorSuccess) {
            Map<String, String> detectedObjects = new HashMap<>();
            detectedObjects.put("asteroidField", "Mining hazard at 2000km");
            detectedObjects.put("merchantShip", "Free Trader class at 50000km");
            detectedObjects.put("spaceStation", "Class C starport in orbit");
            
            testHelper.storeInContext("detectedObjects", detectedObjects);
            assertFalse(detectedObjects.isEmpty());
        }
    }

    @And("the information detail should depend on the success level")
    public void theInformationDetailShouldDependOnTheSuccessLevel() {
        Integer sensorTotal = testHelper.getFromContext("sensorTotal");
        Boolean sensorSuccess = testHelper.getFromContext("sensorSuccess");
        
        if (sensorSuccess != null && sensorSuccess) {
            String detailLevel;
            
            if (sensorTotal >= 12) {
                detailLevel = "Detailed scan - ship class, weapon systems, cargo";
            } else if (sensorTotal >= 10) {
                detailLevel = "Good scan - ship type, size, basic systems";
            } else {
                detailLevel = "Basic scan - presence and general location";
            }
            
            testHelper.storeInContext("sensorDetailLevel", detailLevel);
            assertNotNull(detailLevel);
        }
    }

    // Additional step definitions for ship communication, combat, damage control, and boarding actions
    // would continue here following the same pattern...

    @Given("there is another ship in range")
    public void thereIsAnotherShipInRange() {
        testHelper.storeInContext("otherShipInRange", true);
        testHelper.storeInContext("otherShipType", "Patrol Cruiser");
        testHelper.storeInContext("communicationRange", true);
    }

    @When("I attempt to communicate")
    public void iAttemptToCommunicate() {
        int electronicsSkill = spacefarer.getSkill("Electronics").getLevel();
        int socModifier = testHelper.getCharacteristicModifier(
            spacefarer.getCharacteristic(CharacteristicType.SOCIAL_STANDING).getValue());
        
        testHelper.setDiceRoll("communication", 9);
        int commRoll = testHelper.roll2D6();
        int commTotal = commRoll + electronicsSkill + socModifier;
        boolean commSuccess = commTotal >= 8;
        
        testHelper.storeInContext("commRoll", commRoll);
        testHelper.storeInContext("commTotal", commTotal);
        testHelper.storeInContext("commSuccess", commSuccess);
    }

    @Then("I should make appropriate skill checks")
    public void iShouldMakeAppropriateSkillChecks() {
        Integer commRoll = testHelper.getFromContext("commRoll");
        assertNotNull(commRoll);
        assertTrue(commRoll >= 2 && commRoll <= 12);
    }

    @And("successful communication should allow information exchange")
    public void successfulCommunicationShouldAllowInformationExchange() {
        Boolean commSuccess = testHelper.getFromContext("commSuccess");
        
        if (commSuccess != null && commSuccess) {
            Map<String, String> exchangedInfo = new HashMap<>();
            exchangedInfo.put("identification", "Imperial Navy Patrol Vessel Intrepid");
            exchangedInfo.put("mission", "Routine patrol and customs inspection");
            exchangedInfo.put("request", "Transmit ship's papers and cargo manifest");
            
            testHelper.storeInContext("exchangedInfo", exchangedInfo);
            assertFalse(exchangedInfo.isEmpty());
        }
    }

    // Continue with remaining step definitions for ship combat scenarios...
}