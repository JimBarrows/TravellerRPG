package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import jakarta.persistence.*;

/**
 * Represents an equipment item in the Traveller RPG system.
 * Equipment includes various items that characters can purchase and use.
 */
@Entity
@Table(name = "equipment")
@Data
@NoArgsConstructor
public class Equipment {

    /**
     * The unique identifier for the equipment.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the equipment.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The type of equipment.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EquipmentType type;

    /**
     * The description of the equipment.
     */
    @Column(length = 1000)
    private String description;

    /**
     * The tech level required to manufacture this equipment.
     */
    private int techLevel;

    /**
     * The cost of the equipment in credits.
     */
    private int cost;

    /**
     * The weight of the equipment in kg.
     */
    private BigDecimal weight;

    /**
     * The availability of the equipment (Common, Uncommon, Rare, etc.).
     */
    private String availability;

    /**
     * Whether the equipment requires a permit to purchase or use.
     */
    private boolean requiresPermit;

    /**
     * The law level at which this equipment becomes restricted.
     */
    private int restrictedLawLevel;

    /**
     * The skill required to use this equipment effectively.
     */
    private String requiredSkill;

    /**
     * The bonus provided to skill checks when using this equipment.
     */
    private int skillBonus;

    /**
     * Special features or capabilities of the equipment.
     */
    @ElementCollection
    @CollectionTable(name = "equipment_features", joinColumns = @JoinColumn(name = "equipment_id"))
    @Column(name = "feature")
    private List<String> features;

    /**
     * The power requirements of the equipment (if any).
     */
    private String powerRequirements;

    /**
     * The maintenance requirements of the equipment.
     */
    private String maintenanceRequirements;

    /**
     * The durability of the equipment (how well it withstands damage).
     */
    private int durability;

    /**
     * The current condition of the equipment (100% = perfect).
     */
    private int condition;

    /**
     * Creates a new equipment item with the specified name and type.
     *
     * @param name The name of the equipment
     * @param type The type of equipment
     */
    public Equipment(String name, EquipmentType type) {
        this.name = name;
        this.type = type;
        this.description = "";
        this.techLevel = 0;
        this.cost = 0;
        this.weight = BigDecimal.ZERO;
        this.availability = "Common";
        this.requiresPermit = false;
        this.restrictedLawLevel = 0;
        this.requiredSkill = "";
        this.skillBonus = 0;
        this.features = new ArrayList<>();
        this.powerRequirements = "";
        this.maintenanceRequirements = "";
        this.durability = 10;
        this.condition = 100;
    }

    /**
     * Adds a feature to the equipment.
     *
     * @param feature The feature description
     */
    public void addFeature(String feature) {
        features.add(feature);
    }

    /**
     * Applies damage to the equipment, reducing its condition.
     *
     * @param amount The amount of damage to apply
     * @return The new condition value
     */
    public int applyDamage(int amount) {
        condition = Math.max(0, condition - amount);
        return condition;
    }

    /**
     * Repairs the equipment, improving its condition.
     *
     * @param amount The amount to repair
     * @return The new condition value
     */
    public int repair(int amount) {
        condition = Math.min(100, condition + amount);
        return condition;
    }

    /**
     * Checks if the equipment is functional.
     *
     * @return true if the condition is above 0, false otherwise
     */
    public boolean isFunctional() {
        return condition > 0;
    }

    /**
     * Checks if the equipment is legal at the specified law level.
     *
     * @param lawLevel The law level to check against
     * @return true if legal, false if restricted
     */
    public boolean isLegalAt(int lawLevel) {
        return lawLevel < restrictedLawLevel || !requiresPermit;
    }


    /**
     * Returns a string representation of the equipment.
     *
     * @return A string with the equipment's basic information
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(name).append(" (").append(type.getDisplayName()).append(")\n");

        if (!description.isEmpty()) {
            sb.append("Description: ").append(description).append("\n");
        }

        sb.append("TL: ").append(techLevel).append(", ");
        sb.append("Cost: ").append(cost).append(" Cr, ");
        sb.append("Weight: ").append(weight).append(" kg\n");

        if (!features.isEmpty()) {
            sb.append("Features: ");
            for (String feature : features) {
                sb.append(feature).append(", ");
            }
            sb.delete(sb.length() - 2, sb.length()); // Remove trailing comma and space
            sb.append("\n");
        }

        sb.append("Condition: ").append(condition).append("%");

        return sb.toString();
    }
}
