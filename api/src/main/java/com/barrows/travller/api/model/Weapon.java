package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import jakarta.persistence.*;

/**
 * Represents a weapon in the Traveller RPG system.
 * Weapons are used in combat and have various properties that affect their use.
 */
@Entity
@Table(name = "weapons")
@Data
@NoArgsConstructor
public class Weapon {

    /**
     * The unique identifier for the weapon.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the weapon.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The type of weapon.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WeaponType type;

    /**
     * The tech level required to manufacture this weapon.
     */
    private int techLevel;

    /**
     * The damage formula for this weapon (e.g., "3d6", "2d6+3").
     */
    @Column(nullable = false)
    private String damageFormula;

    /**
     * The range of the weapon in meters.
     * For melee weapons, this is typically 0.
     */
    private int range;

    /**
     * Whether the weapon can be used for automatic fire.
     */
    private boolean automatic;

    /**
     * The number of rounds the weapon can fire before reloading.
     */
    private int magazine;

    /**
     * The cost of the weapon in credits.
     */
    private int cost;

    /**
     * The weight of the weapon in kg.
     */
    private BigDecimal weight;

    /**
     * The skill used with this weapon.
     */
    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    /**
     * Creates a new weapon with the specified properties.
     *
     * @param name The name of the weapon
     * @param type The type of weapon
     * @param techLevel The tech level required
     * @param damageFormula The damage formula
     * @param range The range in meters
     * @param skill The skill used with this weapon
     */
    public Weapon(String name, WeaponType type, int techLevel, String damageFormula, int range, Skill skill) {
        this.name = name;
        this.type = type;
        this.techLevel = techLevel;
        this.damageFormula = damageFormula;
        this.range = range;
        this.skill = skill;
        this.automatic = false;
        this.magazine = 0;
        this.cost = 0;
        this.weight = BigDecimal.ZERO;
    }

    /**
     * Creates a new melee weapon.
     *
     * @param name The name of the weapon
     * @param techLevel The tech level required
     * @param damageFormula The damage formula
     * @param skill The skill used with this weapon
     * @return A new melee weapon
     */
    public static Weapon createMeleeWeapon(String name, int techLevel, String damageFormula, Skill skill) {
        return new Weapon(name, WeaponType.MELEE, techLevel, damageFormula, 0, skill);
    }

    /**
     * Creates a new ranged weapon.
     *
     * @param name The name of the weapon
     * @param type The type of weapon
     * @param techLevel The tech level required
     * @param damageFormula The damage formula
     * @param range The range in meters
     * @param magazine The magazine capacity
     * @param automatic Whether it can fire automatically
     * @param skill The skill used with this weapon
     * @return A new ranged weapon
     */
    public static Weapon createRangedWeapon(String name, WeaponType type, int techLevel, String damageFormula,
                                           int range, int magazine, boolean automatic, Skill skill) {
        Weapon weapon = new Weapon(name, type, techLevel, damageFormula, range, skill);
        weapon.setMagazine(magazine);
        weapon.setAutomatic(automatic);
        return weapon;
    }

    /**
     * Creates a new explosive weapon.
     *
     * @param name The name of the weapon
     * @param techLevel The tech level required
     * @param damageFormula The damage formula
     * @param range The range in meters
     * @param skill The skill used with this weapon
     * @return A new explosive weapon
     */
    public static Weapon createExplosiveWeapon(String name, int techLevel, String damageFormula, int range, Skill skill) {
        return new Weapon(name, WeaponType.EXPLOSIVE, techLevel, damageFormula, range, skill);
    }

    /**
     * Checks if this is a melee weapon.
     *
     * @return true if melee, false otherwise
     */
    public boolean isMelee() {
        return type == WeaponType.MELEE || type == WeaponType.NATURAL;
    }

    /**
     * Checks if this is a ranged weapon.
     *
     * @return true if ranged, false otherwise
     */
    public boolean isRanged() {
        return !isMelee();
    }

    /**
     * Checks if this is an explosive weapon.
     *
     * @return true if explosive, false otherwise
     */
    public boolean isExplosive() {
        return type == WeaponType.EXPLOSIVE;
    }


    /**
     * Returns a string representation of the weapon.
     *
     * @return A string in the format "Name (Damage)"
     */
    @Override
    public String toString() {
        return name + " (" + damageFormula + ")";
    }
}
