package com.barrows.travller.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;
import jakarta.persistence.*;

/**
 * Represents a homeworld in the Traveller RPG system.
 * A homeworld is a planet or other celestial body where a character originates from,
 * which influences their background and starting skills.
 */
@Entity
@Table(name = "homeworlds")
@Data
@NoArgsConstructor
public class Homeworld {

    /**
     * The unique identifier for the homeworld.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the homeworld.
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
    @CollectionTable(name = "homeworld_trade_codes", joinColumns = @JoinColumn(name = "homeworld_id"))
    @Column(name = "trade_code")
    private List<String> tradeCodes;

    /**
     * The skills commonly found on this homeworld.
     */
    @ManyToMany
    @JoinTable(
        name = "homeworld_common_skills",
        joinColumns = @JoinColumn(name = "homeworld_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private List<Skill> commonSkills;

    /**
     * The background information about this homeworld.
     */
    @Column(length = 2000)
    private String background;

    /**
     * Creates a new homeworld with the specified name and UWP.
     *
     * @param name The name of the homeworld
     * @param uwp The Universal World Profile code
     * @param type The type of world
     */
    public Homeworld(String name, String uwp, WorldType type) {
        this.name = name;
        this.uwp = uwp;
        this.type = type;
        this.tradeCodes = new ArrayList<>();
        this.commonSkills = new ArrayList<>();
        this.background = "";
    }

    /**
     * Adds a trade code to this homeworld.
     *
     * @param tradeCode The trade code to add
     */
    public void addTradeCode(String tradeCode) {
        tradeCodes.add(tradeCode);
    }

    /**
     * Adds a common skill to this homeworld.
     *
     * @param skill The skill to add
     */
    public void addCommonSkill(Skill skill) {
        commonSkills.add(skill);
    }

    /**
     * Returns the starport class from the UWP.
     *
     * @return The starport class (A-E or X)
     */
    public char getStarportClass() {
        if (uwp != null && uwp.length() > 0) {
            return uwp.charAt(0);
        }
        return 'X';
    }

    /**
     * Returns the tech level from the UWP.
     *
     * @return The tech level (0-15)
     */
    public int getTechLevel() {
        if (uwp != null && uwp.length() >= 15) {
            char techChar = uwp.charAt(14);
            if (techChar >= '0' && techChar <= '9') {
                return techChar - '0';
            } else if (techChar >= 'A' && techChar <= 'F') {
                return 10 + (techChar - 'A');
            }
        }
        return 0;
    }

    /**
     * Returns a string representation of the homeworld.
     *
     * @return A string in the format "Name (UWP)"
     */
    @Override
    public String toString() {
        return name + " (" + uwp + ")";
    }
}
