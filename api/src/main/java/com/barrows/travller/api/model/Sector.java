package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;
import jakarta.persistence.*;

/**
 * Represents a sector in the Traveller RPG system.
 * A sector is a large region of space containing multiple subsectors.
 * Sectors are typically arranged in a 4x4 grid of subsectors (16 subsectors total).
 */
@Entity
@Table(name = "sectors")
@Data
@NoArgsConstructor
public class Sector {

    /**
     * The unique identifier for the sector.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the sector.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The subsectors in this sector.
     */
    @OneToMany(mappedBy = "sector", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Subsector> subsectors;

    /**
     * The political entities that have territory in this sector.
     */
    @ManyToMany
    @JoinTable(
        name = "sector_political_entities",
        joinColumns = @JoinColumn(name = "sector_id"),
        inverseJoinColumns = @JoinColumn(name = "political_entity_id")
    )
    private List<PoliticalEntity> politicalEntities;

    /**
     * The galactic coordinates of this sector.
     */
    private String coordinates;

    /**
     * A description of the sector.
     */
    @Column(length = 1000)
    private String description;

    /**
     * Creates a new sector with the specified name.
     *
     * @param name The name of the sector
     */
    public Sector(String name) {
        this.name = name;
        this.subsectors = new ArrayList<>();
        this.politicalEntities = new ArrayList<>();
    }

    /**
     * Creates a new sector with the specified name and coordinates.
     *
     * @param name The name of the sector
     * @param coordinates The galactic coordinates of this sector
     */
    public Sector(String name, String coordinates) {
        this(name);
        this.coordinates = coordinates;
    }

    /**
     * Adds a subsector to this sector.
     *
     * @param subsector The subsector to add
     */
    public void addSubsector(Subsector subsector) {
        subsectors.add(subsector);
        subsector.setSector(this);
    }

    /**
     * Removes a subsector from this sector.
     *
     * @param subsector The subsector to remove
     */
    public void removeSubsector(Subsector subsector) {
        subsectors.remove(subsector);
        subsector.setSector(null);
    }

    /**
     * Adds a political entity to this sector.
     *
     * @param politicalEntity The political entity to add
     */
    public void addPoliticalEntity(PoliticalEntity politicalEntity) {
        politicalEntities.add(politicalEntity);
    }

    /**
     * Removes a political entity from this sector.
     *
     * @param politicalEntity The political entity to remove
     */
    public void removePoliticalEntity(PoliticalEntity politicalEntity) {
        politicalEntities.remove(politicalEntity);
    }

    /**
     * Returns a string representation of the sector.
     *
     * @return A string in the format "Name (Coordinates)"
     */
    @Override
    public String toString() {
        if (coordinates != null && !coordinates.isEmpty()) {
            return name + " (" + coordinates + ")";
        } else {
            return name;
        }
    }
}
