package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.TravelZone;
import com.barrows.travller.api.model.World;
import com.barrows.travller.api.model.WorldType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the World entity.
 * Provides methods for accessing and manipulating worlds in the database.
 */
@Repository
public interface WorldRepository extends JpaRepository<World, Long> {

    /**
     * Finds worlds by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching worlds
     */
    List<World> findByNameContainingIgnoreCase(String name);

    /**
     * Finds worlds by UWP containing the given string.
     *
     * @param uwp The UWP to search for
     * @return A list of matching worlds
     */
    List<World> findByUwpContaining(String uwp);

    /**
     * Finds worlds by type.
     *
     * @param type The world type
     * @return A list of worlds of the specified type
     */
    List<World> findByType(WorldType type);

    /**
     * Finds worlds by travel zone.
     *
     * @param travelZone The travel zone
     * @return A list of worlds with the specified travel zone
     */
    List<World> findByTravelZone(TravelZone travelZone);

    /**
     * Finds worlds by starport class.
     *
     * @param starportClass The starport class
     * @return A list of worlds with the specified starport class
     */
    List<World> findByStarportClass(char starportClass);

    /**
     * Finds worlds with a tech level greater than or equal to the specified value.
     *
     * @param techLevel The minimum tech level
     * @return A list of worlds with the specified tech level or higher
     */
    List<World> findByTechLevelGreaterThanEqual(int techLevel);

    /**
     * Finds worlds with a population greater than or equal to the specified value.
     *
     * @param population The minimum population
     * @return A list of worlds with the specified population or higher
     */
    List<World> findByPopulationGreaterThanEqual(int population);

    /**
     * Finds worlds with a specific trade code.
     *
     * @param tradeCode The trade code to search for
     * @return A list of worlds with the specified trade code
     */
    @Query("SELECT w FROM World w JOIN w.tradeCodes tc WHERE tc = :tradeCode")
    List<World> findByTradeCode(@Param("tradeCode") String tradeCode);

    /**
     * Finds worlds in a specific subsector.
     *
     * @param subsectorId The ID of the subsector
     * @return A list of worlds in the specified subsector
     */
    List<World> findBySubsectorId(Long subsectorId);

    /**
     * Finds worlds controlled by a specific political entity.
     *
     * @param politicalEntityId The ID of the political entity
     * @return A list of worlds controlled by the specified political entity
     */
    List<World> findByPoliticalEntityId(Long politicalEntityId);

    /**
     * Finds worlds with gas giants.
     *
     * @return A list of worlds with gas giants
     */
    List<World> findByGasGiantsGreaterThan(int gasGiants);

    /**
     * Searches for worlds by name or UWP containing the given string (case-insensitive).
     *
     * @param searchTerm The term to search for
     * @return A list of matching worlds
     */
    @Query("SELECT w FROM World w WHERE LOWER(w.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR w.uwp LIKE CONCAT('%', :searchTerm, '%')")
    List<World> searchByNameOrUwp(@Param("searchTerm") String searchTerm);

    /**
     * Finds worlds by atmosphere value.
     *
     * @param atmosphere The atmosphere value
     * @return A list of worlds with the specified atmosphere
     */
    List<World> findByAtmosphere(int atmosphere);

    /**
     * Finds worlds with tech level between the specified values (inclusive).
     *
     * @param minTechLevel The minimum tech level
     * @param maxTechLevel The maximum tech level
     * @return A list of worlds with tech level in the specified range
     */
    List<World> findByTechLevelBetween(int minTechLevel, int maxTechLevel);
}
