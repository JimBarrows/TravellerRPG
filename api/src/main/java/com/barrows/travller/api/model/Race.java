package com.barrows.travller.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents a race in the Traveller RPG system.
 * Races include Humans (default) and various alien species.
 */
@Entity
@Table(name = "races")
@Data
@NoArgsConstructor
public class Race {

    /**
     * The unique identifier for the race.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The type of race.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RaceType type;

    /**
     * The name of the race.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The description of the race.
     */
    @Column(length = 2000)
    private String description;

    /**
     * Characteristic modifiers applied to characters of this race.
     * Map of characteristic type to modifier value.
     */
    @ElementCollection
    @CollectionTable(name = "race_characteristic_modifiers", joinColumns = @JoinColumn(name = "race_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name = "characteristic_type")
    @Column(name = "modifier")
    private Map<CharacteristicType, Integer> characteristicModifiers;

    /**
     * Special abilities or traits of this race.
     */
    @ElementCollection
    @CollectionTable(name = "race_special_abilities", joinColumns = @JoinColumn(name = "race_id"))
    @Column(name = "ability")
    private List<String> specialAbilities;

    /**
     * Typical homeworlds for this race.
     */
    @ElementCollection
    @CollectionTable(name = "race_typical_homeworlds", joinColumns = @JoinColumn(name = "race_id"))
    @Column(name = "homeworld")
    private List<String> typicalHomeworlds;

    /**
     * Lifespan range in standard years.
     */
    private String lifespan;

    /**
     * Physical appearance description.
     */
    @Column(length = 1000)
    private String appearance;

    /**
     * Creates a new race with the specified type, name, and description.
     *
     * @param type The type of race
     * @param name The name of the race
     * @param description The description of the race
     */
    public Race(RaceType type, String name, String description) {
        this.type = type;
        this.name = name;
        this.description = description;
        this.characteristicModifiers = new HashMap<>();
        this.specialAbilities = new ArrayList<>();
        this.typicalHomeworlds = new ArrayList<>();
        this.lifespan = "";
        this.appearance = "";
    }

    /**
     * Creates a new race with the specified type.
     * Uses the type's display name and description.
     *
     * @param type The type of race
     */
    public Race(RaceType type) {
        this(type, type.getDisplayName(), type.getDescription());
    }

    /**
     * Adds a characteristic modifier for this race.
     *
     * @param characteristicType The characteristic type
     * @param modifier The modifier value
     */
    public void addCharacteristicModifier(CharacteristicType characteristicType, int modifier) {
        characteristicModifiers.put(characteristicType, modifier);
    }

    /**
     * Gets the modifier for a specific characteristic.
     *
     * @param characteristicType The characteristic type
     * @return The modifier value, or 0 if no modifier exists
     */
    public int getCharacteristicModifier(CharacteristicType characteristicType) {
        return characteristicModifiers.getOrDefault(characteristicType, 0);
    }

    /**
     * Adds a special ability for this race.
     *
     * @param ability The special ability description
     */
    public void addSpecialAbility(String ability) {
        specialAbilities.add(ability);
    }

    /**
     * Adds a typical homeworld for this race.
     *
     * @param homeworld The homeworld name
     */
    public void addTypicalHomeworld(String homeworld) {
        typicalHomeworlds.add(homeworld);
    }

    /**
     * Returns a string representation of the race.
     *
     * @return The race name
     */
    @Override
    public String toString() {
        return name;
    }
}
