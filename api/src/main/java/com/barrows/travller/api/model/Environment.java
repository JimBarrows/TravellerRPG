package com.barrows.travller.api.model;

import lombok.Data;
import java.util.Map;
import java.util.HashMap;

/**
 * Represents an environment in the Traveller RPG system.
 * Environments affect combat and other activities with various modifiers and special rules.
 */
@Data
public class Environment {

    /**
     * The name of the environment.
     */
    private String name;

    /**
     * The type of environment.
     */
    private EnvironmentType type;

    /**
     * The gravity level relative to Earth (1.0 = Earth normal).
     */
    private double gravity;

    /**
     * The atmosphere type.
     */
    private AtmosphereType atmosphere;

    /**
     * The temperature range in Celsius.
     */
    private String temperatureRange;

    /**
     * The visibility conditions.
     */
    private VisibilityType visibility;

    /**
     * The modifiers applied to different actions in this environment.
     */
    private Map<String, Integer> modifiers;

    /**
     * Special rules that apply in this environment.
     */
    private Map<String, String> specialRules;

    /**
     * Creates a new environment with the specified properties.
     *
     * @param name The name of the environment
     * @param type The type of environment
     * @param gravity The gravity level
     * @param atmosphere The atmosphere type
     * @param temperatureRange The temperature range
     * @param visibility The visibility conditions
     */
    public Environment(String name, EnvironmentType type, double gravity, AtmosphereType atmosphere,
                      String temperatureRange, VisibilityType visibility) {
        this.name = name;
        this.type = type;
        this.gravity = gravity;
        this.atmosphere = atmosphere;
        this.temperatureRange = temperatureRange;
        this.visibility = visibility;
        this.modifiers = new HashMap<>();
        this.specialRules = new HashMap<>();

        // Add default modifiers based on environment properties
        if (gravity < 0.5) {
            addModifier("Movement", 2);
            addModifier("Melee Combat", -2);
        } else if (gravity > 1.5) {
            addModifier("Movement", -2);
            addModifier("Physical Tasks", -1);
        }

        if (atmosphere == AtmosphereType.NONE || atmosphere == AtmosphereType.TRACE) {
            addSpecialRule("Vacuum", "Requires vacc suit for survival");
        }

        addModifier("Ranged Combat", visibility.getModifier());
    }

    /**
     * Adds a modifier for a specific action in this environment.
     *
     * @param action The action being modified
     * @param modifier The dice modifier (DM) to apply
     */
    public void addModifier(String action, int modifier) {
        modifiers.put(action, modifier);
    }

    /**
     * Gets the modifier for a specific action in this environment.
     *
     * @param action The action to get the modifier for
     * @return The modifier value, or 0 if no modifier exists
     */
    public int getModifier(String action) {
        return modifiers.getOrDefault(action, 0);
    }

    /**
     * Adds a special rule for this environment.
     *
     * @param ruleName The name of the rule
     * @param ruleDescription The description of the rule
     */
    public void addSpecialRule(String ruleName, String ruleDescription) {
        specialRules.put(ruleName, ruleDescription);
    }

    /**
     * Gets the description of a special rule for this environment.
     *
     * @param ruleName The name of the rule
     * @return The rule description, or null if the rule doesn't exist
     */
    public String getSpecialRule(String ruleName) {
        return specialRules.get(ruleName);
    }

    /**
     * Returns a string representation of the environment.
     *
     * @return A string describing the environment
     */
    @Override
    public String toString() {
        return name + " (" + type.getDisplayName() + ", " + atmosphere.getDisplayName() + ", " +
               "Gravity: " + gravity + "G)";
    }
}
