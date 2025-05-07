package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import jakarta.persistence.*;

/**
 * Represents an animal in the Traveller RPG system.
 * Animals can be domestic, wild, mounts, or other types.
 */
@Entity
@Table(name = "animals")
@Data
@NoArgsConstructor
public class Animal {

    /**
     * The unique identifier for the animal.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the animal.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The type of animal.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnimalType type;

    /**
     * The description of the animal.
     */
    @Column(length = 1000)
    private String description;

    /**
     * The size of the animal (in kg).
     */
    private BigDecimal weight;

    /**
     * The typical habitat of the animal.
     */
    private String habitat;

    /**
     * The movement speed of the animal (in meters per action).
     */
    private int movementSpeed;

    /**
     * The armor rating of the animal (natural protection).
     */
    private int armorRating;

    /**
     * The weapons or attacks the animal possesses.
     */
    @ElementCollection
    @CollectionTable(name = "animal_attacks", joinColumns = @JoinColumn(name = "animal_id"))
    @Column(name = "attack")
    private List<String> attacks;

    /**
     * The strength of the animal (used for physical tasks).
     */
    private int strength;

    /**
     * The dexterity of the animal (used for agility and speed).
     */
    private int dexterity;

    /**
     * The endurance of the animal (used for stamina and health).
     */
    private int endurance;

    /**
     * The intelligence of the animal (used for problem-solving).
     */
    private int intelligence;

    /**
     * Special abilities or traits of the animal.
     */
    @ElementCollection
    @CollectionTable(name = "animal_special_traits", joinColumns = @JoinColumn(name = "animal_id"))
    @Column(name = "trait")
    private List<String> specialTraits;

    /**
     * The typical cost to purchase this animal (in credits).
     */
    private int cost;

    /**
     * The tech level required to handle or breed this animal.
     */
    private int techLevel;

    /**
     * Whether the animal is domesticated.
     */
    private boolean domesticated;

    /**
     * Whether the animal is trainable.
     */
    private boolean trainable;

    /**
     * Creates a new animal with the specified name and type.
     *
     * @param name The name of the animal
     * @param type The type of animal
     */
    public Animal(String name, AnimalType type) {
        this.name = name;
        this.type = type;
        this.description = "";
        this.weight = BigDecimal.ZERO;
        this.habitat = "";
        this.movementSpeed = 0;
        this.armorRating = 0;
        this.attacks = new ArrayList<>();
        this.strength = 0;
        this.dexterity = 0;
        this.endurance = 0;
        this.intelligence = 0;
        this.specialTraits = new ArrayList<>();
        this.cost = 0;
        this.techLevel = 0;
        this.domesticated = false;
        this.trainable = false;
    }

    /**
     * Adds an attack to the animal's arsenal.
     *
     * @param attack The attack description (e.g., "Bite: 2D damage")
     */
    public void addAttack(String attack) {
        attacks.add(attack);
    }

    /**
     * Adds a special trait to the animal.
     *
     * @param trait The special trait description
     */
    public void addSpecialTrait(String trait) {
        specialTraits.add(trait);
    }

    /**
     * Calculates the carrying capacity of the animal (if it can be used as a mount or beast of burden).
     *
     * @return The carrying capacity in kg, or 0 if not suitable as a beast of burden
     */
    public BigDecimal getCarryingCapacity() {
        if (type == AnimalType.MOUNT || type == AnimalType.LIVESTOCK) {
            return BigDecimal.valueOf(strength * 10.0); // Simple formula: 10kg per point of strength
        }
        return BigDecimal.ZERO;
    }

    /**
     * Determines if the animal is dangerous to humans.
     *
     * @return true if the animal is dangerous, false otherwise
     */
    public boolean isDangerous() {
        return type == AnimalType.DANGEROUS || type == AnimalType.WILD_CARNIVORE ||
               (type == AnimalType.WILD_OMNIVORE && !domesticated);
    }

    /**
     * Returns a string representation of the animal.
     *
     * @return A string with the animal's basic information
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(name).append(" (").append(type.getDisplayName()).append(")\n");

        if (!description.isEmpty()) {
            sb.append("Description: ").append(description).append("\n");
        }

        sb.append("Weight: ").append(weight).append(" kg\n");

        if (!attacks.isEmpty()) {
            sb.append("Attacks: ");
            for (String attack : attacks) {
                sb.append(attack).append(", ");
            }
            sb.delete(sb.length() - 2, sb.length()); // Remove trailing comma and space
            sb.append("\n");
        }

        if (!specialTraits.isEmpty()) {
            sb.append("Special Traits: ");
            for (String trait : specialTraits) {
                sb.append(trait).append(", ");
            }
            sb.delete(sb.length() - 2, sb.length()); // Remove trailing comma and space
        }

        return sb.toString();
    }
}
