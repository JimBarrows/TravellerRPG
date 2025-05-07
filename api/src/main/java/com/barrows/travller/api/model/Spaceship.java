package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import jakarta.persistence.*;

/**
 * Represents a spaceship in the Traveller RPG system.
 * Spaceships are used for interstellar travel, combat, trading, and exploration.
 */
@Entity
@Table(name = "spaceships")
@Data
@NoArgsConstructor
public class Spaceship {

    /**
     * The unique identifier for the spaceship.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the spaceship.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The type of spaceship.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpaceshipType type;

    /**
     * The description of the spaceship.
     */
    @Column(length = 1000)
    private String description;

    /**
     * The tech level required to manufacture this spaceship.
     */
    private int techLevel;

    /**
     * The cost of the spaceship in credits (MCr = millions of credits).
     */
    private BigDecimal costMCr;

    /**
     * The displacement tonnage of the spaceship.
     */
    private int displacementTons;

    /**
     * The availability of the spaceship (Common, Uncommon, Rare, etc.).
     */
    private String availability;

    /**
     * Whether the spaceship requires a permit to purchase or operate.
     */
    private boolean requiresPermit;

    /**
     * The law level at which this spaceship becomes restricted.
     */
    private int restrictedLawLevel;

    /**
     * The skill required to operate this spaceship.
     */
    private String requiredSkill;

    /**
     * The number of crew required to operate the spaceship.
     */
    private int crewRequired;

    /**
     * The number of passengers the spaceship can carry.
     */
    private int passengerCapacity;

    /**
     * The cargo capacity in tons.
     */
    private BigDecimal cargoCapacity;

    /**
     * The jump drive rating (0 = no jump drive, 1-6 = jump capability).
     */
    private int jumpDriveRating;

    /**
     * The maneuver drive rating (thrust in G).
     */
    private int maneuverDriveRating;

    /**
     * The power plant rating.
     */
    private int powerPlantRating;

    /**
     * The armor rating of the spaceship.
     */
    private int armorRating;

    /**
     * The current hull points of the spaceship.
     */
    private int hullPoints;

    /**
     * The maximum hull points of the spaceship.
     */
    private int maxHullPoints;

    /**
     * The current structure points of the spaceship.
     */
    private int structurePoints;

    /**
     * The maximum structure points of the spaceship.
     */
    private int maxStructurePoints;

    /**
     * Special features or capabilities of the spaceship.
     */
    @ElementCollection
    @CollectionTable(name = "spaceship_features", joinColumns = @JoinColumn(name = "spaceship_id"))
    @Column(name = "feature")
    private List<String> features;

    /**
     * Weapons mounted on the spaceship.
     */
    @ElementCollection
    @CollectionTable(name = "spaceship_weapons", joinColumns = @JoinColumn(name = "spaceship_id"))
    @Column(name = "weapon")
    private List<String> weapons;

    /**
     * The fuel capacity in tons.
     */
    private BigDecimal fuelCapacity;

    /**
     * Whether the spaceship has a fuel scoop.
     */
    private boolean hasFuelScoop;

    /**
     * The fuel consumption rate per jump.
     */
    private BigDecimal fuelConsumptionPerJump;

    /**
     * The maintenance requirements of the spaceship.
     */
    private String maintenanceRequirements;

    /**
     * The annual maintenance cost in credits.
     */
    private BigDecimal annualMaintenanceCost;

    /**
     * The current condition of the spaceship (100% = perfect).
     */
    private int condition;

    /**
     * Creates a new spaceship with the specified name and type.
     *
     * @param name The name of the spaceship
     * @param type The type of spaceship
     */
    public Spaceship(String name, SpaceshipType type) {
        this.name = name;
        this.type = type;
        this.description = "";
        this.techLevel = 0;
        this.costMCr = BigDecimal.ZERO;
        this.displacementTons = 0;
        this.availability = "Rare";
        this.requiresPermit = true;
        this.restrictedLawLevel = 0;
        this.requiredSkill = "";
        this.crewRequired = 1;
        this.passengerCapacity = 0;
        this.cargoCapacity = BigDecimal.ZERO;
        this.jumpDriveRating = 0;
        this.maneuverDriveRating = 0;
        this.powerPlantRating = 0;
        this.armorRating = 0;
        this.hullPoints = 100;
        this.maxHullPoints = 100;
        this.structurePoints = 20;
        this.maxStructurePoints = 20;
        this.features = new ArrayList<>();
        this.weapons = new ArrayList<>();
        this.fuelCapacity = BigDecimal.ZERO;
        this.hasFuelScoop = false;
        this.fuelConsumptionPerJump = BigDecimal.ZERO;
        this.maintenanceRequirements = "";
        this.annualMaintenanceCost = BigDecimal.ZERO;
        this.condition = 100;
    }

    /**
     * Adds a feature to the spaceship.
     *
     * @param feature The feature description
     */
    public void addFeature(String feature) {
        features.add(feature);
    }

    /**
     * Adds a weapon to the spaceship.
     *
     * @param weapon The weapon description
     */
    public void addWeapon(String weapon) {
        weapons.add(weapon);
    }

    /**
     * Applies damage to the spaceship, reducing its hull points.
     *
     * @param amount The amount of damage to apply
     * @return The new hull points value
     */
    public int applyDamage(int amount) {
        // Apply armor reduction
        int actualDamage = Math.max(0, amount - armorRating);

        // Apply damage to hull
        hullPoints = Math.max(0, hullPoints - actualDamage);

        // If hull points reach 0, damage starts affecting structure
        if (hullPoints == 0 && actualDamage > 0) {
            structurePoints = Math.max(0, structurePoints - (actualDamage / 2));
        }

        // If structure points reach 0, the ship is destroyed
        if (structurePoints == 0) {
            condition = 0;
        } else {
            // Reduce condition proportionally to damage
            int conditionLoss = (actualDamage * 100) / maxHullPoints;
            condition = Math.max(0, condition - conditionLoss);
        }

        return hullPoints;
    }

    /**
     * Repairs the spaceship, improving its hull points, structure points, and condition.
     *
     * @param hullRepair The amount of hull points to repair
     * @param structureRepair The amount of structure points to repair
     * @return The new hull points value
     */
    public int repair(int hullRepair, int structureRepair) {
        hullPoints = Math.min(maxHullPoints, hullPoints + hullRepair);
        structurePoints = Math.min(maxStructurePoints, structurePoints + structureRepair);

        // Improve condition based on repair amount
        int conditionImprovement = ((hullRepair * 100) / maxHullPoints) + ((structureRepair * 100) / maxStructurePoints);
        condition = Math.min(100, condition + conditionImprovement);

        return hullPoints;
    }

    /**
     * Performs maintenance on the spaceship, improving its condition.
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
     * Calculates the fuel required for a jump of the specified distance.
     *
     * @param jumpDistance The distance of the jump (1-6 parsecs)
     * @return The amount of fuel required in tons, or -1 if the jump is not possible
     */
    public BigDecimal calculateFuelForJump(int jumpDistance) {
        // Check if jump is possible with this ship's jump drive
        if (jumpDistance > jumpDriveRating || jumpDistance <= 0) {
            return BigDecimal.valueOf(-1);
        }

        // In Traveller, fuel consumption is typically 10% of displacement per parsec jumped
        return BigDecimal.valueOf(displacementTons * 0.1).multiply(BigDecimal.valueOf(jumpDistance));
    }

    /**
     * Checks if the spaceship has enough fuel for a jump of the specified distance.
     *
     * @param jumpDistance The distance of the jump (1-6 parsecs)
     * @return true if the ship has enough fuel, false otherwise
     */
    public boolean hasEnoughFuelForJump(int jumpDistance) {
        BigDecimal requiredFuel = calculateFuelForJump(jumpDistance);
        return requiredFuel.compareTo(BigDecimal.ZERO) > 0 && fuelCapacity.compareTo(requiredFuel) >= 0;
    }

    /**
     * Performs a jump to another system.
     *
     * @param jumpDistance The distance of the jump (1-6 parsecs)
     * @return true if the jump was successful, false otherwise
     */
    public boolean performJump(int jumpDistance) {
        // Check if jump is possible
        if (!hasEnoughFuelForJump(jumpDistance)) {
            return false;
        }

        // Consume fuel
        BigDecimal fuelConsumed = calculateFuelForJump(jumpDistance);
        fuelCapacity = fuelCapacity.subtract(fuelConsumed);

        // In a real implementation, this would involve more complex logic
        // such as jump calculations, misjump possibilities, etc.

        return true;
    }

    /**
     * Refuels the spaceship.
     *
     * @param amount The amount of fuel to add in tons
     * @return The new fuel capacity
     */
    public BigDecimal refuel(BigDecimal amount) {
        BigDecimal maxRefuel = fuelConsumptionPerJump.multiply(BigDecimal.valueOf(jumpDriveRating)); // Maximum fuel capacity
        fuelCapacity = fuelCapacity.add(amount).min(maxRefuel);
        return fuelCapacity;
    }

    /**
     * Checks if the spaceship is operational.
     *
     * @return true if the spaceship is operational, false otherwise
     */
    public boolean isOperational() {
        return hullPoints > 0 && structurePoints > 0 && condition > 20;
    }

    /**
     * Checks if the spaceship is legal at the specified law level.
     *
     * @param lawLevel The law level to check against
     * @return true if legal, false if restricted
     */
    public boolean isLegalAt(int lawLevel) {
        return lawLevel < restrictedLawLevel || !requiresPermit;
    }

    /**
     * Calculates the skill check modifier based on the spaceship's condition.
     *
     * @return The modifier to apply to skill checks when operating this spaceship
     */
    public int getOperationSkillModifier() {
        if (condition >= 90) return 1;  // Excellent condition gives a bonus
        if (condition >= 70) return 0;  // Good condition, no modifier
        if (condition >= 50) return -1; // Fair condition, small penalty
        if (condition >= 30) return -2; // Poor condition, moderate penalty
        return -3;                      // Bad condition, severe penalty
    }

    /**
     * Returns a string representation of the spaceship.
     *
     * @return A string with the spaceship's basic information
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(name).append(" (").append(type.getDisplayName()).append(")\n");

        if (!description.isEmpty()) {
            sb.append("Description: ").append(description).append("\n");
        }

        sb.append("TL: ").append(techLevel).append(", ");
        sb.append("Cost: ").append(costMCr).append(" MCr, ");
        sb.append("Displacement: ").append(displacementTons).append(" tons\n");

        sb.append("Crew: ").append(crewRequired).append(", ");
        sb.append("Passengers: ").append(passengerCapacity).append(", ");
        sb.append("Cargo: ").append(cargoCapacity).append(" tons\n");

        sb.append("Jump: ").append(jumpDriveRating).append(", ");
        sb.append("Maneuver: ").append(maneuverDriveRating).append("G, ");
        sb.append("Power: ").append(powerPlantRating).append("\n");

        sb.append("Hull: ").append(hullPoints).append("/").append(maxHullPoints).append(", ");
        sb.append("Structure: ").append(structurePoints).append("/").append(maxStructurePoints).append(", ");
        sb.append("Armor: ").append(armorRating).append(", ");
        sb.append("Condition: ").append(condition).append("%\n");

        sb.append("Fuel: ").append(fuelCapacity).append(" tons");
        if (hasFuelScoop) {
            sb.append(" (with fuel scoop)");
        }
        sb.append("\n");

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
