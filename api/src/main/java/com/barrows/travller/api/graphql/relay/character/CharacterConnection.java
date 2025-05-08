package com.barrows.travller.api.graphql.relay.character;

import com.barrows.travller.api.graphql.relay.PageInfo;
import com.barrows.travller.api.model.Character;

import java.util.List;

/**
 * A connection to a list of items.
 */
public class CharacterConnection {
    private PageInfo pageInfo;
    private List<CharacterEdge> edges;
    private List<Character> nodes;
    private Integer totalCount;

    public CharacterConnection() {
    }

    public CharacterConnection(PageInfo pageInfo, List<CharacterEdge> edges, List<Character> nodes, Integer totalCount) {
        this.pageInfo = pageInfo;
        this.edges = edges;
        this.nodes = nodes;
        this.totalCount = totalCount;
    }

    public PageInfo getPageInfo() {
        return pageInfo;
    }

    public void setPageInfo(PageInfo pageInfo) {
        this.pageInfo = pageInfo;
    }

    public List<CharacterEdge> getEdges() {
        return edges;
    }

    public void setEdges(List<CharacterEdge> edges) {
        this.edges = edges;
    }

    public List<Character> getNodes() {
        return nodes;
    }

    public void setNodes(List<Character> nodes) {
        this.nodes = nodes;
    }

    public Integer getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }
}
