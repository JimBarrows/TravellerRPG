package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Sector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Sector entity.
 * Provides methods for accessing and manipulating sectors in the database.
 */
@Repository
public interface SectorRepository extends JpaRepository<Sector, Long> {

    /**
     * Finds sectors by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching sectors
     */
    List<Sector> findByNameContainingIgnoreCase(String name);

    /**
     * Finds sectors by coordinates.
     *
     * @param coordinates The galactic coordinates
     * @return A list of sectors with the specified coordinates
     */
    List<Sector> findByCoordinates(String coordinates);

    /**
     * Finds sectors that contain subsectors with a specific name.
     *
     * @param subsectorName The name of the subsector to search for
     * @return A list of sectors containing subsectors with the specified name
     */
    @Query("SELECT DISTINCT s FROM Sector s JOIN s.subsectors sub WHERE LOWER(sub.name) LIKE LOWER(CONCAT('%', :subsectorName, '%'))")
    List<Sector> findBySubsectorName(@Param("subsectorName") String subsectorName);

    /**
     * Finds sectors that are controlled by a specific political entity.
     *
     * @param politicalEntityId The ID of the political entity
     * @return A list of sectors controlled by the specified political entity
     */
    @Query("SELECT s FROM Sector s JOIN s.politicalEntities pe WHERE pe.id = :politicalEntityId")
    List<Sector> findByPoliticalEntityId(@Param("politicalEntityId") Long politicalEntityId);

    /**
     * Finds sectors that contain worlds with a specific trade code.
     *
     * @param tradeCode The trade code to search for
     * @return A list of sectors containing worlds with the specified trade code
     */
    @Query("SELECT DISTINCT s FROM Sector s JOIN s.subsectors sub JOIN sub.worlds w JOIN w.tradeCodes tc WHERE tc = :tradeCode")
    List<Sector> findByWorldTradeCode(@Param("tradeCode") String tradeCode);

    /**
     * Finds sectors that contain worlds with a tech level greater than or equal to the specified value.
     *
     * @param techLevel The minimum tech level
     * @return A list of sectors containing worlds with the specified tech level or higher
     */
    @Query("SELECT DISTINCT s FROM Sector s JOIN s.subsectors sub JOIN sub.worlds w WHERE w.techLevel >= :techLevel")
    List<Sector> findByWorldTechLevelGreaterThanEqual(@Param("techLevel") int techLevel);

    /**
     * Searches for sectors by name or description containing the given string (case-insensitive).
     *
     * @param searchTerm The term to search for
     * @return A list of matching sectors
     */
    @Query("SELECT s FROM Sector s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(s.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Sector> searchByNameOrDescription(@Param("searchTerm") String searchTerm);
}
