package com.barrows.travller.api.model;

/**
 * Enum representing the different statuses a character can have.
 */
@lombok.Getter
public enum CharacterStatus {
    ALIVE("Alive"),
    DEAD("Dead"),
    RETIRED("Retired");

    private final String displayName;

    CharacterStatus(String displayName) {
        this.displayName = displayName;
    }

}
