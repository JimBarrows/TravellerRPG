package com.barrows.travller.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a world in the Traveller RPG system.
 * A world is a planet or other celestial body that can be visited, explored, or inhabited.
 * Worlds are organized into subsectors and sectors, and may be controlled by political entities.
 */
@Entity
@Table(name = "worlds")
@Data
@NoArgsConstructor
public class World {

    /**
     * The unique identifier for the world.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the world.
     */
    @Column(nullable = false)
    private String name;

    /**
     * The Universal World Profile (UWP) code that describes the world's characteristics.
     * Format: Starport-Size-Atmosphere-Hydrographics-Population-Government-Law Level-Tech Level
     */
    @Column(nullable = false)
    private String uwp;

    /**
     * The type of world (e.g., Garden, Desert, Ice, etc.).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorldType type;

    /**
     * The trade codes that apply to this world.
     */
    @ElementCollection
    @CollectionTable(name = "world_trade_codes", joinColumns = @JoinColumn(name = "world_id"))
    @Column(name = "trade_code")
    private List<String> tradeCodes;

    /**
     * The travel zone of the world (Green, Amber, Red).
     */
    @Enumerated(EnumType.STRING)
    private TravelZone travelZone;

    /**
     * The starport class of the world (A, B, C, D, E, X).
     */
    private char starportClass;

    /**
     * The size of the world (0-10).
     */
    private int size;

    /**
     * The atmosphere type of the world (0-15).
     */
    private int atmosphere;

    /**
     * The hydrographic percentage of the world (0-10).
     */
    private int hydrographics;

    /**
     * The population level of the world (0-10).
     */
    private int population;

    /**
     * The government type of the world (0-15).
     */
    private int government;

    /**
     * The law level of the world (0-10).
     */
    private int lawLevel;

    /**
     * The tech level of the world (0-15).
     */
    private int techLevel;

    /**
     * The bases present on the world (Naval, Scout, Research, etc.).
     */
    @ElementCollection
    @CollectionTable(name = "world_bases", joinColumns = @JoinColumn(name = "world_id"))
    @Column(name = "base")
    private List<String> bases;

    /**
     * The gas giants present in the system.
     */
    private int gasGiants;

    /**
     * The position of the world in its star system (orbit number).
     */
    private int systemPosition;

    /**
     * The number of satellites (moons) orbiting the world.
     */
    private int satellites;

    /**
     * The cultural details of the world.
     */
    @Column(length = 1000)
    private String culturalDetails;

    /**
     * The points of interest on the world.
     */
    @ElementCollection
    @CollectionTable(name = "world_points_of_interest", joinColumns = @JoinColumn(name = "world_id"))
    @Column(name = "point_of_interest", length = 500)
    private List<String> pointsOfInterest;

    /**
     * The hex coordinates of the world within its subsector (e.g., "0101").
     */
    private String hexCoordinates;

    /**
     * The subsector this world belongs to.
     */
    @ManyToOne
    @JoinColumn(name = "subsector_id")
    private Subsector subsector;

    /**
     * The political entity that controls this world, if any.
     */
    @ManyToOne
    @JoinColumn(name = "political_entity_id")
    private PoliticalEntity politicalEntity;

    /**
     * Creates a new world with the specified name, UWP, and type.
     *
     * @param name The name of the world
     * @param uwp The Universal World Profile code
     * @param type The type of world
     */
    public World(String name, String uwp, WorldType type) {
        this.name = name;
        this.uwp = uwp;
        this.type = type;
        this.tradeCodes = new ArrayList<>();
        this.bases = new ArrayList<>();
        this.pointsOfInterest = new ArrayList<>();
        this.travelZone = TravelZone.GREEN;

        // Parse UWP code to extract individual characteristics
        if (uwp != null && uwp.length() >= 9) {
            // Handle standard UWP format like "A123456-7"
            this.starportClass = uwp.charAt(0);
            this.size = parseHexValue(uwp.charAt(1));
            this.atmosphere = parseHexValue(uwp.charAt(2));
            this.hydrographics = parseHexValue(uwp.charAt(3));
            this.population = parseHexValue(uwp.charAt(4));
            this.government = parseHexValue(uwp.charAt(5));
            this.lawLevel = parseHexValue(uwp.charAt(6));
            // Check if there's a hyphen before the tech level
            if (uwp.charAt(7) == '-') {
                this.techLevel = parseHexValue(uwp.charAt(8));
            } else {
                this.techLevel = parseHexValue(uwp.charAt(7));
            }
        } else if (uwp != null && uwp.length() >= 15) {
            // Handle extended UWP format with spaces or hyphens like "A-1-2-3-4-5-6-7"
            this.starportClass = uwp.charAt(0);
            this.size = parseHexValue(uwp.charAt(2));
            this.atmosphere = parseHexValue(uwp.charAt(4));
            this.hydrographics = parseHexValue(uwp.charAt(6));
            this.population = parseHexValue(uwp.charAt(8));
            this.government = parseHexValue(uwp.charAt(10));
            this.lawLevel = parseHexValue(uwp.charAt(12));
            this.techLevel = parseHexValue(uwp.charAt(14));
        }
    }

    /**
     * Parses a hexadecimal character to its integer value.
     *
     * @param hexChar The hexadecimal character to parse
     * @return The integer value (0-15)
     */
    private int parseHexValue(char hexChar) {
        if (hexChar >= '0' && hexChar <= '9') {
            return hexChar - '0';
        } else if (hexChar >= 'A' && hexChar <= 'F') {
            return 10 + (hexChar - 'A');
        } else {
            return 0;
        }
    }

    /**
     * Adds a trade code to this world.
     *
     * @param tradeCode The trade code to add
     */
    public void addTradeCode(String tradeCode) {
        tradeCodes.add(tradeCode);
    }

    /**
     * Adds a base to this world.
     *
     * @param base The base to add
     */
    public void addBase(String base) {
        bases.add(base);
    }

    /**
     * Adds a point of interest to this world.
     *
     * @param poi The point of interest to add
     */
    public void addPointOfInterest(String poi) {
        pointsOfInterest.add(poi);
    }

    /**
     * Returns a string representation of the world.
     *
     * @return A string in the format "Name (UWP)"
     */
    @Override
    public String toString() {
        return name + " (" + uwp + ")";
    }
}
