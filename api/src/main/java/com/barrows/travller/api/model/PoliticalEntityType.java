package com.barrows.travller.api.model;

/**
 * Enum representing the different types of political entities in the Traveller RPG system.
 */
public enum PoliticalEntityType {
    EMPIRE("Empire", "A large, multi-world political entity ruled by an emperor or empress"),
    CONFEDERATION("Confederation", "A loose alliance of worlds or systems with a shared government"),
    REPUBLIC("Republic", "A political entity where power rests with elected representatives"),
    FEDERATION("Federation", "A union of partially self-governing worlds under a central government"),
    HEGEMONY("Hegemony", "A political entity where one world or system dominates others"),
    ALLIANCE("Alliance", "A formal agreement between multiple independent worlds or systems"),
    LEAGUE("League", "An association of worlds or systems for mutual benefit"),
    KINGDOM("Kingdom", "A political entity ruled by a monarch"),
    DUCHY("Duchy", "A territory ruled by a duke or duchess"),
    THEOCRACY("Theocracy", "A political entity ruled by religious authorities"),
    CORPORATE_STATE("Corporate State", "A political entity controlled by one or more corporations"),
    DICTATORSHIP("Dictatorship", "A political entity ruled by a single authoritarian leader"),
    OLIGARCHY("Oligarchy", "A political entity ruled by a small group of people"),
    ANARCHY("Anarchy", "A region with no central government"),
    COLONY("Colony", "A territory under the political control of another world or system"),
    PROTECTORATE("Protectorate", "A world or system that is protected and partially controlled by a stronger political entity"),
    OCCUPIED_TERRITORY("Occupied Territory", "A world or system under military occupation"),
    DISPUTED_TERRITORY("Disputed Territory", "A world or system claimed by multiple political entities"),
    INDEPENDENT("Independent", "A single world or system that is not part of any larger political entity"),
    OTHER("Other", "A political entity that doesn't fit into any of the above categories");

    private final String displayName;
    private final String description;

    PoliticalEntityType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
