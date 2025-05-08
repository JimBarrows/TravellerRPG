package com.barrows.travller.api.graphql.relay.character;

import com.barrows.travller.api.model.Character;

/**
 * An edge in a connection from an object to another object.
 */
public class CharacterEdge {
    private Character node;
    private String cursor;

    public CharacterEdge() {
    }

    public CharacterEdge(Character node, String cursor) {
        this.node = node;
        this.cursor = cursor;
    }

    public Character getNode() {
        return node;
    }

    public void setNode(Character node) {
        this.node = node;
    }

    public String getCursor() {
        return cursor;
    }

    public void setCursor(String cursor) {
        this.cursor = cursor;
    }
}
