package com.barrows.travller.api.model;

import lombok.Data;

/**
 * Represents a skill table entry in a career.
 */
@Data
public class SkillTable {
    private int diceRoll;
    private Skill skill;

    public SkillTable(int diceRoll, Skill skill) {
        this.diceRoll = diceRoll;
        this.skill = skill;
    }
}
