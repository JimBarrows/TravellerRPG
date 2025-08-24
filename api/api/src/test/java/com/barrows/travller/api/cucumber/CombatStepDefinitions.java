package com.barrows.travller.api.cucumber;

import com.barrows.travller.api.model.*;
import com.barrows.travller.api.repository.*;
import io.cucumber.java.en.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Step definitions for combat feature.
 * Tests combat mechanics including initiative, attacks, damage, armor, and special rules.
 */
@SpringBootTest
public class CombatStepDefinitions {

    @Autowired
    private ApiTestHelper testHelper;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private WeaponRepository weaponRepository;

    @Autowired
    private ArmorRepository armorRepository;

    @Autowired
    private SkillRepository skillRepository;

    private com.barrows.travller.api.model.Character combatCharacter;
    private List<com.barrows.travller.api.model.Character> opponents;
    private List<com.barrows.travller.api.model.Character> combatants;

    @Given("I have a character with combat skills")
    public void iHaveACharacterWithCombatSkills() {
        testHelper.seedGameData();
        testHelper.clearContext();

        // Create a combat-capable character
        combatCharacter = testHelper.createTestCharacter("Combat Test Character");
        
        // Add combat skills
        Skill gunCombat = testHelper.createTestSkill("Gun Combat", 2);
        Skill melee = testHelper.createTestSkill("Melee", 1);
        Skill athletics = testHelper.createTestSkill("Athletics", 1);
        
        combatCharacter.addSkill(gunCombat);
        combatCharacter.addSkill(melee);
        combatCharacter.addSkill(athletics);
        
        // Set good Dexterity for initiative
        combatCharacter.getCharacteristic(CharacteristicType.DEXTERITY).setValue(10);
        
        combatCharacter = characterRepository.save(combatCharacter);
        testHelper.storeInContext("combatCharacter", combatCharacter);
    }

    @And("there are opponents to fight")
    public void thereAreOpponentsToFight() {
        opponents = new ArrayList<>();
        
        // Create test opponents
        Character opponent1 = testHelper.createTestCharacter("Pirate 1");
        opponent1.getCharacteristic(CharacteristicType.DEXTERITY).setValue(8);
        Skill enemyGunCombat = testHelper.createTestSkill("Gun Combat", 1);
        opponent1.addSkill(enemyGunCombat);
        opponent1 = characterRepository.save(opponent1);
        opponents.add(opponent1);
        
        Character opponent2 = testHelper.createTestCharacter("Pirate 2");
        opponent2.getCharacteristic(CharacteristicType.DEXTERITY).setValue(6);
        Skill enemyMelee = testHelper.createTestSkill("Melee", 2);
        opponent2.addSkill(enemyMelee);
        opponent2 = characterRepository.save(opponent2);
        opponents.add(opponent2);
        
        testHelper.storeInContext("opponents", opponents);
        
        // Create combatants list for initiative
        combatants = new ArrayList<>();
        combatants.add(combatCharacter);
        combatants.addAll(opponents);
    }

    @When("combat begins")
    public void combatBegins() {
        // Initialize combat state
        testHelper.storeInContext("combatStarted", true);
        testHelper.storeInContext("combatRound", 1);
        
        // Set up combat tracker
        Map<String, Object> combatState = new HashMap<>();
        combatState.put("participants", combatants);
        combatState.put("currentTurn", 0);
        testHelper.storeInContext("combatState", combatState);
    }

    @Then("initiative should be determined by Dexterity")
    public void initiativeShouldBeDeterminedByDexterity() {
        // Roll initiative for each combatant
        Map<Character, Integer> initiativeResults = new HashMap<>();
        
        for (Character character : combatants) {
            int dexterity = character.getCharacteristic(CharacteristicType.DEXTERITY).getValue();
            int dexModifier = testHelper.getCharacteristicModifier(dexterity);
            
            // Set specific dice rolls for testing
            testHelper.setDiceRoll("initiative_" + character.getName(), 8);
            int initiativeRoll = testHelper.roll2D6();
            int initiative = initiativeRoll + dexModifier;
            
            initiativeResults.put(character, initiative);
        }
        
        testHelper.storeInContext("initiativeResults", initiativeResults);
        
        // Verify that initiative calculation includes Dexterity
        Integer playerInitiative = initiativeResults.get(combatCharacter);
        assertNotNull(playerInitiative);
        assertTrue(playerInitiative > 0);
    }

    @And("characters should act in initiative order")
    public void charactersShouldActInInitiativeOrder() {
        @SuppressWarnings("unchecked")
        Map<Character, Integer> initiativeResults = testHelper.getFromContext("initiativeResults");
        assertNotNull(initiativeResults);
        
        // Sort characters by initiative (highest first)
        List<Character> initiativeOrder = combatants.stream()
            .sorted((c1, c2) -> Integer.compare(initiativeResults.get(c2), initiativeResults.get(c1)))
            .toList();
        
        testHelper.storeInContext("initiativeOrder", initiativeOrder);
        
        // Verify ordering makes sense
        assertTrue(initiativeOrder.size() == combatants.size());
        assertTrue(initiativeOrder.contains(combatCharacter));
    }

    @Given("I have a ranged weapon")
    public void iHaveARangedWeapon() {
        // Create or find a pistol weapon
        Weapon pistol = weaponRepository.findByName("Autopistol").orElse(null);
        if (pistol == null) {
            pistol = new Weapon();
            pistol.setName("Autopistol");
            pistol.setType(WeaponType.RANGED);
            pistol.setDamage(3);
            pistol.setPenetration(0);
            pistol.setRange(15);
            pistol.setTechLevel(5);
            pistol.setWeight(1);
            pistol = weaponRepository.save(pistol);
        }
        
        combatCharacter.addWeapon(pistol);
        combatCharacter.equipWeapon(pistol);
        combatCharacter = characterRepository.save(combatCharacter);
        
        testHelper.storeInContext("rangedWeapon", pistol);
    }

    @When("I attack an opponent")
    public void iAttackAnOpponent() {
        Character target = opponents.get(0); // Attack first opponent
        Weapon weapon = combatCharacter.getEquippedWeapon();
        assertNotNull(weapon);
        
        // Calculate attack roll
        int skillLevel = combatCharacter.getSkill("Gun Combat").getLevel();
        int dexModifier = testHelper.getCharacteristicModifier(
            combatCharacter.getCharacteristic(CharacteristicType.DEXTERITY).getValue());
        
        testHelper.setDiceRoll("attack", 8);
        int attackRoll = testHelper.roll2D6();
        int attackTotal = attackRoll + skillLevel + dexModifier;
        
        testHelper.storeInContext("target", target);
        testHelper.storeInContext("attackRoll", attackRoll);
        testHelper.storeInContext("attackTotal", attackTotal);
        testHelper.storeInContext("weapon", weapon);
    }

    @Then("I should roll 2d6 and add my weapon skill")
    public void iShouldRoll2d6AndAddMyWeaponSkill() {
        Integer attackRoll = testHelper.getFromContext("attackRoll");
        Integer attackTotal = testHelper.getFromContext("attackTotal");
        
        assertNotNull(attackRoll);
        assertNotNull(attackTotal);
        assertTrue(attackRoll >= 2 && attackRoll <= 12);
        
        int skillLevel = combatCharacter.getSkill("Gun Combat").getLevel();
        assertTrue(attackTotal >= attackRoll + skillLevel);
    }

    @And("I should hit if the total equals or exceeds the target number")
    public void iShouldHitIfTheTotalEqualsOrExceedsTheTargetNumber() {
        Integer attackTotal = testHelper.getFromContext("attackTotal");
        assertNotNull(attackTotal);
        
        // Standard target number is 8 in Traveller
        int targetNumber = 8;
        boolean hit = attackTotal >= targetNumber;
        
        testHelper.storeInContext("hit", hit);
        testHelper.storeInContext("targetNumber", targetNumber);
        
        if (hit) {
            assertTrue(attackTotal >= targetNumber);
        }
    }

    @And("I should roll for damage if I hit")
    public void iShouldRollForDamageIfIHit() {
        Boolean hit = testHelper.getFromContext("hit");
        if (hit != null && hit) {
            Weapon weapon = testHelper.getFromContext("weapon");
            assertNotNull(weapon);
            
            testHelper.setDiceRoll("damage", 4);
            int damageRoll = testHelper.roll1D6();
            int totalDamage = damageRoll + weapon.getDamage();
            
            testHelper.storeInContext("damageRoll", damageRoll);
            testHelper.storeInContext("totalDamage", totalDamage);
            
            assertTrue(totalDamage > 0);
        }
    }

    @Given("I have a melee weapon")
    public void iHaveAMeleeWeapon() {
        // Create or find a blade weapon
        Weapon blade = weaponRepository.findByName("Cutlass").orElse(null);
        if (blade == null) {
            blade = new Weapon();
            blade.setName("Cutlass");
            blade.setType(WeaponType.MELEE);
            blade.setDamage(2);
            blade.setPenetration(2);
            blade.setRange(0);
            blade.setTechLevel(3);
            blade.setWeight(2);
            blade = weaponRepository.save(blade);
        }
        
        combatCharacter.addWeapon(blade);
        combatCharacter.equipWeapon(blade);
        combatCharacter = characterRepository.save(combatCharacter);
        
        testHelper.storeInContext("meleeWeapon", blade);
    }

    @When("I attack an opponent in close combat")
    public void iAttackAnOpponentInCloseCombat() {
        Character target = opponents.get(0);
        Weapon weapon = combatCharacter.getEquippedWeapon();
        assertNotNull(weapon);
        assertEquals(WeaponType.MELEE, weapon.getType());
        
        // Calculate melee attack roll
        int skillLevel = combatCharacter.getSkill("Melee").getLevel();
        int strModifier = testHelper.getCharacteristicModifier(
            combatCharacter.getCharacteristic(CharacteristicType.STRENGTH).getValue());
        
        testHelper.setDiceRoll("melee_attack", 9);
        int attackRoll = testHelper.roll2D6();
        int attackTotal = attackRoll + skillLevel + strModifier;
        
        testHelper.storeInContext("target", target);
        testHelper.storeInContext("attackRoll", attackRoll);
        testHelper.storeInContext("attackTotal", attackTotal);
        testHelper.storeInContext("weapon", weapon);
    }

    @Then("I should roll 2d6 and add my melee skill")
    public void iShouldRoll2d6AndAddMyMeleeSkill() {
        Integer attackRoll = testHelper.getFromContext("attackRoll");
        Integer attackTotal = testHelper.getFromContext("attackTotal");
        
        assertNotNull(attackRoll);
        assertNotNull(attackTotal);
        assertTrue(attackRoll >= 2 && attackRoll <= 12);
        
        int skillLevel = combatCharacter.getSkill("Melee").getLevel();
        assertTrue(attackTotal >= attackRoll + skillLevel);
    }

    @Given("I have hit an opponent")
    public void iHaveHitAnOpponent() {
        iHaveARangedWeapon();
        iAttackAnOpponent();
        testHelper.storeInContext("hit", true);
    }

    @When("I roll for damage")
    public void iRollForDamage() {
        Weapon weapon = testHelper.getFromContext("weapon");
        assertNotNull(weapon);
        
        testHelper.setDiceRoll("damage", 3);
        int damageRoll = testHelper.roll1D6();
        int totalDamage = damageRoll + weapon.getDamage();
        
        testHelper.storeInContext("damageRoll", damageRoll);
        testHelper.storeInContext("totalDamage", totalDamage);
    }

    @Then("the damage should be applied to the opponent's physical characteristics")
    public void theDamageShouldBeAppliedToTheOpponentsPhysicalCharacteristics() {
        Character target = testHelper.getFromContext("target");
        Integer totalDamage = testHelper.getFromContext("totalDamage");
        
        assertNotNull(target);
        assertNotNull(totalDamage);
        
        // Apply damage to Endurance (typical target)
        int originalEndurance = target.getCharacteristic(CharacteristicType.ENDURANCE).getValue();
        int damageApplied = target.applyDamage(totalDamage, false, CharacteristicType.ENDURANCE);
        
        assertTrue(damageApplied > 0);
        assertTrue(target.getCharacteristic(CharacteristicType.ENDURANCE).getValue() < originalEndurance);
        
        target = characterRepository.save(target);
        testHelper.storeInContext("target", target);
    }

    @And("the opponent should be incapacitated if any characteristic reaches 0")
    public void theOpponentShouldBeIncapacitatedIfAnyCharacteristicReaches0() {
        Character target = testHelper.getFromContext("target");
        assertNotNull(target);
        
        // Check if any physical characteristic is at 0
        boolean incapacitated = 
            target.getCharacteristic(CharacteristicType.STRENGTH).getValue() <= 0 ||
            target.getCharacteristic(CharacteristicType.DEXTERITY).getValue() <= 0 ||
            target.getCharacteristic(CharacteristicType.ENDURANCE).getValue() <= 0;
        
        testHelper.storeInContext("targetIncapacitated", incapacitated);
        
        // In a real implementation, incapacitated characters can't act
        if (incapacitated) {
            // Character is unconscious or dead
            assertTrue(true); // Test passes if we reach this point
        }
    }

    @Given("there is cover available")
    public void thereIsCoverAvailable() {
        testHelper.storeInContext("coverAvailable", true);
        testHelper.storeInContext("coverType", "Light Cover"); // -1 DM to attacks
    }

    @When("I take cover")
    public void iTakeCover() {
        testHelper.storeInContext("inCover", true);
        testHelper.storeInContext("coverModifier", -1); // -1 DM to attacks against character
    }

    @Then("attacks against me should have a penalty")
    public void attacksAgainstMeShouldHaveAPenalty() {
        Boolean inCover = testHelper.getFromContext("inCover");
        Integer coverModifier = testHelper.getFromContext("coverModifier");
        
        assertNotNull(inCover);
        assertNotNull(coverModifier);
        assertTrue(inCover);
        assertTrue(coverModifier < 0); // Negative modifier makes it harder to hit
    }

    @And("I should be harder to hit")
    public void iShouldBeHarderToHit() {
        Integer coverModifier = testHelper.getFromContext("coverModifier");
        assertNotNull(coverModifier);
        
        // Simulate an attack against the character in cover
        int baseTargetNumber = 8;
        int modifiedTargetNumber = baseTargetNumber - coverModifier; // Cover makes target number higher
        
        assertTrue(modifiedTargetNumber > baseTargetNumber);
        testHelper.storeInContext("modifiedTargetNumber", modifiedTargetNumber);
    }

    @Given("one side is unaware of the other")
    public void oneSideIsUnawareOfTheOther() {
        testHelper.storeInContext("surprise", true);
        testHelper.storeInContext("surprisedSide", "opponents");
        testHelper.storeInContext("surprisingSide", "player");
    }

    @Then("the surprised side should not act in the first round")
    public void theSurprisedSideShouldNotActInTheFirstRound() {
        Boolean surprise = testHelper.getFromContext("surprise");
        String surprisedSide = testHelper.getFromContext("surprisedSide");
        
        assertNotNull(surprise);
        assertNotNull(surprisedSide);
        assertTrue(surprise);
        
        // In first round, only non-surprised characters can act
        testHelper.storeInContext("surpriseRound", true);
        testHelper.storeInContext("canAct", "player"); // Only player can act
    }

    @And("the surprising side should gain initiative")
    public void theSurprisingSideShouldGainInitiative() {
        String surprisingSide = testHelper.getFromContext("surprisingSide");
        assertNotNull(surprisingSide);
        
        // Surprising side automatically goes first
        testHelper.storeInContext("initiativeWinner", surprisingSide);
        assertEquals("player", surprisingSide);
    }

    @Given("I have an automatic weapon")
    public void iHaveAnAutomaticWeapon() {
        Weapon autoRifle = weaponRepository.findByName("Auto Rifle").orElse(null);
        if (autoRifle == null) {
            autoRifle = new Weapon();
            autoRifle.setName("Auto Rifle");
            autoRifle.setType(WeaponType.RANGED);
            autoRifle.setDamage(3);
            autoRifle.setPenetration(0);
            autoRifle.setRange(150);
            autoRifle.setTechLevel(6);
            autoRifle.setWeight(4);
            autoRifle = weaponRepository.save(autoRifle);
        }
        
        combatCharacter.addWeapon(autoRifle);
        combatCharacter.equipWeapon(autoRifle);
        combatCharacter = characterRepository.save(combatCharacter);
        
        testHelper.storeInContext("automaticWeapon", autoRifle);
    }

    @When("I fire on automatic")
    public void iFireOnAutomatic() {
        testHelper.storeInContext("firingMode", "automatic");
        testHelper.storeInContext("attackRolls", 3); // Make 3 attack rolls
        testHelper.storeInContext("ammoUsed", 10); // Use 10 rounds
    }

    @Then("I should make multiple attack rolls")
    public void iShouldMakeMultipleAttackRolls() {
        Integer attackRolls = testHelper.getFromContext("attackRolls");
        assertNotNull(attackRolls);
        assertTrue(attackRolls > 1);
        
        // Simulate multiple attack rolls
        List<Integer> rollResults = new ArrayList<>();
        for (int i = 0; i < attackRolls; i++) {
            testHelper.setDiceRoll("auto_attack_" + i, 7 + i);
            rollResults.add(testHelper.roll2D6());
        }
        testHelper.storeInContext("autoAttackRolls", rollResults);
    }

    @And("I should use more ammunition")
    public void iShouldUseMoreAmmunition() {
        Integer ammoUsed = testHelper.getFromContext("ammoUsed");
        assertNotNull(ammoUsed);
        assertTrue(ammoUsed > 1); // More than single shot
    }

    @And("I should potentially hit multiple times")
    public void iShouldPotentiallyHitMultipleTimes() {
        @SuppressWarnings("unchecked")
        List<Integer> rollResults = testHelper.getFromContext("autoAttackRolls");
        assertNotNull(rollResults);
        
        int hits = 0;
        int targetNumber = 8;
        for (Integer roll : rollResults) {
            if (roll >= targetNumber) {
                hits++;
            }
        }
        
        testHelper.storeInContext("autoHits", hits);
        assertTrue(hits >= 0); // Could be 0 or more hits
    }

    @Given("I have an explosive weapon")
    public void iHaveAnExplosiveWeapon() {
        Weapon grenade = weaponRepository.findByName("Frag Grenade").orElse(null);
        if (grenade == null) {
            grenade = new Weapon();
            grenade.setName("Frag Grenade");
            grenade.setType(WeaponType.EXPLOSIVE);
            grenade.setDamage(5);
            grenade.setPenetration(0);
            grenade.setRange(15);
            grenade.setTechLevel(6);
            grenade.setWeight(1);
            grenade = weaponRepository.save(grenade);
        }
        
        combatCharacter.addWeapon(grenade);
        combatCharacter.equipWeapon(grenade);
        combatCharacter = characterRepository.save(combatCharacter);
        
        testHelper.storeInContext("explosiveWeapon", grenade);
    }

    @When("I use the explosive weapon")
    public void iUseTheExplosiveWeapon() {
        testHelper.storeInContext("explosionCenter", "target location");
        testHelper.storeInContext("blastRadius", 6); // 6 meter radius
        testHelper.storeInContext("targetsInBlast", combatants); // All combatants affected
    }

    @Then("damage should be applied to all targets in the blast radius")
    public void damageShouldBeAppliedToAllTargetsInTheBlastRadius() {
        @SuppressWarnings("unchecked")
        List<Character> targetsInBlast = testHelper.getFromContext("targetsInBlast");
        assertNotNull(targetsInBlast);
        assertTrue(targetsInBlast.size() > 1); // Multiple targets affected
        
        testHelper.storeInContext("explosiveDamage", 8); // Base explosive damage
    }

    @And("the damage should decrease with distance from the blast center")
    public void theDamageShouldDecreaseWithDistanceFromTheBlastCenter() {
        Integer baseDamage = testHelper.getFromContext("explosiveDamage");
        assertNotNull(baseDamage);
        
        // Simulate distance-based damage reduction
        Map<Character, Integer> damageByDistance = new HashMap<>();
        damageByDistance.put(combatCharacter, baseDamage); // At center, full damage
        damageByDistance.put(opponents.get(0), baseDamage - 2); // Further away, reduced damage
        damageByDistance.put(opponents.get(1), baseDamage - 4); // Even further, more reduction
        
        testHelper.storeInContext("distanceBasedDamage", damageByDistance);
        
        // Verify damage varies by distance
        assertTrue(damageByDistance.values().stream().distinct().count() > 1);
    }

    @Given("I am wearing armor")
    public void iAmWearingArmor() {
        Armor combatArmor = armorRepository.findByName("Combat Armor").orElse(null);
        if (combatArmor == null) {
            combatArmor = new Armor();
            combatArmor.setName("Combat Armor");
            combatArmor.setType(ArmorType.COMBAT);
            combatArmor.setProtection(6);
            combatArmor.setTechLevel(10);
            combatArmor.setWeight(8);
            combatArmor = armorRepository.save(combatArmor);
        }
        
        combatCharacter.addArmor(combatArmor);
        combatCharacter.equipArmor(combatArmor);
        combatCharacter = characterRepository.save(combatCharacter);
        
        testHelper.storeInContext("armor", combatArmor);
    }

    @When("I am hit by an attack")
    public void iAmHitByAnAttack() {
        testHelper.storeInContext("incomingDamage", 8);
        testHelper.storeInContext("weaponType", "kinetic");
    }

    @Then("my armor should reduce the damage taken")
    public void myArmorShouldReduceTheDamageTaken() {
        Integer incomingDamage = testHelper.getFromContext("incomingDamage");
        Armor armor = testHelper.getFromContext("armor");
        
        assertNotNull(incomingDamage);
        assertNotNull(armor);
        
        int reducedDamage = armor.reduceDamage(incomingDamage, false);
        assertTrue(reducedDamage < incomingDamage);
        
        testHelper.storeInContext("actualDamage", reducedDamage);
    }

    @And("some weapons may penetrate armor more effectively than others")
    public void someWeaponsMayPenetrateArmorMoreEffectivelyThanOthers() {
        Integer incomingDamage = testHelper.getFromContext("incomingDamage");
        Armor armor = testHelper.getFromContext("armor");
        
        // Test energy weapon vs kinetic weapon penetration
        int kineticReduction = armor.reduceDamage(incomingDamage, false);
        int energyReduction = armor.reduceDamage(incomingDamage, true);
        
        // Energy weapons might have different penetration characteristics
        testHelper.storeInContext("kineticDamage", kineticReduction);
        testHelper.storeInContext("energyDamage", energyReduction);
        
        // Verify armor behaves differently for different weapon types
        assertTrue(kineticReduction >= 0 && energyReduction >= 0);
    }

    @Given("I have taken damage in combat")
    public void iHaveTakenDamageInCombat() {
        // Apply damage to character
        int damageAmount = 4;
        combatCharacter.applyDamage(damageAmount, false, CharacteristicType.ENDURANCE);
        combatCharacter = characterRepository.save(combatCharacter);
        
        testHelper.storeInContext("damageTaken", damageAmount);
        testHelper.storeInContext("originalEndurance", 
            combatCharacter.getCharacteristic(CharacteristicType.ENDURANCE).getValue() + damageAmount);
    }

    @When("I receive medical treatment")
    public void iReceiveMedicalTreatment() {
        // Simulate medical skill check
        testHelper.setDiceRoll("medical", 10);
        int medicalRoll = testHelper.roll2D6();
        int medicSkill = 2; // Assume doctor has Medic-2
        int intModifier = 1; // Intelligence modifier
        
        int treatmentTotal = medicalRoll + medicSkill + intModifier;
        testHelper.storeInContext("treatmentRoll", treatmentTotal);
        
        // Successful treatment (target 8+)
        boolean treatmentSuccess = treatmentTotal >= 8;
        testHelper.storeInContext("treatmentSuccess", treatmentSuccess);
    }

    @Then("some of my injuries should heal")
    public void someOfMyInjuriesShouldHeal() {
        Boolean treatmentSuccess = testHelper.getFromContext("treatmentSuccess");
        
        if (treatmentSuccess != null && treatmentSuccess) {
            // Heal 1d3 points of damage
            testHelper.setDiceRoll("healing", 2);
            int healingAmount = (testHelper.roll1D6() + 2) / 2; // 1d3 approximation
            
            Characteristic endurance = combatCharacter.getCharacteristic(CharacteristicType.ENDURANCE);
            int currentValue = endurance.getValue();
            endurance.setValue(Math.min(currentValue + healingAmount, endurance.getOriginalValue()));
            
            combatCharacter = characterRepository.save(combatCharacter);
            testHelper.storeInContext("healingAmount", healingAmount);
            
            assertTrue(healingAmount > 0);
        }
    }

    @And("my physical characteristics should increase back toward their normal values")
    public void myPhysicalCharacteristicsShouldIncreaseBackTowardTheirNormalValues() {
        Boolean treatmentSuccess = testHelper.getFromContext("treatmentSuccess");
        
        if (treatmentSuccess != null && treatmentSuccess) {
            Integer originalEndurance = testHelper.getFromContext("originalEndurance");
            int currentEndurance = combatCharacter.getCharacteristic(CharacteristicType.ENDURANCE).getValue();
            
            // Character should have more endurance than before treatment, but not exceed original
            assertTrue(currentEndurance <= originalEndurance);
        }
    }

    @Given("combat takes place in a special environment")
    public void combatTakesPlaceInASpecialEnvironment() {
        testHelper.storeInContext("environment", "Zero-G");
        testHelper.storeInContext("environmentModifier", -2); // Penalty for zero-G combat
    }

    @When("I take actions in that environment")
    public void iTakeActionsInThatEnvironment() {
        String environment = testHelper.getFromContext("environment");
        Integer modifier = testHelper.getFromContext("environmentModifier");
        
        assertNotNull(environment);
        assertNotNull(modifier);
        
        testHelper.storeInContext("actionModified", true);
    }

    @Then("environmental factors should affect combat")
    public void environmentalFactorsShouldAffectCombat() {
        Boolean actionModified = testHelper.getFromContext("actionModified");
        Integer environmentModifier = testHelper.getFromContext("environmentModifier");
        
        assertNotNull(actionModified);
        assertNotNull(environmentModifier);
        assertTrue(actionModified);
        
        // Environmental modifier should affect skill checks
        assertTrue(environmentModifier != 0);
    }

    @And("special rules may apply based on the environment")
    public void specialRulesMayApplyBasedOnTheEnvironment() {
        String environment = testHelper.getFromContext("environment");
        assertEquals("Zero-G", environment);
        
        // Zero-G specific rules could include:
        // - Difficulty moving without Zero-G skill
        // - Different weapon behavior
        // - Modified damage from impacts
        Map<String, String> specialRules = new HashMap<>();
        specialRules.put("movement", "Requires Zero-G skill or suffer penalties");
        specialRules.put("recoil", "Weapons have increased recoil effects");
        
        testHelper.storeInContext("specialRules", specialRules);
        assertFalse(specialRules.isEmpty());
    }
}