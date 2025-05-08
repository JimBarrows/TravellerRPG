package com.barrows.travller.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a political entity in the Traveller RPG system.
 * Political entities include interstellar empires, confederations, republics, and other
 * governmental organizations that control multiple worlds across subsectors and sectors.
 * Examples include the Third Imperium, the Sword Worlds Confederation, and the Aslan Hierate.
 */
@Entity
@Table(name = "political_entities")
@Data
@NoArgsConstructor
public class PoliticalEntity {

    /**
     * The unique identifier for the political entity.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the political entity.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The type of political entity.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PoliticalEntityType type;

    /**
     * The worlds directly controlled by this political entity.
     */
    @OneToMany(mappedBy = "politicalEntity")
    private List<World> controlledWorlds;

    /**
     * The subsectors where this political entity has territory.
     */
    @ManyToMany(mappedBy = "politicalEntities")
    private List<Subsector> subsectors;

    /**
     * The sectors where this political entity has territory.
     */
    @ManyToMany(mappedBy = "politicalEntities")
    private List<Sector> sectors;

    /**
     * The government type of this political entity.
     */
    private int governmentType;

    /**
     * The tech level of this political entity (highest tech level of its worlds).
     */
    private int techLevel;

    /**
     * The capital world of this political entity.
     */
    @ManyToOne
    @JoinColumn(name = "capital_world_id")
    private World capitalWorld;

    /**
     * A description of this political entity.
     */
    @Column(length = 2000)
    private String description;

    /**
     * The founding date of this political entity.
     */
    private String foundingDate;

    /**
     * Notable characteristics of this political entity.
     */
    @ElementCollection
    @CollectionTable(name = "political_entity_characteristics", joinColumns = @JoinColumn(name = "political_entity_id"))
    @Column(name = "characteristic", length = 500)
    private List<String> characteristics;

    /**
     * Creates a new political entity with the specified name and type.
     *
     * @param name The name of the political entity
     * @param type The type of political entity
     */
    public PoliticalEntity(String name, PoliticalEntityType type) {
        this.name = name;
        this.type = type;
        this.controlledWorlds = new ArrayList<>();
        this.subsectors = new ArrayList<>();
        this.sectors = new ArrayList<>();
        this.characteristics = new ArrayList<>();
    }

    /**
     * Adds a world to this political entity's control.
     *
     * @param world The world to add
     */
    public void addControlledWorld(World world) {
        controlledWorlds.add(world);
        world.setPoliticalEntity(this);
    }

    /**
     * Removes a world from this political entity's control.
     *
     * @param world The world to remove
     */
    public void removeControlledWorld(World world) {
        controlledWorlds.remove(world);
        if (world.getPoliticalEntity() == this) {
            world.setPoliticalEntity(null);
        }
    }

    /**
     * Adds a characteristic to this political entity.
     *
     * @param characteristic The characteristic to add
     */
    public void addCharacteristic(String characteristic) {
        characteristics.add(characteristic);
    }

    /**
     * Sets the capital world of this political entity.
     *
     * @param world The capital world
     */
    public void setCapitalWorld(World world) {
        this.capitalWorld = world;
        if (world != null && !controlledWorlds.contains(world)) {
            addControlledWorld(world);
        }
    }

    /**
     * Returns a string representation of the political entity.
     *
     * @return A string in the format "Name (Type)"
     */
    @Override
    public String toString() {
        return name + " (" + type.getDisplayName() + ")";
    }
}
