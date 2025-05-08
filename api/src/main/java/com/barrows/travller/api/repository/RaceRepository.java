package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Race;
import com.barrows.travller.api.model.RaceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for the Race entity.
 */
@Repository
public interface RaceRepository extends JpaRepository<Race, Long> {

    /**
     * Find a race by its type.
     *
     * @param type The race type
     * @return The race, if found
     */
    Optional<Race> findByType(RaceType type);

    /**
     * Find races by a partial name match.
     *
     * @param name The partial name to match
     * @return A list of matching races
     */
    @Query("SELECT r FROM Race r WHERE LOWER(r.type) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Race> findByNameContainingIgnoreCase(@Param("name") String name);
}
