package com.barrows.travller.api.graphql.relay;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for handling Relay connections.
 */
public class ConnectionUtil {

    private static final int DEFAULT_PAGE_SIZE = 10;

    /**
     * Create a connection from a list of entities.
     *
     * @param entities The list of entities
     * @param first The number of items to return from the start
     * @param after The cursor to start from
     * @param last The number of items to return from the end
     * @param before The cursor to end at
     * @param <T> The entity type
     * @param <C> The connection type
     * @param <E> The edge type
     * @return The connection
     */
    public static <T, C, E> C createConnection(List<T> entities,
                                              Integer first,
                                              String after,
                                              Integer last,
                                              String before,
                                              ConnectionFactory<T, C, E> factory) {
        // Handle pagination
        int totalCount = entities.size();
        int startIndex = 0;
        int endIndex = totalCount;

        // Handle 'after' cursor
        if (after != null && !after.isEmpty()) {
            int afterIndex = decodeIndex(after);
            if (afterIndex >= 0 && afterIndex < totalCount) {
                startIndex = afterIndex + 1;
            }
        }

        // Handle 'before' cursor
        if (before != null && !before.isEmpty()) {
            int beforeIndex = decodeIndex(before);
            if (beforeIndex >= 0 && beforeIndex < totalCount) {
                endIndex = beforeIndex;
            }
        }

        // Handle 'first' limit
        if (first != null && first >= 0) {
            endIndex = Math.min(startIndex + first, endIndex);
        }

        // Handle 'last' limit
        if (last != null && last >= 0) {
            startIndex = Math.max(endIndex - last, startIndex);
        }

        // Get the sublist
        List<T> pageItems = entities.subList(startIndex, endIndex);

        // Create edges
        List<E> edges = pageItems.stream()
                .map(item -> factory.createEdge(item, encodeIndex(entities.indexOf(item))))
                .collect(Collectors.toList());

        // Create page info
        boolean hasNextPage = endIndex < totalCount;
        boolean hasPreviousPage = startIndex > 0;
        String startCursor = edges.isEmpty() ? null : factory.getCursor(edges.get(0));
        String endCursor = edges.isEmpty() ? null : factory.getCursor(edges.get(edges.size() - 1));

        // Create connection
        return factory.createConnection(edges, pageItems, hasNextPage, hasPreviousPage, startCursor, endCursor, totalCount);
    }

    /**
     * Create a Pageable object from Relay connection parameters.
     *
     * @param first The number of items to return from the start
     * @param after The cursor to start from
     * @param last The number of items to return from the end
     * @param before The cursor to end at
     * @return The Pageable object
     */
    public static Pageable createPageable(Integer first, String after, Integer last, String before) {
        int size = first != null ? first : (last != null ? last : DEFAULT_PAGE_SIZE);
        int page = 0;

        if (after != null && !after.isEmpty()) {
            page = decodeIndex(after) / size + 1;
        } else if (before != null && !before.isEmpty()) {
            page = Math.max(0, decodeIndex(before) / size - 1);
        }

        return PageRequest.of(page, size);
    }

    /**
     * Create a connection from a Page of entities.
     *
     * @param page The page of entities
     * @param <T> The entity type
     * @param <C> The connection type
     * @param <E> The edge type
     * @return The connection
     */
    public static <T, C, E> C createConnectionFromPage(Page<T> page, ConnectionFactory<T, C, E> factory) {
        List<T> content = page.getContent();

        // Create edges
        List<E> edges = content.stream()
                .map(item -> factory.createEdge(item, encodeIndex(content.indexOf(item))))
                .collect(Collectors.toList());

        // Create page info
        boolean hasNextPage = page.hasNext();
        boolean hasPreviousPage = page.hasPrevious();
        String startCursor = edges.isEmpty() ? null : factory.getCursor(edges.get(0));
        String endCursor = edges.isEmpty() ? null : factory.getCursor(edges.get(edges.size() - 1));

        // Create connection
        return factory.createConnection(edges, content, hasNextPage, hasPreviousPage, startCursor, endCursor, (int) page.getTotalElements());
    }

    /**
     * Encode an index as a cursor.
     *
     * @param index The index
     * @return The cursor
     */
    public static String encodeIndex(int index) {
        return Base64.getEncoder().encodeToString(String.valueOf(index).getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Decode a cursor to an index.
     *
     * @param cursor The cursor
     * @return The index
     */
    public static int decodeIndex(String cursor) {
        try {
            String decoded = new String(Base64.getDecoder().decode(cursor), StandardCharsets.UTF_8);
            return Integer.parseInt(decoded);
        } catch (Exception e) {
            return -1;
        }
    }

    /**
     * Factory interface for creating connection objects.
     *
     * @param <T> The entity type
     * @param <C> The connection type
     * @param <E> The edge type
     */
    public interface ConnectionFactory<T, C, E> {
        /**
         * Create an edge.
         *
         * @param node The node
         * @param cursor The cursor
         * @return The edge
         */
        E createEdge(T node, String cursor);

        /**
         * Get the cursor from an edge.
         *
         * @param edge The edge
         * @return The cursor
         */
        String getCursor(E edge);

        /**
         * Create a connection.
         *
         * @param edges The edges
         * @param nodes The nodes
         * @param hasNextPage Whether there are more items
         * @param hasPreviousPage Whether there are previous items
         * @param startCursor The start cursor
         * @param endCursor The end cursor
         * @param totalCount The total count
         * @return The connection
         */
        C createConnection(List<E> edges, List<T> nodes, boolean hasNextPage, boolean hasPreviousPage,
                          String startCursor, String endCursor, int totalCount);
    }
}
