package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

/**
 * Represents armor in the Traveller RPG system.
 * Armor provides protection against damage in combat.
 */
@Entity
@Table(name = "armor")
@Data
@NoArgsConstructor
public class Armor {

    /**
     * The unique identifier for the armor.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the armor.
     */
    @NotNull
    @NotEmpty
    @Column(nullable = false)
    private String name;

    /**
     * The tech level required to manufacture this armor.
     */
    @Min(0)
    @Max(15)
    private int techLevel;

    /**
     * The protection value against physical damage.
     */
    @Min(0)
    private int protection;

    /**
     * The protection value against energy weapons.
     */
    @Min(0)
    private int energyProtection;

    /**
     * The protection value against radiation.
     */
    @Min(0)
    private int radiationProtection;

    /**
     * The cost of the armor in credits.
     */
    @Min(0)
    private int cost;

    /**
     * The weight of the armor in kg.
     */
    private BigDecimal weight;

    /**
     * Whether the armor is powered (e.g., battle dress).
     */
    private boolean powered;

    /**
     * The type of armor.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ArmorType type;

    /**
     * Creates a new armor with the specified properties.
     *
     * @param name The name of the armor
     * @param type The type of armor
     * @param techLevel The tech level required
     * @param protection The protection value
     */
    public Armor(String name, ArmorType type, int techLevel, int protection) {
        this.name = name;
        this.type = type;
        this.techLevel = techLevel;
        this.protection = protection;
        this.energyProtection = protection;
        this.radiationProtection = 0;
        this.cost = 0;
        this.weight = BigDecimal.ZERO;
        this.powered = false;
    }

    /**
     * Creates a new armor with different protection values for different damage types.
     *
     * @param name The name of the armor
     * @param type The type of armor
     * @param techLevel The tech level required
     * @param protection The protection value against physical damage
     * @param energyProtection The protection value against energy weapons
     * @param radiationProtection The protection value against radiation
     */
    public Armor(String name, ArmorType type, int techLevel, int protection, int energyProtection, int radiationProtection) {
        this(name, type, techLevel, protection);
        this.energyProtection = energyProtection;
        this.radiationProtection = radiationProtection;
    }

    /**
     * Creates a new powered armor.
     *
     * @param name The name of the armor
     * @param type The type of armor
     * @param techLevel The tech level required
     * @param protection The protection value
     * @param energyProtection The protection value against energy weapons
     * @param radiationProtection The protection value against radiation
     * @return A new powered armor
     */
    public static Armor createPoweredArmor(String name, ArmorType type, int techLevel, int protection,
                                          int energyProtection, int radiationProtection) {
        Armor armor = new Armor(name, type, techLevel, protection, energyProtection, radiationProtection);
        armor.setPowered(true);
        return armor;
    }

    /**
     * Calculates the damage reduction for a given attack.
     *
     * @param damage The incoming damage
     * @param isEnergyWeapon Whether the attack is from an energy weapon
     * @return The reduced damage after armor protection
     */
    public int reduceDamage(int damage, boolean isEnergyWeapon) {
        int protectionValue = isEnergyWeapon ? energyProtection : protection;
        return Math.max(0, damage - protectionValue);
    }

    /**
     * Reduces radiation damage.
     *
     * @param radiation The incoming radiation damage
     * @return The reduced radiation damage after armor protection
     */
    public int reduceRadiation(int radiation) {
        return Math.max(0, radiation - radiationProtection);
    }


    /**
     * Returns a string representation of the armor.
     *
     * @return A string in the format "Name (Protection)"
     */
    @Override
    public String toString() {
        if (protection == energyProtection) {
            return name + " (Protection: " + protection + ")";
        } else {
            return name + " (Physical: " + protection + ", Energy: " + energyProtection + ")";
        }
    }
}
