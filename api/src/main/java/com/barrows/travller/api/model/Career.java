package com.barrows.travller.api.model;

import lombok.Data;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

/**
 * Represents a career in the Traveller RPG system.
 * Careers are the professions that characters can pursue during character creation,
 * which provide skills, benefits, and advancement opportunities.
 */
@Data
public class Career {

    /**
     * The name of the career.
     */
    private String name;

    /**
     * The description of the career.
     */
    private String description;

    /**
     * The qualification requirements for this career.
     * Map of characteristic type to minimum value required.
     */
    private Map<CharacteristicType, Integer> qualificationRequirements;

    /**
     * The DM (Dice Modifier) applied to qualification rolls.
     */
    private int qualificationDM;

    /**
     * The skills available during basic training (first term only).
     */
    private List<Skill> basicTrainingSkills;

    /**
     * The service skills table (skills gained during service).
     */
    private List<SkillTable> serviceSkillTables;

    /**
     * The advanced education skills table (skills gained with EDU 8+).
     */
    private List<SkillTable> advancedEducationSkillTables;

    /**
     * The specialist skills tables.
     */
    private Map<String, List<SkillTable>> specialistSkillTables;

    /**
     * The ranks and rank benefits for this career.
     */
    private List<Rank> ranks;

    /**
     * The mustering out benefits table.
     */
    private List<BenefitTable> musteringOutBenefits;

    /**
     * Creates a new career with the specified name.
     *
     * @param name The name of the career
     * @param description The description of the career
     */
    public Career(String name, String description) {
        this.name = name;
        this.description = description;
        this.qualificationRequirements = new HashMap<>();
        this.qualificationDM = 0;
        this.basicTrainingSkills = new ArrayList<>();
        this.serviceSkillTables = new ArrayList<>();
        this.advancedEducationSkillTables = new ArrayList<>();
        this.specialistSkillTables = new HashMap<>();
        this.ranks = new ArrayList<>();
        this.musteringOutBenefits = new ArrayList<>();
    }

    /**
     * Adds a qualification requirement for this career.
     *
     * @param characteristicType The characteristic type
     * @param minimumValue The minimum value required
     */
    public void addQualificationRequirement(CharacteristicType characteristicType, int minimumValue) {
        qualificationRequirements.put(characteristicType, minimumValue);
    }

    /**
     * Adds a basic training skill for this career.
     *
     * @param skill The skill to add
     */
    public void addBasicTrainingSkill(Skill skill) {
        basicTrainingSkills.add(skill);
    }

    /**
     * Adds a service skill table entry for this career.
     *
     * @param diceRoll The dice roll result (1-6)
     * @param skill The skill gained
     */
    public void addServiceSkill(int diceRoll, Skill skill) {
        serviceSkillTables.add(new SkillTable(diceRoll, skill));
    }

    /**
     * Adds an advanced education skill table entry for this career.
     *
     * @param diceRoll The dice roll result (1-6)
     * @param skill The skill gained
     */
    public void addAdvancedEducationSkill(int diceRoll, Skill skill) {
        advancedEducationSkillTables.add(new SkillTable(diceRoll, skill));
    }

    /**
     * Adds a specialist skill table entry for this career.
     *
     * @param specialization The specialization name
     * @param diceRoll The dice roll result (1-6)
     * @param skill The skill gained
     */
    public void addSpecialistSkill(String specialization, int diceRoll, Skill skill) {
        specialistSkillTables.computeIfAbsent(specialization, k -> new ArrayList<>())
                            .add(new SkillTable(diceRoll, skill));
    }

    /**
     * Adds a rank for this career.
     *
     * @param rank The rank to add
     */
    public void addRank(Rank rank) {
        ranks.add(rank);
    }

    /**
     * Adds a mustering out benefit for this career.
     *
     * @param diceRoll The dice roll result (1-6)
     * @param benefit The benefit description
     * @param cashBenefit Whether this is a cash benefit
     */
    public void addMusteringOutBenefit(int diceRoll, String benefit, boolean cashBenefit) {
        musteringOutBenefits.add(new BenefitTable(diceRoll, benefit, cashBenefit));
    }

    /**
     * Checks if a character qualifies for this career based on their characteristics.
     *
     * @param characteristics The character's characteristics
     * @param diceRoll The qualification roll result
     * @return true if qualified, false otherwise
     */
    public boolean checkQualification(List<Characteristic> characteristics, int diceRoll) {
        // Apply qualification DM
        int modifiedRoll = diceRoll + qualificationDM;

        // Apply characteristic DMs
        for (Characteristic characteristic : characteristics) {
            Integer requiredValue = qualificationRequirements.get(characteristic.getType());
            if (requiredValue != null && characteristic.getValue() >= requiredValue) {
                modifiedRoll += 1; // +1 DM for each qualification met
            }
        }

        // In Traveller, typically need 8+ to qualify
        return modifiedRoll >= 8;
    }

    /**
     * Returns a string representation of the career.
     *
     * @return The career name
     */
    @Override
    public String toString() {
        return name;
    }
}
