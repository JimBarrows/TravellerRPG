package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

/**
 * Represents a rank in a career.
 */
@Entity
@Table(name = "ranks")
@Data
@NoArgsConstructor
public class Rank {
    /**
     * The unique identifier for the rank.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The level of the rank (0 = entry level, higher numbers = higher ranks).
     */
    private int level;

    /**
     * The title of the rank (e.g., "Lieutenant", "Captain", etc.).
     */
    @Column(nullable = false)
    private String title;

    /**
     * The skill gained when achieving this rank.
     */
    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skillGained;

    /**
     * The dice modifier applied to promotion rolls for this rank.
     */
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
