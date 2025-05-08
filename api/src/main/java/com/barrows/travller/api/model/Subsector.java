package com.barrows.travller.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a subsector in the Traveller RPG system.
 * A subsector is a region of space containing multiple star systems (worlds).
 * Subsectors are typically arranged in an 8x10 grid of hexes.
 */
@Entity
@Table(name = "subsectors")
@Data
@NoArgsConstructor
public class Subsector {

    /**
     * The unique identifier for the subsector.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the subsector.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The sector this subsector belongs to.
     */
    @ManyToOne
    @JoinColumn(name = "sector_id")
    private Sector sector;

    /**
     * The position of this subsector within its sector (A-P).
     */
    private String sectorPosition;

    /**
     * The worlds in this subsector.
     */
    @OneToMany(mappedBy = "subsector", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<World> worlds;

    /**
     * The political entities that have territory in this subsector.
     */
    @ManyToMany
    @JoinTable(
        name = "subsector_political_entities",
        joinColumns = @JoinColumn(name = "subsector_id"),
        inverseJoinColumns = @JoinColumn(name = "political_entity_id")
    )
    private List<PoliticalEntity> politicalEntities;

    /**
     * A description of the subsector.
     */
    @Column(length = 1000)
    private String description;

    /**
     * Creates a new subsector with the specified name.
     *
     * @param name The name of the subsector
     */
    public Subsector(String name) {
        this.name = name;
        this.worlds = new ArrayList<>();
        this.politicalEntities = new ArrayList<>();
    }

    /**
     * Creates a new subsector with the specified name and sector position.
     *
     * @param name The name of the subsector
     * @param sectorPosition The position of this subsector within its sector (A-P)
     */
    public Subsector(String name, String sectorPosition) {
        this(name);
        this.sectorPosition = sectorPosition;
    }

    /**
     * Adds a world to this subsector.
     *
     * @param world The world to add
     */
    public void addWorld(World world) {
        worlds.add(world);
        world.setSubsector(this);
    }

    /**
     * Removes a world from this subsector.
     *
     * @param world The world to remove
     */
    public void removeWorld(World world) {
        worlds.remove(world);
        world.setSubsector(null);
    }

    /**
     * Adds a political entity to this subsector.
     *
     * @param politicalEntity The political entity to add
     */
    public void addPoliticalEntity(PoliticalEntity politicalEntity) {
        politicalEntities.add(politicalEntity);
    }

    /**
     * Removes a political entity from this subsector.
     *
     * @param politicalEntity The political entity to remove
     */
    public void removePoliticalEntity(PoliticalEntity politicalEntity) {
        politicalEntities.remove(politicalEntity);
    }

    /**
     * Returns a string representation of the subsector.
     *
     * @return A string in the format "Name (Position)"
     */
    @Override
    public String toString() {
        if (sectorPosition != null && !sectorPosition.isEmpty()) {
            return name + " (" + sectorPosition + ")";
        } else {
            return name;
        }
    }
}
