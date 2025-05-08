package com.barrows.travller.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents a skill table entry in a career.
 */
@Entity
@Table(name = "skill_tables")
@Data
@NoArgsConstructor
public class SkillTable {
    /**
     * The unique identifier for the skill table entry.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The dice roll result that corresponds to this skill.
     */
    private int diceRoll;

    /**
     * The skill gained from this table entry.
     */
    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    public SkillTable(int diceRoll, Skill skill) {
        this.diceRoll = diceRoll;
        this.skill = skill;
    }

    /**
     * Gets a list containing the skill from this table entry.
     * This is a convenience method for code that expects a list of skills.
     *
     * @return A list containing the single skill from this table entry
     */
    public List<Skill> getSkills() {
        return skill != null ? List.of(skill) : List.of();
    }
}
