package com.barrows.travller.api.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the Skill class.
 * Tests cover skill creation, level management, and skill progression.
 */
public class SkillTest {

    private Skill piloting;
    private Skill gunCombat;
    private Skill engineering;

    @BeforeEach
    public void setUp() {
        piloting = new Skill("Pilot", 2, SkillCategory.SPACE, CharacteristicType.DEXTERITY);
        gunCombat = new Skill("Gun Combat", SkillCategory.COMBAT, CharacteristicType.DEXTERITY);
        engineering = new Skill("Engineering", 0, SkillCategory.TECHNICAL, CharacteristicType.EDUCATION);
    }

    @Test
    public void testSkillCreationWithLevel() {
        assertEquals("Pilot", piloting.getName());
        assertEquals(2, piloting.getLevel());
        assertEquals(SkillCategory.SPACE, piloting.getCategory());
        assertEquals(CharacteristicType.DEXTERITY, piloting.getPrimaryCharacteristic());
        assertTrue(piloting.isTrained());
    }

    @Test
    public void testSkillCreationWithoutLevel() {
        assertEquals("Gun Combat", gunCombat.getName());
        assertEquals(0, gunCombat.getLevel());
        assertEquals(SkillCategory.COMBAT, gunCombat.getCategory());
        assertEquals(CharacteristicType.DEXTERITY, gunCombat.getPrimaryCharacteristic());
        assertFalse(gunCombat.isTrained());
    }

    @Test
    public void testNoArgsConstructor() {
        Skill skill = new Skill();
        assertNull(skill.getName());
        assertEquals(0, skill.getLevel());
        assertNull(skill.getCategory());
        assertNull(skill.getPrimaryCharacteristic());
        assertFalse(skill.isTrained());
    }

    @Test
    public void testIncreaseLevel() {
        assertEquals(0, engineering.getLevel());
        assertFalse(engineering.isTrained());
        
        // Increase by 1
        assertEquals(1, engineering.increaseLevel());
        assertEquals(1, engineering.getLevel());
        assertTrue(engineering.isTrained());
        
        // Increase by 1 again
        assertEquals(2, engineering.increaseLevel());
        assertEquals(2, engineering.getLevel());
        assertTrue(engineering.isTrained());
    }

    @Test
    public void testIncreaseLevelByAmount() {
        assertEquals(0, gunCombat.getLevel());
        
        // Increase by 3
        assertEquals(3, gunCombat.increaseLevel(3));
        assertEquals(3, gunCombat.getLevel());
        assertTrue(gunCombat.isTrained());
        
        // Increase by 2 more
        assertEquals(5, gunCombat.increaseLevel(2));
        assertEquals(5, gunCombat.getLevel());
    }

    @Test
    public void testIncreaseLevelByZero() {
        int originalLevel = piloting.getLevel();
        assertEquals(originalLevel, piloting.increaseLevel(0));
        assertEquals(originalLevel, piloting.getLevel());
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 2, 3, 5, 10})
    public void testIncreaseLevelByPositiveAmounts(int amount) {
        Skill skill = new Skill("Test Skill", 1, SkillCategory.TECHNICAL, CharacteristicType.INTELLIGENCE);
        int originalLevel = skill.getLevel();
        
        assertEquals(originalLevel + amount, skill.increaseLevel(amount));
        assertEquals(originalLevel + amount, skill.getLevel());
        assertTrue(skill.isTrained());
    }

    @Test
    public void testIsTrainedWithDifferentLevels() {
        Skill untrainedSkill = new Skill("Untrained", 0, SkillCategory.SPACE, CharacteristicType.INTELLIGENCE);
        Skill trainedSkill1 = new Skill("Trained-1", 1, SkillCategory.SPACE, CharacteristicType.INTELLIGENCE);
        Skill trainedSkill2 = new Skill("Trained-2", 2, SkillCategory.SPACE, CharacteristicType.INTELLIGENCE);
        Skill expertSkill = new Skill("Expert", 5, SkillCategory.SPACE, CharacteristicType.INTELLIGENCE);
        
        assertFalse(untrainedSkill.isTrained());
        assertTrue(trainedSkill1.isTrained());
        assertTrue(trainedSkill2.isTrained());
        assertTrue(expertSkill.isTrained());
    }

    @Test
    public void testToString() {
        // Level 0 skills should just show the name
        assertEquals("Gun Combat", gunCombat.toString());
        assertEquals("Engineering", engineering.toString());
        
        // Level > 0 skills should show name-level
        assertEquals("Pilot-2", piloting.toString());
        
        // Test after increasing level
        gunCombat.increaseLevel();
        assertEquals("Gun Combat-1", gunCombat.toString());
        
        gunCombat.increaseLevel(2);
        assertEquals("Gun Combat-3", gunCombat.toString());
    }

    @Test
    public void testSkillProgression() {
        Skill athletics = new Skill("Athletics", SkillCategory.PHYSICAL, CharacteristicType.STRENGTH);
        
        // Start untrained
        assertFalse(athletics.isTrained());
        assertEquals("Athletics", athletics.toString());
        
        // Train to level 1
        athletics.increaseLevel();
        assertTrue(athletics.isTrained());
        assertEquals("Athletics-1", athletics.toString());
        
        // Train to level 3
        athletics.increaseLevel(2);
        assertEquals(3, athletics.getLevel());
        assertEquals("Athletics-3", athletics.toString());
    }

    @Test
    public void testAllSkillCategories() {
        Skill combat = new Skill("Melee", SkillCategory.COMBAT, CharacteristicType.STRENGTH);
        Skill physical = new Skill("Athletics", SkillCategory.PHYSICAL, CharacteristicType.STRENGTH);
        Skill social = new Skill("Persuade", SkillCategory.SOCIAL, CharacteristicType.SOCIAL_STANDING);
        Skill space = new Skill("Pilot", SkillCategory.SPACE, CharacteristicType.DEXTERITY);
        Skill technical = new Skill("Computer", SkillCategory.TECHNICAL, CharacteristicType.EDUCATION);
        Skill vehicle = new Skill("Drive", SkillCategory.VEHICLE, CharacteristicType.DEXTERITY);
        
        assertEquals(SkillCategory.COMBAT, combat.getCategory());
        assertEquals(SkillCategory.PHYSICAL, physical.getCategory());
        assertEquals(SkillCategory.SOCIAL, social.getCategory());
        assertEquals(SkillCategory.SPACE, space.getCategory());
        assertEquals(SkillCategory.TECHNICAL, technical.getCategory());
        assertEquals(SkillCategory.VEHICLE, vehicle.getCategory());
    }

    @Test
    public void testAllCharacteristicTypes() {
        Skill strengthSkill = new Skill("Athletics", SkillCategory.PHYSICAL, CharacteristicType.STRENGTH);
        Skill dexteritySkill = new Skill("Stealth", SkillCategory.PHYSICAL, CharacteristicType.DEXTERITY);
        Skill enduranceSkill = new Skill("Athletics", SkillCategory.PHYSICAL, CharacteristicType.ENDURANCE);
        Skill intelligenceSkill = new Skill("Investigate", SkillCategory.SOCIAL, CharacteristicType.INTELLIGENCE);
        Skill educationSkill = new Skill("Science", SkillCategory.TECHNICAL, CharacteristicType.EDUCATION);
        Skill socialSkill = new Skill("Persuade", SkillCategory.SOCIAL, CharacteristicType.SOCIAL_STANDING);
        
        assertEquals(CharacteristicType.STRENGTH, strengthSkill.getPrimaryCharacteristic());
        assertEquals(CharacteristicType.DEXTERITY, dexteritySkill.getPrimaryCharacteristic());
        assertEquals(CharacteristicType.ENDURANCE, enduranceSkill.getPrimaryCharacteristic());
        assertEquals(CharacteristicType.INTELLIGENCE, intelligenceSkill.getPrimaryCharacteristic());
        assertEquals(CharacteristicType.EDUCATION, educationSkill.getPrimaryCharacteristic());
        assertEquals(CharacteristicType.SOCIAL_STANDING, socialSkill.getPrimaryCharacteristic());
    }

    @Test
    public void testSkillEquality() {
        Skill skill1 = new Skill("Test", 1, SkillCategory.TECHNICAL, CharacteristicType.INTELLIGENCE);
        Skill skill2 = new Skill("Test", 1, SkillCategory.TECHNICAL, CharacteristicType.INTELLIGENCE);
        Skill differentSkill = new Skill("Different", 1, SkillCategory.TECHNICAL, CharacteristicType.INTELLIGENCE);
        
        // Skills with same properties should be equal (Lombok @Data generates equals/hashCode)
        assertEquals(skill1, skill2);
        assertEquals(skill1.hashCode(), skill2.hashCode());
        
        // Skills with different names should not be equal
        assertNotEquals(skill1, differentSkill);
        
        // String representations should be the same for equal skills
        assertEquals(skill1.toString(), skill2.toString());
    }
}