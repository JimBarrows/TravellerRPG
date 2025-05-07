package com.barrows.travller.api.model;

import lombok.Data;

/**
 * Represents a benefit table entry for mustering out.
 */
@Data
public class BenefitTable {
    private int diceRoll;
    private String benefit;
    private boolean cashBenefit;

    public BenefitTable(int diceRoll, String benefit, boolean cashBenefit) {
        this.diceRoll = diceRoll;
        this.benefit = benefit;
        this.cashBenefit = cashBenefit;
    }
}
