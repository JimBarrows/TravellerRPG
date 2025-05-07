package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import jakarta.persistence.*;

/**
 * Represents a vehicle in the Traveller RPG system.
 * Vehicles are used for transportation, combat, and exploration.
 */
@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
public class Vehicle {

    /**
     * The unique identifier for the vehicle.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the vehicle.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The type of vehicle.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType type;

    /**
     * The description of the vehicle.
     */
    @Column(length = 1000)
    private String description;

    /**
     * The tech level required to manufacture this vehicle.
     */
    private int techLevel;

    /**
     * The cost of the vehicle in credits.
     */
    private int cost;

    /**
     * The weight of the vehicle in tons.
     */
    private BigDecimal weight;

    /**
     * The availability of the vehicle (Common, Uncommon, Rare, etc.).
     */
    private String availability;

    /**
     * Whether the vehicle requires a permit to purchase or operate.
     */
    private boolean requiresPermit;

    /**
     * The law level at which this vehicle becomes restricted.
     */
    private int restrictedLawLevel;

    /**
     * The skill required to operate this vehicle.
     */
    private String requiredSkill;

    /**
     * The number of crew required to operate the vehicle.
     */
    private int crewRequired;

    /**
     * The number of passengers the vehicle can carry.
     */
    private int passengerCapacity;

    /**
     * The cargo capacity in tons.
     */
    private BigDecimal cargoCapacity;

    /**
     * The maximum speed of the vehicle in km/h.
     */
    private int maxSpeed;

    /**
     * The cruising speed of the vehicle in km/h.
     */
    private int cruisingSpeed;

    /**
     * The range of the vehicle in km.
     */
    private int range;

    /**
     * The armor rating of the vehicle.
     */
    private int armorRating;

    /**
     * The current hull points of the vehicle.
     */
    private int hullPoints;

    /**
     * The maximum hull points of the vehicle.
     */
    private int maxHullPoints;

    /**
     * Special features or capabilities of the vehicle.
     */
    @ElementCollection
    @CollectionTable(name = "vehicle_features", joinColumns = @JoinColumn(name = "vehicle_id"))
    @Column(name = "feature")
    private List<String> features;

    /**
     * Weapons mounted on the vehicle.
     */
    @ElementCollection
    @CollectionTable(name = "vehicle_weapons", joinColumns = @JoinColumn(name = "vehicle_id"))
    @Column(name = "weapon")
    private List<String> weapons;

    /**
     * The fuel type used by the vehicle.
     */
    private String fuelType;

    /**
     * The fuel consumption rate.
     */
    private String fuelConsumption;

    /**
     * The maintenance requirements of the vehicle.
     */
    private String maintenanceRequirements;

    /**
     * The current condition of the vehicle (100% = perfect).
     */
    private int condition;

    /**
     * Creates a new vehicle with the specified name and type.
     *
     * @param name The name of the vehicle
     * @param type The type of vehicle
     */
    public Vehicle(String name, VehicleType type) {
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
        this.crewRequired = 1;
        this.passengerCapacity = 0;
        this.cargoCapacity = BigDecimal.ZERO;
        this.maxSpeed = 0;
        this.cruisingSpeed = 0;
        this.range = 0;
        this.armorRating = 0;
        this.hullPoints = 10;
        this.maxHullPoints = 10;
        this.features = new ArrayList<>();
        this.weapons = new ArrayList<>();
        this.fuelType = "";
        this.fuelConsumption = "";
        this.maintenanceRequirements = "";
        this.condition = 100;
    }

    /**
     * Adds a feature to the vehicle.
     *
     * @param feature The feature description
     */
    public void addFeature(String feature) {
        features.add(feature);
    }

    /**
     * Adds a weapon to the vehicle.
     *
     * @param weapon The weapon description
     */
    public void addWeapon(String weapon) {
        weapons.add(weapon);
    }

    /**
     * Applies damage to the vehicle, reducing its hull points.
     *
     * @param amount The amount of damage to apply
     * @return The new hull points value
     */
    public int applyDamage(int amount) {
        // Apply armor reduction
        int actualDamage = Math.max(0, amount - armorRating);

        // Apply damage to hull
        hullPoints = Math.max(0, hullPoints - actualDamage);

        // If hull points reach 0, the vehicle is disabled
        if (hullPoints == 0) {
            condition = 0;
        } else {
            // Reduce condition proportionally to damage
            int conditionLoss = (actualDamage * 100) / maxHullPoints;
            condition = Math.max(0, condition - conditionLoss);
        }

        return hullPoints;
    }

    /**
     * Repairs the vehicle, improving its hull points and condition.
     *
     * @param amount The amount to repair
     * @return The new hull points value
     */
    public int repair(int amount) {
        hullPoints = Math.min(maxHullPoints, hullPoints + amount);

        // Improve condition based on repair amount
        int conditionImprovement = (amount * 100) / maxHullPoints;
        condition = Math.min(100, condition + conditionImprovement);

        return hullPoints;
    }

    /**
     * Performs maintenance on the vehicle, improving its condition.
     *
     * @param skillCheck The result of the maintenance skill check
     * @return true if maintenance was successful, false otherwise
     */
    public boolean performMaintenance(int skillCheck) {
        // Basic threshold for successful maintenance
        boolean success = skillCheck >= 8;

        if (success) {
            // Successful maintenance improves condition
            condition = Math.min(100, condition + 10);
        } else {
            // Failed maintenance might worsen condition
            if (skillCheck <= 2) {
                condition = Math.max(0, condition - 10);
            }
        }

        return success;
    }

    /**
     * Checks if the vehicle is operational.
     *
     * @return true if the vehicle is operational, false otherwise
     */
    public boolean isOperational() {
        return hullPoints > 0 && condition > 20;
    }

    /**
     * Checks if the vehicle is legal at the specified law level.
     *
     * @param lawLevel The law level to check against
     * @return true if legal, false if restricted
     */
    public boolean isLegalAt(int lawLevel) {
        return lawLevel < restrictedLawLevel || !requiresPermit;
    }

    /**
     * Calculates the skill check modifier based on the vehicle's condition.
     *
     * @return The modifier to apply to skill checks when operating this vehicle
     */
    public int getOperationSkillModifier() {
        if (condition >= 90) return 1;  // Excellent condition gives a bonus
        if (condition >= 70) return 0;  // Good condition, no modifier
        if (condition >= 50) return -1; // Fair condition, small penalty
        if (condition >= 30) return -2; // Poor condition, moderate penalty
        return -3;                      // Bad condition, severe penalty
    }


    /**
     * Returns a string representation of the vehicle.
     *
     * @return A string with the vehicle's basic information
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
        sb.append("Weight: ").append(weight).append(" tons\n");

        sb.append("Crew: ").append(crewRequired).append(", ");
        sb.append("Passengers: ").append(passengerCapacity).append(", ");
        sb.append("Cargo: ").append(cargoCapacity).append(" tons\n");

        sb.append("Speed: ").append(maxSpeed).append(" km/h, ");
        sb.append("Range: ").append(range).append(" km\n");

        sb.append("Hull: ").append(hullPoints).append("/").append(maxHullPoints).append(", ");
        sb.append("Armor: ").append(armorRating).append(", ");
        sb.append("Condition: ").append(condition).append("%\n");

        if (!weapons.isEmpty()) {
            sb.append("Weapons: ");
            for (String weapon : weapons) {
                sb.append(weapon).append(", ");
            }
            sb.delete(sb.length() - 2, sb.length()); // Remove trailing comma and space
            sb.append("\n");
        }

        if (!features.isEmpty()) {
            sb.append("Features: ");
            for (String feature : features) {
                sb.append(feature).append(", ");
            }
            sb.delete(sb.length() - 2, sb.length()); // Remove trailing comma and space
        }

        return sb.toString();
    }
}
