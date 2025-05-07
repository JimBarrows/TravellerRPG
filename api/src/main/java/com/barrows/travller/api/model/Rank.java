package com.barrows.travller.api.model;

import lombok.Data;

/**
 * Represents a rank in a career.
 */
@Data
public class Rank {
    private int level;
    private String title;
    private Skill skillGained;
    private int promotionDM;

    public Rank(int level, String title) {
        this.level = level;
        this.title = title;
        this.promotionDM = 0;
    }

    public Rank(int level, String title, Skill skillGained) {
        this(level, title);
        this.skillGained = skillGained;
    }

    public Rank(int level, String title, Skill skillGained, int promotionDM) {
        this(level, title, skillGained);
        this.promotionDM = promotionDM;
    }
}
