package com.barrows.travller.api.model;

import lombok.Data;
import java.util.List;
import java.util.ArrayList;

/**
 * Represents a term served in a career.
 */
@Data
public class CareerTerm {
    private Career career;
    private int termNumber;
    private int rank;
    private List<Skill> skillsGained;
    private List<String> benefits;
    private boolean commissioned;
    private boolean advanced;
    private boolean survived;

    public CareerTerm(Career career, int termNumber) {
        this.career = career;
        this.termNumber = termNumber;
        this.rank = 0;
        this.skillsGained = new ArrayList<>();
        this.benefits = new ArrayList<>();
        this.commissioned = false;
        this.advanced = false;
        this.survived = true;
    }

    public void addSkill(Skill skill) {
        skillsGained.add(skill);
    }

    public void addBenefit(String benefit) {
        benefits.add(benefit);
    }
}
