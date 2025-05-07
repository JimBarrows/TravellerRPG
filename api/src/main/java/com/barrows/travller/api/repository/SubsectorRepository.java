package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Subsector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Subsector entity.
 * Provides methods for accessing and manipulating subsectors in the database.
 */
@Repository
public interface SubsectorRepository extends JpaRepository<Subsector, Long> {

    /**
     * Finds subsectors by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching subsectors
     */
    List<Subsector> findByNameContainingIgnoreCase(String name);

    /**
     * Finds subsectors by sector ID.
     *
     * @param sectorId The ID of the sector
     * @return A list of subsectors in the specified sector
     */
    List<Subsector> findBySectorId(Long sectorId);

    /**
     * Finds subsectors by sector position.
     *
     * @param sectorPosition The position within the sector (A-P)
     * @return A list of subsectors with the specified sector position
     */
    List<Subsector> findBySectorPosition(String sectorPosition);

    /**
     * Finds subsectors that contain worlds of a specific type.
     *
     * @param worldType The type of world to search for
     * @return A list of subsectors containing worlds of the specified type
     */
    @Query("SELECT DISTINCT s FROM Subsector s JOIN s.worlds w WHERE w.type = :worldType")
    List<Subsector> findByWorldType(@Param("worldType") String worldType);

    /**
     * Finds subsectors that are controlled by a specific political entity.
     *
     * @param politicalEntityId The ID of the political entity
     * @return A list of subsectors controlled by the specified political entity
     */
    @Query("SELECT s FROM Subsector s JOIN s.politicalEntities pe WHERE pe.id = :politicalEntityId")
    List<Subsector> findByPoliticalEntityId(@Param("politicalEntityId") Long politicalEntityId);

    /**
     * Finds subsectors that contain worlds with a specific trade code.
     *
     * @param tradeCode The trade code to search for
     * @return A list of subsectors containing worlds with the specified trade code
     */
    @Query("SELECT DISTINCT s FROM Subsector s JOIN s.worlds w JOIN w.tradeCodes tc WHERE tc = :tradeCode")
    List<Subsector> findByWorldTradeCode(@Param("tradeCode") String tradeCode);

    /**
     * Finds subsectors that contain worlds with a tech level greater than or equal to the specified value.
     *
     * @param techLevel The minimum tech level
     * @return A list of subsectors containing worlds with the specified tech level or higher
     */
    @Query("SELECT DISTINCT s FROM Subsector s JOIN s.worlds w WHERE w.techLevel >= :techLevel")
    List<Subsector> findByWorldTechLevelGreaterThanEqual(@Param("techLevel") int techLevel);

    /**
     * Searches for subsectors by name or description containing the given string (case-insensitive).
     *
     * @param searchTerm The term to search for
     * @return A list of matching subsectors
     */
    @Query("SELECT s FROM Subsector s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(s.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Subsector> searchByNameOrDescription(@Param("searchTerm") String searchTerm);
}
