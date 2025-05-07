package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

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
}
