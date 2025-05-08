package com.barrows.travller.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a skill in the Traveller RPG system.
 * Skills are abilities that characters can learn and improve through training and experience.
 */
@Entity
@Table(name = "skills")
@Data
@NoArgsConstructor
public class Skill {

    /**
     * The unique identifier for the skill.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the skill.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The level of expertise in this skill (0 = untrained, 1+ = trained levels).
     */
    private int level;

    /**
     * The category this skill belongs to.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillCategory category;

    /**
     * The characteristic most associated with this skill.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CharacteristicType primaryCharacteristic;

    /**
     * Creates a new skill with the specified name and level.
     *
     * @param name The name of the skill
     * @param level The initial level (0 = untrained)
     * @param category The category this skill belongs to
     * @param primaryCharacteristic The characteristic most associated with this skill
     */
    public Skill(String name, int level, SkillCategory category, CharacteristicType primaryCharacteristic) {
        this.name = name;
        this.level = level;
        this.category = category;
        this.primaryCharacteristic = primaryCharacteristic;
    }

    /**
     * Creates a new untrained skill.
     *
     * @param name The name of the skill
     * @param category The category this skill belongs to
     * @param primaryCharacteristic The characteristic most associated with this skill
     */
    public Skill(String name, SkillCategory category, CharacteristicType primaryCharacteristic) {
        this(name, 0, category, primaryCharacteristic);
    }

    /**
     * Increases the skill level by 1.
     *
     * @return The new skill level
     */
    public int increaseLevel() {
        level++;
        return level;
    }

    /**
     * Increases the skill level by the specified amount.
     *
     * @param amount The amount to increase the level by
     * @return The new skill level
     */
    public int increaseLevel(int amount) {
        level += amount;
        return level;
    }

    /**
     * Checks if the character is trained in this skill (level > 0).
     *
     * @return true if trained, false if untrained
     */
    public boolean isTrained() {
        return level > 0;
    }

    /**
     * Returns a string representation of the skill with its level.
     *
     * @return A string in the format "Skill Name-1" (or just "Skill Name" for level 0)
     */
    @Override
    public String toString() {
        if (level == 0) {
            return name;
        } else {
            return name + "-" + level;
        }
    }
}
