package com.barrows.travller.api.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the Career class.
 * Tests cover career creation, qualification requirements, skill tables, and career progression.
 */
public class CareerTest {

    private Career navy;
    private Career merchant;
    private List<Characteristic> characterCharacteristics;
    private Skill pilot;
    private Skill engineering;
    private Skill gunCombat;
    
    @BeforeEach
    public void setUp() {
        navy = new Career("Navy", "The stellar navy of the Imperium");
        merchant = new Career("Merchant", "Free traders and commercial pilots");
        
        // Create some test characteristics
        characterCharacteristics = new ArrayList<>();
        characterCharacteristics.add(new Characteristic(CharacteristicType.INTELLIGENCE, 10));
        characterCharacteristics.add(new Characteristic(CharacteristicType.EDUCATION, 8));
        characterCharacteristics.add(new Characteristic(CharacteristicType.DEXTERITY, 9));
        
        // Create some test skills
        pilot = new Skill("Pilot", SkillCategory.SPACE, CharacteristicType.DEXTERITY);
        engineering = new Skill("Engineering", SkillCategory.TECHNICAL, CharacteristicType.EDUCATION);
        gunCombat = new Skill("Gun Combat", SkillCategory.COMBAT, CharacteristicType.DEXTERITY);
    }

    @Test
    public void testCareerCreation() {
        assertEquals("Navy", navy.getName());
        assertEquals("The stellar navy of the Imperium", navy.getDescription());
        assertNotNull(navy.getQualificationRequirements());
        assertTrue(navy.getQualificationRequirements().isEmpty());
        assertEquals(0, navy.getQualificationDM());
        assertNotNull(navy.getBasicTrainingSkills());
        assertTrue(navy.getBasicTrainingSkills().isEmpty());
    }

    @Test
    public void testNoArgsConstructor() {
        Career career = new Career();
        assertNull(career.getName());
        assertNull(career.getDescription());
        assertNull(career.getQualificationRequirements());
        assertEquals(0, career.getQualificationDM());
    }

    @Test
    public void testAddQualificationRequirement() {
        navy.addQualificationRequirement(CharacteristicType.INTELLIGENCE, 8);
        navy.addQualificationRequirement(CharacteristicType.EDUCATION, 6);
        
        assertEquals(2, navy.getQualificationRequirements().size());
        assertEquals(8, navy.getQualificationRequirements().get(CharacteristicType.INTELLIGENCE));
        assertEquals(6, navy.getQualificationRequirements().get(CharacteristicType.EDUCATION));
    }

    @Test
    public void testAddBasicTrainingSkill() {
        navy.addBasicTrainingSkill(pilot);
        navy.addBasicTrainingSkill(engineering);
        
        assertEquals(2, navy.getBasicTrainingSkills().size());
        assertTrue(navy.getBasicTrainingSkills().contains(pilot));
        assertTrue(navy.getBasicTrainingSkills().contains(engineering));
    }

    @Test
    public void testAddServiceSkill() {
        navy.addServiceSkill(1, pilot);
        navy.addServiceSkill(2, engineering);
        navy.addServiceSkill(3, gunCombat);
        
        assertEquals(3, navy.getServiceSkillTables().size());
        
        SkillTable firstEntry = navy.getServiceSkillTables().get(0);
        assertEquals(1, firstEntry.getDiceRoll());
        assertEquals(pilot, firstEntry.getSkill());
    }

    @Test
    public void testAddAdvancedEducationSkill() {
        navy.addAdvancedEducationSkill(4, engineering);
        navy.addAdvancedEducationSkill(5, pilot);
        
        assertEquals(2, navy.getAdvancedEducationSkillTables().size());
        
        SkillTable firstEntry = navy.getAdvancedEducationSkillTables().get(0);
        assertEquals(4, firstEntry.getDiceRoll());
        assertEquals(engineering, firstEntry.getSkill());
    }

    @Test
    public void testAddSpecialistSkill() {
        navy.addSpecialistSkill("Flight", 1, pilot);
        navy.addSpecialistSkill("Flight", 2, engineering);
        navy.addSpecialistSkill("Engineering", 1, engineering);
        
        assertEquals(2, navy.getSpecialistSkillTables().size());
        assertTrue(navy.getSpecialistSkillTables().containsKey("Flight"));
        assertTrue(navy.getSpecialistSkillTables().containsKey("Engineering"));
        
        List<SkillTable> flightSkills = navy.getSpecialistSkillTables().get("Flight");
        assertEquals(2, flightSkills.size());
        
        List<SkillTable> engineeringSkills = navy.getSpecialistSkillTables().get("Engineering");
        assertEquals(1, engineeringSkills.size());
    }

    @Test
    public void testAddRank() {
        Rank ensign = new Rank(1, "Ensign");
        Rank lieutenant = new Rank(2, "Lieutenant");
        
        navy.addRank(ensign);
        navy.addRank(lieutenant);
        
        assertEquals(2, navy.getRanks().size());
        assertTrue(navy.getRanks().contains(ensign));
        assertTrue(navy.getRanks().contains(lieutenant));
    }

    @Test
    public void testAddMusteringOutBenefit() {
        navy.addMusteringOutBenefit(1, "Personal Weapon", false);
        navy.addMusteringOutBenefit(4, "10000", true);
        navy.addMusteringOutBenefit(6, "Ship Share", false);
        
        assertEquals(3, navy.getMusteringOutBenefits().size());
        
        BenefitTable cashBenefit = navy.getMusteringOutBenefits().get(1);
        assertEquals(4, cashBenefit.getDiceRoll());
        assertEquals("10000", cashBenefit.getBenefit());
        assertTrue(cashBenefit.isCashBenefit());
    }

    @Test
    public void testCheckQualificationBasicRoll() {
        // Test with no qualification requirements - just base roll
        assertTrue(navy.checkQualification(characterCharacteristics, 8)); // 8+ succeeds
        assertFalse(navy.checkQualification(characterCharacteristics, 7)); // 7 fails
        assertTrue(navy.checkQualification(characterCharacteristics, 12)); // High roll succeeds
    }

    @Test
    public void testCheckQualificationWithRequirements() {
        // Add qualification requirements
        navy.addQualificationRequirement(CharacteristicType.INTELLIGENCE, 8); // Character has 10, so +1 DM
        navy.addQualificationRequirement(CharacteristicType.EDUCATION, 9); // Character has 8, so no bonus
        
        // With +1 DM from INT, a roll of 7 becomes 8 and succeeds
        assertTrue(navy.checkQualification(characterCharacteristics, 7));
        
        // A roll of 6 becomes 7 and fails
        assertFalse(navy.checkQualification(characterCharacteristics, 6));
    }

    @Test
    public void testCheckQualificationWithDM() {
        // Set career qualification DM to +1
        navy.setQualificationDM(1);
        
        // With +1 career DM, a roll of 7 becomes 8 and succeeds
        assertTrue(navy.checkQualification(characterCharacteristics, 7));
        
        // A roll of 6 becomes 7 and fails
        assertFalse(navy.checkQualification(characterCharacteristics, 6));
    }

    @Test
    public void testCheckQualificationComplex() {
        // Set up a complex scenario
        navy.setQualificationDM(-1); // Harder career
        navy.addQualificationRequirement(CharacteristicType.INTELLIGENCE, 8); // +1 DM (character has 10)
        navy.addQualificationRequirement(CharacteristicType.DEXTERITY, 9); // +1 DM (character has 9)
        
        // Total DM: -1 (career) + 1 (INT) + 1 (DEX) = +1
        // So a roll of 7 becomes 8 and succeeds
        assertTrue(navy.checkQualification(characterCharacteristics, 7));
        
        // A roll of 6 becomes 7 and fails
        assertFalse(navy.checkQualification(characterCharacteristics, 6));
    }

    @Test 
    public void testGetQualificationCharacteristic() {
        // Test with no requirements - should default to INTELLIGENCE
        assertEquals(CharacteristicType.INTELLIGENCE, navy.getQualificationCharacteristic());
        
        // Add requirements and test that it returns the first one
        navy.addQualificationRequirement(CharacteristicType.EDUCATION, 8);
        navy.addQualificationRequirement(CharacteristicType.DEXTERITY, 6);
        
        // Should return the first characteristic type added
        CharacteristicType firstType = navy.getQualificationCharacteristic();
        assertTrue(firstType == CharacteristicType.EDUCATION || firstType == CharacteristicType.DEXTERITY);
    }

    @ParameterizedTest
    @ValueSource(ints = {-2, -1, 0, 1, 2})
    public void testGetQualificationDifficulty(int qualificationDM) {
        navy.setQualificationDM(qualificationDM);
        assertEquals(8 - qualificationDM, navy.getQualificationDifficulty());
    }

    @Test
    public void testGetSkillTables() {
        navy.addServiceSkill(1, pilot);
        navy.addServiceSkill(2, engineering);
        navy.addAdvancedEducationSkill(3, gunCombat);
        
        List<SkillTable> allTables = navy.getSkillTables();
        assertEquals(3, allTables.size());
        
        // Should contain both service and advanced education skills
        boolean foundPilot = allTables.stream().anyMatch(st -> st.getSkill().equals(pilot));
        boolean foundEngineering = allTables.stream().anyMatch(st -> st.getSkill().equals(engineering));
        boolean foundGunCombat = allTables.stream().anyMatch(st -> st.getSkill().equals(gunCombat));
        
        assertTrue(foundPilot);
        assertTrue(foundEngineering);
        assertTrue(foundGunCombat);
    }

    @Test
    public void testGetSkillTablesWithNullLists() {
        // Test that getSkillTables handles null lists gracefully
        Career career = new Career();
        List<SkillTable> allTables = career.getSkillTables();
        assertNotNull(allTables);
        assertTrue(allTables.isEmpty());
    }

    @Test
    public void testToString() {
        assertEquals("Navy", navy.toString());
        assertEquals("Merchant", merchant.toString());
    }

    @Test
    public void testCareerComparison() {
        Career navy2 = new Career("Navy", "Another navy description");
        
        // Test that careers with same name have same toString
        assertEquals(navy.toString(), navy2.toString());
        
        // But they are different objects
        assertNotEquals(navy, navy2);
    }
}