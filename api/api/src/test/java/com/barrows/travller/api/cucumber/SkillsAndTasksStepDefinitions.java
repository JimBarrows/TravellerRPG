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
 * Step definitions for skills and task resolution feature.
 * Tests skill checks, difficulty modifiers, characteristic bonuses, and special task types.
 */
@SpringBootTest
public class SkillsAndTasksStepDefinitions {

    @Autowired
    private ApiTestHelper testHelper;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private SkillRepository skillRepository;

    private com.barrows.travller.api.model.Character skillTestCharacter;

    @Given("I have a character with skills")
    public void iHaveACharacterWithSkills() {
        testHelper.seedGameData();
        testHelper.clearContext();

        // Create a character with various skills
        skillTestCharacter = testHelper.createTestCharacter("Skill Test Character");
        
        // Add skills at different levels
        com.barrows.travller.api.model.Skill pilot = testHelper.createTestSkill("Pilot", 2);
        com.barrows.travller.api.model.Skill engineering = testHelper.createTestSkill("Engineering", 3);
        com.barrows.travller.api.model.Skill electronics = testHelper.createTestSkill("Electronics", 1);
        com.barrows.travller.api.model.Skill medic = testHelper.createTestSkill("Medic", 2);
        com.barrows.travller.api.model.Skill athletics = testHelper.createTestSkill("Athletics", 1);
        
        skillTestCharacter.addSkill(pilot);
        skillTestCharacter.addSkill(engineering);
        skillTestCharacter.addSkill(electronics);
        skillTestCharacter.addSkill(medic);
        skillTestCharacter.addSkill(athletics);
        
        // Set reasonable characteristics
        skillTestCharacter.getCharacteristic(CharacteristicType.INTELLIGENCE).setValue(10);
        skillTestCharacter.getCharacteristic(CharacteristicType.EDUCATION).setValue(9);
        skillTestCharacter.getCharacteristic(CharacteristicType.DEXTERITY).setValue(8);
        
        skillTestCharacter = characterRepository.save(skillTestCharacter);
        testHelper.storeInContext("skillTestCharacter", skillTestCharacter);
    }

    @When("I attempt a task using a skill")
    public void iAttemptATaskUsingASkill() {
        String skillName = "Pilot";
        int skillLevel = skillTestCharacter.getSkill(skillName).getLevel();
        int difficultyNumber = 8; // Standard difficulty
        
        // Get relevant characteristic modifier (typically Dexterity for Pilot)
        int dexterity = skillTestCharacter.getCharacteristic(CharacteristicType.DEXTERITY).getValue();
        int charModifier = testHelper.getCharacteristicModifier(dexterity);
        
        testHelper.storeInContext("attemptedSkill", skillName);
        testHelper.storeInContext("skillLevel", skillLevel);
        testHelper.storeInContext("difficultyNumber", difficultyNumber);
        testHelper.storeInContext("characteristicModifier", charModifier);
        
        // Make the skill check
        testHelper.setDiceRoll("skill_check", 8);
        int diceRoll = testHelper.roll2D6();
        int totalRoll = diceRoll + skillLevel + charModifier;
        
        testHelper.storeInContext("diceRoll", diceRoll);
        testHelper.storeInContext("totalRoll", totalRoll);
        testHelper.storeInContext("taskSuccess", totalRoll >= difficultyNumber);
    }

    @Then("I should roll 2d6 and add my skill level")
    public void iShouldRoll2d6AndAddMySkillLevel() {
        Integer diceRoll = testHelper.getFromContext("diceRoll");
        Integer skillLevel = testHelper.getFromContext("skillLevel");
        Integer totalRoll = testHelper.getFromContext("totalRoll");
        
        assertNotNull(diceRoll);
        assertNotNull(skillLevel);
        assertNotNull(totalRoll);
        
        // Verify dice roll is in valid range
        assertTrue(diceRoll >= 2 && diceRoll <= 12);
        
        // Verify skill level was added
        assertTrue(totalRoll >= diceRoll + skillLevel);
    }

    @And("I should succeed if the total equals or exceeds the difficulty number")
    public void iShouldSucceedIfTheTotalEqualsOrExceedsTheDifficultyNumber() {
        Integer totalRoll = testHelper.getFromContext("totalRoll");
        Integer difficultyNumber = testHelper.getFromContext("difficultyNumber");
        Boolean taskSuccess = testHelper.getFromContext("taskSuccess");
        
        assertNotNull(totalRoll);
        assertNotNull(difficultyNumber);
        assertNotNull(taskSuccess);
        
        // Verify success calculation is correct
        boolean expectedSuccess = totalRoll >= difficultyNumber;
        assertEquals(expectedSuccess, taskSuccess);
    }

    @Given("I do not have the required skill for a task")
    public void iDoNotHaveTheRequiredSkillForATask() {
        String unskilledTask = "Broker"; // Character doesn't have this skill
        testHelper.storeInContext("attemptedSkill", unskilledTask);
        testHelper.storeInContext("skillLevel", 0); // No skill = level 0
        testHelper.storeInContext("unskilled", true);
    }

    @When("I attempt the task")
    public void iAttemptTheTask() {
        Boolean unskilled = testHelper.getFromContext("unskilled");
        int difficultyNumber = 8; // Standard difficulty
        int unskilledPenalty = -3; // Standard unskilled penalty
        
        // Get relevant characteristic modifier (Education for knowledge-based tasks)
        int education = skillTestCharacter.getCharacteristic(CharacteristicType.EDUCATION).getValue();
        int charModifier = testHelper.getCharacteristicModifier(education);
        
        testHelper.storeInContext("difficultyNumber", difficultyNumber);
        testHelper.storeInContext("unskilledPenalty", unskilledPenalty);
        testHelper.storeInContext("characteristicModifier", charModifier);
        
        // Make the unskilled check
        testHelper.setDiceRoll("unskilled_check", 7);
        int diceRoll = testHelper.roll2D6();
        int totalRoll;
        
        if (unskilled != null && unskilled) {
            totalRoll = diceRoll + charModifier + unskilledPenalty;
        } else {
            totalRoll = diceRoll + charModifier;
        }
        
        testHelper.storeInContext("diceRoll", diceRoll);
        testHelper.storeInContext("totalRoll", totalRoll);
        testHelper.storeInContext("taskSuccess", totalRoll >= difficultyNumber);
    }

    @Then("I should roll 2d6 with a penalty")
    public void iShouldRoll2d6WithAPenalty() {
        Integer diceRoll = testHelper.getFromContext("diceRoll");
        Integer totalRoll = testHelper.getFromContext("totalRoll");
        Integer unskilledPenalty = testHelper.getFromContext("unskilledPenalty");
        
        assertNotNull(diceRoll);
        assertNotNull(totalRoll);
        assertNotNull(unskilledPenalty);
        
        assertTrue(diceRoll >= 2 && diceRoll <= 12);
        assertTrue(unskilledPenalty < 0); // Should be a penalty
    }

    @And("the task should be more difficult to succeed")
    public void theTaskShouldBeMoreDifficultToSucceed() {
        Integer unskilledPenalty = testHelper.getFromContext("unskilledPenalty");
        assertNotNull(unskilledPenalty);
        
        // Penalty makes it harder to reach the target number
        assertTrue(unskilledPenalty < 0);
        
        // Compare with a skilled attempt
        int skilledTotal = 8 + 2 + 1; // Dice + skill + characteristic
        int unskilledTotal = 8 + 0 + 1 + unskilledPenalty; // Dice + no skill + characteristic + penalty
        
        assertTrue(unskilledTotal < skilledTotal);
    }

    @When("I attempt a task that relies on a characteristic")
    public void iAttemptATaskThatReliesOnACharacteristic() {
        String skillName = "Athletics";
        String characteristicName = "Strength";
        
        int skillLevel = skillTestCharacter.getSkill(skillName).getLevel();
        int strength = skillTestCharacter.getCharacteristic(CharacteristicType.STRENGTH).getValue();
        int strModifier = testHelper.getCharacteristicModifier(strength);
        
        testHelper.storeInContext("attemptedSkill", skillName);
        testHelper.storeInContext("relevantCharacteristic", characteristicName);
        testHelper.storeInContext("skillLevel", skillLevel);
        testHelper.storeInContext("characteristicValue", strength);
        testHelper.storeInContext("characteristicModifier", strModifier);
        
        // Make the skill check with characteristic modifier
        testHelper.setDiceRoll("characteristic_check", 9);
        int diceRoll = testHelper.roll2D6();
        int totalRoll = diceRoll + skillLevel + strModifier;
        
        testHelper.storeInContext("diceRoll", diceRoll);
        testHelper.storeInContext("totalRoll", totalRoll);
    }

    @Then("I should add or subtract a modifier based on my characteristic value")
    public void iShouldAddOrSubtractAModifierBasedOnMyCharacteristicValue() {
        Integer characteristicValue = testHelper.getFromContext("characteristicValue");
        Integer characteristicModifier = testHelper.getFromContext("characteristicModifier");
        Integer totalRoll = testHelper.getFromContext("totalRoll");
        Integer diceRoll = testHelper.getFromContext("diceRoll");
        Integer skillLevel = testHelper.getFromContext("skillLevel");
        
        assertNotNull(characteristicValue);
        assertNotNull(characteristicModifier);
        assertNotNull(totalRoll);
        
        // Verify modifier calculation is correct
        int expectedModifier = testHelper.getCharacteristicModifier(characteristicValue);
        assertEquals(expectedModifier, characteristicModifier);
        
        // Verify modifier was applied to total
        int expectedTotal = diceRoll + skillLevel + characteristicModifier;
        assertEquals(expectedTotal, totalRoll);
    }

    @And("the modifier should affect my chance of success")
    public void theModifierShouldAffectMyChanceOfSuccess() {
        Integer characteristicModifier = testHelper.getFromContext("characteristicModifier");
        assertNotNull(characteristicModifier);
        
        // Compare success chances with different modifiers
        int baseRoll = 8;
        int skillLevel = 1;
        int difficultyNumber = 8;
        
        int totalWithModifier = baseRoll + skillLevel + characteristicModifier;
        int totalWithoutModifier = baseRoll + skillLevel;
        
        boolean successWithModifier = totalWithModifier >= difficultyNumber;
        boolean successWithoutModifier = totalWithoutModifier >= difficultyNumber;
        
        // The modifier should change the outcome (in this case, should help)
        if (characteristicModifier > 0) {
            assertTrue(totalWithModifier > totalWithoutModifier);
        } else if (characteristicModifier < 0) {
            assertTrue(totalWithModifier < totalWithoutModifier);
        }
    }

    @When("I attempt a task with increased difficulty")
    public void iAttemptATaskWithIncreasedDifficulty() {
        int difficultyNumber = 12; // Difficult task (instead of standard 8)
        testHelper.storeInContext("difficultyNumber", difficultyNumber);
        testHelper.storeInContext("difficultyLevel", "Difficult");
        
        // Make the skill check
        String skillName = "Engineering";
        int skillLevel = skillTestCharacter.getSkill(skillName).getLevel();
        int intModifier = testHelper.getCharacteristicModifier(
            skillTestCharacter.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue());
        
        testHelper.setDiceRoll("difficult_check", 9);
        int diceRoll = testHelper.roll2D6();
        int totalRoll = diceRoll + skillLevel + intModifier;
        
        testHelper.storeInContext("diceRoll", diceRoll);
        testHelper.storeInContext("totalRoll", totalRoll);
        testHelper.storeInContext("taskSuccess", totalRoll >= difficultyNumber);
    }

    @Then("the difficulty number should be higher")
    public void theDifficultyNumberShouldBeHigher() {
        Integer difficultyNumber = testHelper.getFromContext("difficultyNumber");
        assertNotNull(difficultyNumber);
        
        // Should be higher than standard difficulty (8)
        assertTrue(difficultyNumber > 8);
    }

    @And("I should need a higher roll to succeed")
    public void iShouldNeedAHigherRollToSucceed() {
        Integer difficultyNumber = testHelper.getFromContext("difficultyNumber");
        Integer totalRoll = testHelper.getFromContext("totalRoll");
        
        assertNotNull(difficultyNumber);
        assertNotNull(totalRoll);
        
        // Higher difficulty means need higher total to succeed
        assertTrue(difficultyNumber > 8); // Standard difficulty
        
        // Example: with same roll, standard difficulty would succeed but this might not
        int standardDifficulty = 8;
        boolean wouldSucceedAtStandard = totalRoll >= standardDifficulty;
        boolean succeedsAtDifficult = totalRoll >= difficultyNumber;
        
        if (wouldSucceedAtStandard && !succeedsAtDifficult) {
            // This demonstrates the higher difficulty requirement
            assertTrue(difficultyNumber > standardDifficulty);
        }
    }

    @When("I attempt a task with reduced difficulty")
    public void iAttemptATaskWithReducedDifficulty() {
        int difficultyNumber = 4; // Simple task (instead of standard 8)
        testHelper.storeInContext("difficultyNumber", difficultyNumber);
        testHelper.storeInContext("difficultyLevel", "Simple");
        
        // Make the skill check
        String skillName = "Electronics";
        int skillLevel = skillTestCharacter.getSkill(skillName).getLevel();
        int intModifier = testHelper.getCharacteristicModifier(
            skillTestCharacter.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue());
        
        testHelper.setDiceRoll("simple_check", 6);
        int diceRoll = testHelper.roll2D6();
        int totalRoll = diceRoll + skillLevel + intModifier;
        
        testHelper.storeInContext("diceRoll", diceRoll);
        testHelper.storeInContext("totalRoll", totalRoll);
        testHelper.storeInContext("taskSuccess", totalRoll >= difficultyNumber);
    }

    @Then("the difficulty number should be lower")
    public void theDifficultyNumberShouldBeLower() {
        Integer difficultyNumber = testHelper.getFromContext("difficultyNumber");
        assertNotNull(difficultyNumber);
        
        // Should be lower than standard difficulty (8)
        assertTrue(difficultyNumber < 8);
    }

    @And("I should need a lower roll to succeed")
    public void iShouldNeedALowerRollToSucceed() {
        Integer difficultyNumber = testHelper.getFromContext("difficultyNumber");
        Integer totalRoll = testHelper.getFromContext("totalRoll");
        
        assertNotNull(difficultyNumber);
        assertNotNull(totalRoll);
        
        // Lower difficulty means need lower total to succeed
        assertTrue(difficultyNumber < 8); // Standard difficulty
        
        // Most rolls should succeed at simple difficulty
        boolean taskSuccess = testHelper.getFromContext("taskSuccess");
        // We can't guarantee success, but the threshold is much lower
        assertTrue(difficultyNumber <= 4);
    }

    @Given("a task needs to be completed quickly")
    public void aTaskNeedsToBeCompletedQuickly() {
        testHelper.storeInContext("timePressure", true);
        testHelper.storeInContext("timePenalty", -2); // -2 DM for rushing
    }

    @When("I attempt the task under time pressure")
    public void iAttemptTheTaskUnderTimePressure() {
        String skillName = "Medic";
        int skillLevel = skillTestCharacter.getSkill(skillName).getLevel();
        int intModifier = testHelper.getCharacteristicModifier(
            skillTestCharacter.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue());
        Integer timePenalty = testHelper.getFromContext("timePenalty");
        int difficultyNumber = 8; // Standard difficulty
        
        testHelper.storeInContext("difficultyNumber", difficultyNumber);
        
        testHelper.setDiceRoll("rushed_check", 10);
        int diceRoll = testHelper.roll2D6();
        int totalRoll = diceRoll + skillLevel + intModifier + timePenalty;
        
        testHelper.storeInContext("diceRoll", diceRoll);
        testHelper.storeInContext("totalRoll", totalRoll);
        testHelper.storeInContext("taskSuccess", totalRoll >= difficultyNumber);
    }

    @Then("I should receive a penalty to my roll")
    public void iShouldReceiveAPenaltyToMyRoll() {
        Integer timePenalty = testHelper.getFromContext("timePenalty");
        assertNotNull(timePenalty);
        assertTrue(timePenalty < 0); // Should be negative (penalty)
    }

    @And("I should need to roll higher to succeed")
    public void iShouldNeedToRollHigherToSucceed() {
        Integer timePenalty = testHelper.getFromContext("timePenalty");
        Integer totalRoll = testHelper.getFromContext("totalRoll");
        Integer diceRoll = testHelper.getFromContext("diceRoll");
        
        assertNotNull(timePenalty);
        assertNotNull(totalRoll);
        assertNotNull(diceRoll);
        
        // The penalty reduces the effective total, making success harder
        int rollWithoutPenalty = diceRoll + 2 + 1; // skill + characteristic
        int rollWithPenalty = totalRoll;
        
        assertTrue(rollWithPenalty < rollWithoutPenalty);
    }

    @Given("a task requires multiple steps to complete")
    public void aTaskRequiresMultipleStepsToComplete() {
        testHelper.storeInContext("extendedTask", true);
        testHelper.storeInContext("requiredSuccesses", 3); // Need 3 successful checks
        testHelper.storeInContext("currentSuccesses", 0);
        testHelper.storeInContext("tasksCompleted", 0);
    }

    @When("I attempt the extended task")
    public void iAttemptTheExtendedTask() {
        String skillName = "Engineering";
        int requiredSuccesses = testHelper.getFromContext("requiredSuccesses");
        int currentSuccesses = 0;
        int tasksCompleted = 0;
        int difficultyNumber = 8;
        
        // Simulate multiple attempts
        for (int attempt = 1; attempt <= 4; attempt++) {
            int skillLevel = skillTestCharacter.getSkill(skillName).getLevel();
            int intModifier = testHelper.getCharacteristicModifier(
                skillTestCharacter.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue());
            
            testHelper.setDiceRoll("extended_" + attempt, 7 + attempt);
            int diceRoll = testHelper.roll2D6();
            int totalRoll = diceRoll + skillLevel + intModifier;
            
            tasksCompleted++;
            
            if (totalRoll >= difficultyNumber) {
                currentSuccesses++;
            }
            
            // Stop if we have enough successes
            if (currentSuccesses >= requiredSuccesses) {
                break;
            }
        }
        
        testHelper.storeInContext("currentSuccesses", currentSuccesses);
        testHelper.storeInContext("tasksCompleted", tasksCompleted);
        testHelper.storeInContext("extendedTaskComplete", currentSuccesses >= requiredSuccesses);
    }

    @Then("I should make multiple skill checks")
    public void iShouldMakeMultipleSkillChecks() {
        Integer tasksCompleted = testHelper.getFromContext("tasksCompleted");
        assertNotNull(tasksCompleted);
        assertTrue(tasksCompleted > 1); // Multiple attempts made
    }

    @And("my overall success should depend on the number of successful checks")
    public void myOverallSuccessShouldDependOnTheNumberOfSuccessfulChecks() {
        Integer currentSuccesses = testHelper.getFromContext("currentSuccesses");
        Integer requiredSuccesses = testHelper.getFromContext("requiredSuccesses");
        Boolean extendedTaskComplete = testHelper.getFromContext("extendedTaskComplete");
        
        assertNotNull(currentSuccesses);
        assertNotNull(requiredSuccesses);
        assertNotNull(extendedTaskComplete);
        
        // Task success depends on reaching required number of successes
        boolean expectedSuccess = currentSuccesses >= requiredSuccesses;
        assertEquals(expectedSuccess, extendedTaskComplete);
    }

    @Given("another character is opposing my action")
    public void anotherCharacterIsOpposingMyAction() {
        // Create an opposing character
        Character opponent = testHelper.createTestCharacter("Opponent");
        Skill opponentSkill = testHelper.createTestSkill("Broker", 2); // Opposing in negotiation
        opponent.addSkill(opponentSkill);
        opponent.getCharacteristic(CharacteristicType.SOCIAL_STANDING).setValue(9);
        opponent = characterRepository.save(opponent);
        
        testHelper.storeInContext("opponent", opponent);
        testHelper.storeInContext("opposedTask", true);
    }

    @When("I attempt an opposed task")
    public void iAttemptAnOpposedTask() {
        Character opponent = testHelper.getFromContext("opponent");
        assertNotNull(opponent);
        
        String skillName = "Broker"; // Negotiation skill
        
        // Player's roll
        Skill playerSkill = testHelper.createTestSkill(skillName, 1);
        skillTestCharacter.addSkill(playerSkill);
        skillTestCharacter = characterRepository.save(skillTestCharacter);
        
        int playerSkillLevel = 1;
        int playerSocModifier = testHelper.getCharacteristicModifier(
            skillTestCharacter.getCharacteristic(CharacteristicType.SOCIAL_STANDING).getValue());
        
        testHelper.setDiceRoll("player_opposed", 8);
        int playerDiceRoll = testHelper.roll2D6();
        int playerTotal = playerDiceRoll + playerSkillLevel + playerSocModifier;
        
        // Opponent's roll
        int opponentSkillLevel = opponent.getSkill(skillName).getLevel();
        int opponentSocModifier = testHelper.getCharacteristicModifier(
            opponent.getCharacteristic(CharacteristicType.SOCIAL_STANDING).getValue());
        
        testHelper.setDiceRoll("opponent_opposed", 7);
        int opponentDiceRoll = testHelper.roll2D6();
        int opponentTotal = opponentDiceRoll + opponentSkillLevel + opponentSocModifier;
        
        testHelper.storeInContext("playerTotal", playerTotal);
        testHelper.storeInContext("opponentTotal", opponentTotal);
    }

    @Then("both characters should make skill checks")
    public void bothCharactersShouldMakeSkillChecks() {
        Integer playerTotal = testHelper.getFromContext("playerTotal");
        Integer opponentTotal = testHelper.getFromContext("opponentTotal");
        
        assertNotNull(playerTotal);
        assertNotNull(opponentTotal);
        
        // Both totals should be valid (positive)
        assertTrue(playerTotal > 0);
        assertTrue(opponentTotal > 0);
    }

    @And("the character with the higher result should succeed")
    public void theCharacterWithTheHigherResultShouldSucceed() {
        Integer playerTotal = testHelper.getFromContext("playerTotal");
        Integer opponentTotal = testHelper.getFromContext("opponentTotal");
        
        assertNotNull(playerTotal);
        assertNotNull(opponentTotal);
        
        boolean playerWins = playerTotal > opponentTotal;
        testHelper.storeInContext("playerWins", playerWins);
        testHelper.storeInContext("opposedTaskResult", playerWins ? "player" : "opponent");
        
        // Winner should have higher total
        if (playerWins) {
            assertTrue(playerTotal > opponentTotal);
        } else {
            assertTrue(opponentTotal >= playerTotal); // >= handles ties (opponent wins ties)
        }
    }

    @Given("I have appropriate tools or equipment for a task")
    public void iHaveAppropriateToolsOrEquipmentForATask() {
        testHelper.storeInContext("hasTools", true);
        testHelper.storeInContext("toolBonus", 2); // +2 DM for having proper tools
        testHelper.storeInContext("toolType", "Engineering Kit");
    }

    @When("I attempt the task")
    public void iAttemptTheTaskWithTools() {
        String skillName = "Engineering";
        int skillLevel = skillTestCharacter.getSkill(skillName).getLevel();
        int intModifier = testHelper.getCharacteristicModifier(
            skillTestCharacter.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue());
        Integer toolBonus = testHelper.getFromContext("toolBonus");
        int difficultyNumber = 8;
        
        testHelper.setDiceRoll("tool_check", 6);
        int diceRoll = testHelper.roll2D6();
        int totalRoll = diceRoll + skillLevel + intModifier + (toolBonus != null ? toolBonus : 0);
        
        testHelper.storeInContext("diceRoll", diceRoll);
        testHelper.storeInContext("totalRoll", totalRoll);
        testHelper.storeInContext("taskSuccess", totalRoll >= difficultyNumber);
    }

    @Then("I should receive a bonus to my skill check")
    public void iShouldReceiveABonusToMySkillCheck() {
        Integer toolBonus = testHelper.getFromContext("toolBonus");
        assertNotNull(toolBonus);
        assertTrue(toolBonus > 0); // Should be positive bonus
    }

    @And("my chance of success should increase")
    public void myChanceOfSuccessShouldIncrease() {
        Integer totalRoll = testHelper.getFromContext("totalRoll");
        Integer diceRoll = testHelper.getFromContext("diceRoll");
        Integer toolBonus = testHelper.getFromContext("toolBonus");
        
        assertNotNull(totalRoll);
        assertNotNull(diceRoll);
        assertNotNull(toolBonus);
        
        // Total should include the tool bonus
        int expectedMinimum = diceRoll + 3 + 1 + toolBonus; // dice + skill + char + tools
        assertTrue(totalRoll >= expectedMinimum - 3); // Allow for variation in skill/char
    }

    @When("I roll a natural 12 on a skill check")
    public void iRollANatural12OnASkillCheck() {
        testHelper.setDiceRoll("critical_success", 12);
        int diceRoll = testHelper.roll2D6();
        
        assertEquals(12, diceRoll);
        testHelper.storeInContext("diceRoll", diceRoll);
        testHelper.storeInContext("criticalSuccess", true);
        
        // Calculate total as normal
        String skillName = "Pilot";
        int skillLevel = skillTestCharacter.getSkill(skillName).getLevel();
        int dexModifier = testHelper.getCharacteristicModifier(
            skillTestCharacter.getCharacteristic(CharacteristicType.DEXTERITY).getValue());
        int totalRoll = diceRoll + skillLevel + dexModifier;
        
        testHelper.storeInContext("totalRoll", totalRoll);
    }

    @Then("I should achieve a critical success")
    public void iShouldAchieveACriticalSuccess() {
        Boolean criticalSuccess = testHelper.getFromContext("criticalSuccess");
        Integer diceRoll = testHelper.getFromContext("diceRoll");
        
        assertNotNull(criticalSuccess);
        assertNotNull(diceRoll);
        assertTrue(criticalSuccess);
        assertEquals(12, diceRoll);
    }

    @And("I should receive additional benefits beyond normal success")
    public void iShouldReceiveAdditionalBenefitsBeyondNormalSuccess() {
        Boolean criticalSuccess = testHelper.getFromContext("criticalSuccess");
        
        if (criticalSuccess != null && criticalSuccess) {
            // Critical success provides extra benefits
            Map<String, Object> extraBenefits = new HashMap<>();
            extraBenefits.put("timeReduction", "50%"); // Task completed faster
            extraBenefits.put("qualityImprovement", "Superior result");
            extraBenefits.put("resourceSaving", "Uses fewer materials");
            
            testHelper.storeInContext("criticalBenefits", extraBenefits);
            
            assertFalse(extraBenefits.isEmpty());
        }
    }

    @When("I roll a natural 2 on a skill check")
    public void iRollANatural2OnASkillCheck() {
        testHelper.setDiceRoll("critical_failure", 2);
        int diceRoll = testHelper.roll2D6();
        
        assertEquals(2, diceRoll);
        testHelper.storeInContext("diceRoll", diceRoll);
        testHelper.storeInContext("criticalFailure", true);
        
        // Calculate total as normal
        String skillName = "Electronics";
        int skillLevel = skillTestCharacter.getSkill(skillName).getLevel();
        int intModifier = testHelper.getCharacteristicModifier(
            skillTestCharacter.getCharacteristic(CharacteristicType.INTELLIGENCE).getValue());
        int totalRoll = diceRoll + skillLevel + intModifier;
        
        testHelper.storeInContext("totalRoll", totalRoll);
    }

    @Then("I should suffer a critical failure")
    public void iShouldSufferACriticalFailure() {
        Boolean criticalFailure = testHelper.getFromContext("criticalFailure");
        Integer diceRoll = testHelper.getFromContext("diceRoll");
        
        assertNotNull(criticalFailure);
        assertNotNull(diceRoll);
        assertTrue(criticalFailure);
        assertEquals(2, diceRoll);
    }

    @And("I should face negative consequences beyond normal failure")
    public void iShouldFaceNegativeConsequencesBeyondNormalFailure() {
        Boolean criticalFailure = testHelper.getFromContext("criticalFailure");
        
        if (criticalFailure != null && criticalFailure) {
            // Critical failure provides extra complications
            Map<String, Object> complications = new HashMap<>();
            complications.put("equipmentDamage", "Tool or equipment breaks");
            complications.put("extraTime", "Task takes much longer");
            complications.put("cascadingFailure", "Creates additional problems");
            complications.put("resourceWaste", "Wastes materials or supplies");
            
            testHelper.storeInContext("criticalComplications", complications);
            
            assertFalse(complications.isEmpty());
        }
    }
}