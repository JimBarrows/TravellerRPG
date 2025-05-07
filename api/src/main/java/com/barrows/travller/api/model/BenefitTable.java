package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

/**
 * Represents a benefit table entry for mustering out.
 */
@Entity
@Table(name = "benefit_tables")
@Data
@NoArgsConstructor
public class BenefitTable {
    /**
     * The unique identifier for the benefit table entry.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The dice roll result that corresponds to this benefit.
     */
    private int diceRoll;

    /**
     * The benefit description.
     */
    @Column(nullable = false)
    private String benefit;

    /**
     * Whether this is a cash benefit.
     */
    private boolean cashBenefit;

    public BenefitTable(int diceRoll, String benefit, boolean cashBenefit) {
        this.diceRoll = diceRoll;
        this.benefit = benefit;
        this.cashBenefit = cashBenefit;
    }
}
