package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;

/**
 * Represents a term served in a career.
 */
@Entity
@Table(name = "career_terms")
@Data
@NoArgsConstructor
public class CareerTerm {
    /**
     * The unique identifier for the career term.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The career this term was served in.
     */
    @NotNull
    @ManyToOne
    @JoinColumn(name = "career_id")
    private Career career;

    /**
     * The term number (1 = first term, 2 = second term, etc.).
     */
    @Min(1)
    private int termNumber;

    /**
     * The rank achieved during this term.
     */
    @Min(0)
    @Max(6)
    private int rank;

    /**
     * The skills gained during this term.
     */
    @ManyToMany
    @JoinTable(
        name = "career_term_skills",
        joinColumns = @JoinColumn(name = "career_term_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private List<Skill> skillsGained;

    /**
     * The benefits gained during this term.
     */
    @ElementCollection
    @CollectionTable(name = "career_term_benefits", joinColumns = @JoinColumn(name = "career_term_id"))
    @Column(name = "benefit")
    private List<String> benefits;

    /**
     * Whether the character was commissioned during this term.
     */
    private boolean commissioned;

    /**
     * Whether the character was advanced during this term.
     */
    private boolean advanced;

    /**
     * Whether the character survived this term.
     */
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
