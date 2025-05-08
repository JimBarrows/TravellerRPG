package com.barrows.travller.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a character characteristic in the Traveller RPG system.
 * Characteristics include Strength, Dexterity, Endurance, Intelligence, Education, and Social Standing.
 * Each characteristic has a value between 2 and 12 (typically rolled with 2d6).
 */
@Entity
@Table(name = "characteristics")
@Data
@NoArgsConstructor
public class Characteristic {

    /**
     * The unique identifier for the characteristic.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The type of characteristic.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CharacteristicType type;

    /**
     * The current value of the characteristic (2-12).
     */
    @Min(0)
    private int value;

    /**
     * The original value of the characteristic before any modifications.
     * This is useful for tracking aging effects or other temporary/permanent changes.
     */
    @Min(0)
    private int originalValue;

    /**
     * Creates a new characteristic with the specified type and value.
     *
     * @param type The type of characteristic
     * @param value The initial value (2-12)
     */
    public Characteristic(CharacteristicType type, int value) {
        this.type = type;
        this.value = value;
        this.originalValue = value;
    }

    /**
     * Returns the modifier for this characteristic.
     * In Traveller, characteristic modifiers are typically:
     * 0-1: -3
     * 2-3: -2
     * 4-5: -1
     * 6-8: 0
     * 9-11: +1
     * 12-14: +2
     * 15+: +3
     *
     * @return The modifier value
     */
    public int getModifier() {
        if (value <= 1) return -3;
        if (value <= 3) return -2;
        if (value <= 5) return -1;
        if (value <= 8) return 0;
        if (value <= 11) return 1;
        if (value <= 14) return 2;
        return 3;
    }

    /**
     * Applies damage to this characteristic (typically physical characteristics).
     *
     * @param amount The amount of damage to apply
     * @return The new value after damage
     */
    public int applyDamage(int amount) {
        value = Math.max(0, value - amount);
        return value;
    }

    /**
     * Heals damage to this characteristic.
     *
     * @param amount The amount to heal
     * @return The new value after healing
     */
    public int heal(int amount) {
        value = Math.min(originalValue, value + amount);
        return value;
    }

    /**
     * Applies aging effects to this characteristic.
     *
     * @param reduction The amount to reduce due to aging
     * @return The new value after aging
     */
    public int applyAging(int reduction) {
        value = Math.max(0, value - reduction);
        originalValue = Math.max(0, originalValue - reduction);
        return value;
    }
}
