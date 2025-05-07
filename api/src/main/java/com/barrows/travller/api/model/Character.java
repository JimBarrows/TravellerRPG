package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDate;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;

/**
 * Represents a character in the Traveller RPG system.
 * This is the central model that ties together all the other models.
 */
@Entity
@Table(name = "characters")
@Data
@NoArgsConstructor
public class Character {

    /**
     * The unique identifier for the character.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the character.
     */
    @NotNull
    @NotEmpty
    @Column(nullable = false)
    private String name;

    /**
     * The age of the character in years.
     */
    @Min(0)
    private int age;

    /**
     * The gender of the character.
     */
    private String gender;

    /**
     * The race of the character.
     */
    @NotNull
    @ManyToOne
    @JoinColumn(name = "race_id")
    private Race race;

    /**
     * The characteristics of the character (STR, DEX, END, INT, EDU, SOC).
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "character_id")
    private List<Characteristic> characteristics;

    /**
     * The skills the character has learned.
     */
    @ManyToMany
    @JoinTable(
        name = "character_skills",
        joinColumns = @JoinColumn(name = "character_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private List<Skill> skills;

    /**
     * The homeworld the character originates from.
     */
    @ManyToOne
    @JoinColumn(name = "homeworld_id")
    private Homeworld homeworld;

    /**
     * The careers the character has pursued.
     */
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "character_id")
    private List<CareerTerm> careerHistory;

    /**
     * The weapons the character possesses.
     */
    @ManyToMany
    @JoinTable(
        name = "character_weapons",
        joinColumns = @JoinColumn(name = "character_id"),
        inverseJoinColumns = @JoinColumn(name = "weapon_id")
    )
    private List<Weapon> weapons;

    /**
     * The armor the character possesses.
     */
    @ManyToMany
    @JoinTable(
        name = "character_armor",
        joinColumns = @JoinColumn(name = "character_id"),
        inverseJoinColumns = @JoinColumn(name = "armor_id")
    )
    private List<Armor> armor;

    /**
     * The armor the character is currently wearing.
     */
    @ManyToOne
    @JoinColumn(name = "equipped_armor_id")
    private Armor equippedArmor;

    /**
     * The weapon the character is currently wielding.
     */
    @ManyToOne
    @JoinColumn(name = "equipped_weapon_id")
    private Weapon equippedWeapon;

    /**
     * The character's current credits.
     */
    @Min(0)
    private int credits;

    /**
     * The character's background information.
     */
    @Column(length = 2000)
    private String background;

    /**
     * The character's current status (Alive, Dead, Retired).
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CharacterStatus status;

    /**
     * Creates a new character with the specified name.
     *
     * @param name The name of the character
     */
    public Character(String name) {
        this.name = name;
        this.age = 18; // Starting age
        this.gender = "";
        this.race = RaceFactory.createHuman(); // Default race is Human
        this.characteristics = new ArrayList<>();
        this.skills = new ArrayList<>();
        this.careerHistory = new ArrayList<>();
        this.weapons = new ArrayList<>();
        this.armor = new ArrayList<>();
        this.credits = 0;
        this.background = "";
        this.status = CharacterStatus.ALIVE;
    }

    /**
     * Creates a new character with the specified name and race.
     *
     * @param name The name of the character
     * @param race The race of the character
     */
    public Character(String name, Race race) {
        this(name);
        this.race = race;
        applyRacialModifiers(); // Apply racial modifiers to characteristics
    }

    /**
     * Creates a new character with the specified name and race type.
     *
     * @param name The name of the character
     * @param raceType The type of race for the character
     */
    public Character(String name, RaceType raceType) {
        this(name, RaceFactory.createRace(raceType));
    }

    /**
     * Adds a characteristic to the character.
     *
     * @param characteristic The characteristic to add
     */
    public void addCharacteristic(Characteristic characteristic) {
        // Apply racial modifier if any
        if (race != null) {
            int modifier = race.getCharacteristicModifier(characteristic.getType());
            if (modifier != 0) {
                characteristic.setValue(characteristic.getValue() + modifier);
                characteristic.setOriginalValue(characteristic.getOriginalValue() + modifier);
            }
        }
        characteristics.add(characteristic);
    }

    /**
     * Applies racial modifiers to all characteristics.
     * This should be called if the race is changed after characteristics are added.
     */
    public void applyRacialModifiers() {
        if (race == null) return;

        for (Characteristic characteristic : characteristics) {
            int modifier = race.getCharacteristicModifier(characteristic.getType());
            if (modifier != 0) {
                characteristic.setValue(characteristic.getValue() + modifier);
                characteristic.setOriginalValue(characteristic.getOriginalValue() + modifier);
            }
        }
    }

    /**
     * Sets the character's race and applies racial modifiers.
     * This will remove any previous racial modifiers before applying new ones.
     *
     * @param race The new race
     */
    public void setRace(Race race) {
        // Remove modifiers from old race if any
        if (this.race != null) {
            for (Characteristic characteristic : characteristics) {
                int oldModifier = this.race.getCharacteristicModifier(characteristic.getType());
                if (oldModifier != 0) {
                    characteristic.setValue(characteristic.getValue() - oldModifier);
                    characteristic.setOriginalValue(characteristic.getOriginalValue() - oldModifier);
                }
            }
        }

        // Set new race
        this.race = race;

        // Apply modifiers from new race
        applyRacialModifiers();
    }

    /**
     * Sets the character's race by type and applies racial modifiers.
     *
     * @param raceType The type of the new race
     */
    public void setRace(RaceType raceType) {
        setRace(RaceFactory.createRace(raceType));
    }

    /**
     * Gets a characteristic by type.
     *
     * @param type The type of characteristic to get
     * @return The characteristic, or null if not found
     */
    public Characteristic getCharacteristic(CharacteristicType type) {
        for (Characteristic characteristic : characteristics) {
            if (characteristic.getType() == type) {
                return characteristic;
            }
        }
        return null;
    }

    /**
     * Adds a skill to the character.
     * If the character already has the skill, increases its level instead.
     *
     * @param skill The skill to add
     */
    public void addSkill(Skill skill) {
        for (Skill existingSkill : skills) {
            if (existingSkill.getName().equals(skill.getName())) {
                existingSkill.increaseLevel(skill.getLevel());
                return;
            }
        }
        skills.add(skill);
    }

    /**
     * Gets a skill by name.
     *
     * @param name The name of the skill to get
     * @return The skill, or null if not found
     */
    public Skill getSkill(String name) {
        for (Skill skill : skills) {
            if (skill.getName().equals(name)) {
                return skill;
            }
        }
        return null;
    }

    /**
     * Adds a career term to the character's history.
     *
     * @param careerTerm The career term to add
     */
    public void addCareerTerm(CareerTerm careerTerm) {
        careerHistory.add(careerTerm);
        age += 4; // Each term is 4 years
    }

    /**
     * Adds a weapon to the character's inventory.
     *
     * @param weapon The weapon to add
     */
    public void addWeapon(Weapon weapon) {
        weapons.add(weapon);
    }

    /**
     * Adds armor to the character's inventory.
     *
     * @param armor The armor to add
     */
    public void addArmor(Armor armor) {
        this.armor.add(armor);
    }

    /**
     * Equips a weapon from the character's inventory.
     *
     * @param weapon The weapon to equip
     * @return true if equipped successfully, false if the character doesn't have the weapon
     */
    public boolean equipWeapon(Weapon weapon) {
        if (weapons.contains(weapon)) {
            equippedWeapon = weapon;
            return true;
        }
        return false;
    }

    /**
     * Equips armor from the character's inventory.
     *
     * @param armor The armor to equip
     * @return true if equipped successfully, false if the character doesn't have the armor
     */
    public boolean equipArmor(Armor armor) {
        if (this.armor.contains(armor)) {
            equippedArmor = armor;
            return true;
        }
        return false;
    }

    /**
     * Applies damage to the character, taking armor into account.
     *
     * @param damage The amount of damage
     * @param isEnergyWeapon Whether the damage is from an energy weapon
     * @param targetCharacteristic The characteristic to apply damage to
     * @return The amount of damage actually applied
     */
    public int applyDamage(int damage, boolean isEnergyWeapon, CharacteristicType targetCharacteristic) {
        int actualDamage = damage;

        // Apply armor protection if equipped
        if (equippedArmor != null) {
            actualDamage = equippedArmor.reduceDamage(damage, isEnergyWeapon);
        }

        // Apply damage to the specified characteristic
        Characteristic characteristic = getCharacteristic(targetCharacteristic);
        if (characteristic != null) {
            characteristic.applyDamage(actualDamage);

            // Check if character is incapacitated
            if (characteristic.getValue() == 0) {
                // In Traveller, if any physical characteristic reaches 0, the character is incapacitated
                if (targetCharacteristic == CharacteristicType.STRENGTH ||
                    targetCharacteristic == CharacteristicType.DEXTERITY ||
                    targetCharacteristic == CharacteristicType.ENDURANCE) {
                    // Character might die if medical attention isn't received
                    // This would be handled by game logic outside this model
                }
            }
        }

        return actualDamage;
    }

    /**
     * Applies aging effects to the character.
     * In Traveller, characters must make aging rolls when they reach certain age thresholds.
     *
     * @param ageThreshold The age threshold that triggered this aging check
     * @param agingRoll The result of the aging roll
     * @return true if the character survived aging, false if they died
     */
    public boolean applyAging(int ageThreshold, int agingRoll) {
        // In Traveller, aging typically affects physical characteristics first
        Characteristic strength = getCharacteristic(CharacteristicType.STRENGTH);
        Characteristic dexterity = getCharacteristic(CharacteristicType.DEXTERITY);
        Characteristic endurance = getCharacteristic(CharacteristicType.ENDURANCE);

        // The severity of aging effects increases with age
        int reduction = 1;
        if (ageThreshold >= 50) reduction = 2;
        if (ageThreshold >= 66) reduction = 3;

        // Apply reductions based on the aging roll
        // This is a simplified version of the Traveller aging rules
        if (agingRoll <= 5) {
            // Failed aging roll
            if (strength != null) strength.applyAging(reduction);
            if (dexterity != null) dexterity.applyAging(reduction);
            if (endurance != null) endurance.applyAging(reduction);

            // Check if character died from aging
            if ((strength != null && strength.getValue() == 0) ||
                (dexterity != null && dexterity.getValue() == 0) ||
                (endurance != null && endurance.getValue() == 0)) {
                status = CharacterStatus.DEAD;
                return false;
            }
        }

        return true;
    }

    /**
     * Retires the character.
     */
    public void retire() {
        status = CharacterStatus.RETIRED;
    }

    /**
     * Checks if the character is alive.
     *
     * @return true if alive, false otherwise
     */
    public boolean isAlive() {
        return status == CharacterStatus.ALIVE;
    }

    /**
     * Returns a string representation of the character.
     *
     * @return A string with the character's basic information
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(name).append(" (").append(age).append(" years, ");

        // Add race
        if (race != null) {
            sb.append(race.getType().getDisplayName()).append(", ");
        }

        sb.append(status.getDisplayName()).append(")\n");

        // Add characteristics
        sb.append("Characteristics: ");
        for (Characteristic characteristic : characteristics) {
            sb.append(characteristic.getType().getAbbreviation()).append(" ").append(characteristic.getValue()).append(" ");
        }
        sb.append("\n");

        // Add skills
        sb.append("Skills: ");
        for (Skill skill : skills) {
            sb.append(skill.toString()).append(", ");
        }
        if (!skills.isEmpty()) {
            sb.delete(sb.length() - 2, sb.length()); // Remove trailing comma and space
        }

        return sb.toString();
    }
}
