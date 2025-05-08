package com.barrows.travller.api.graphql.relay.character;

import com.barrows.travller.api.graphql.relay.ConnectionUtil;
import com.barrows.travller.api.graphql.relay.PageInfo;
import com.barrows.travller.api.model.Character;

import java.util.List;

/**
 * Factory for creating CharacterConnection objects.
 */
public class CharacterConnectionFactory implements ConnectionUtil.ConnectionFactory<Character, CharacterConnection, CharacterEdge> {

    @Override
    public CharacterEdge createEdge(Character node, String cursor) {
        return new CharacterEdge(node, cursor);
    }

    @Override
    public String getCursor(CharacterEdge edge) {
        return edge.getCursor();
    }

    @Override
    public CharacterConnection createConnection(List<CharacterEdge> edges, List<Character> nodes,
                                              boolean hasNextPage, boolean hasPreviousPage,
                                              String startCursor, String endCursor, int totalCount) {
        PageInfo pageInfo = new PageInfo(hasNextPage, hasPreviousPage, startCursor, endCursor);
        return new CharacterConnection(pageInfo, edges, nodes, totalCount);
    }
}
