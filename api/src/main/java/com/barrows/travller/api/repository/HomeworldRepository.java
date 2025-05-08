package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Homeworld;
import com.barrows.travller.api.model.WorldType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for the Homeworld entity.
 */
@Repository
public interface HomeworldRepository extends JpaRepository<Homeworld, Long> {

    /**
     * Find a homeworld by its name.
     *
     * @param name The name of the homeworld
     * @return The homeworld, if found
     */
    Optional<Homeworld> findByName(String name);

    /**
     * Find homeworlds by type.
     *
     * @param type The world type
     * @return A list of matching homeworlds
     */
    List<Homeworld> findByType(WorldType type);

    /**
     * Find homeworlds by a partial name match.
     *
     * @param name The partial name to match
     * @return A list of matching homeworlds
     */
    @Query("SELECT h FROM Homeworld h WHERE LOWER(h.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Homeworld> findByNameContainingIgnoreCase(@Param("name") String name);
}
