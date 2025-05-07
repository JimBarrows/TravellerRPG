package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.PoliticalEntity;
import com.barrows.travller.api.model.PoliticalEntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the PoliticalEntity entity.
 * Provides methods for accessing and manipulating political entities in the database.
 */
@Repository
public interface PoliticalEntityRepository extends JpaRepository<PoliticalEntity, Long> {

    /**
     * Finds political entities by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching political entities
     */
    List<PoliticalEntity> findByNameContainingIgnoreCase(String name);

    /**
     * Finds political entities by type.
     *
     * @param type The political entity type
     * @return A list of political entities of the specified type
     */
    List<PoliticalEntity> findByType(PoliticalEntityType type);

    /**
     * Finds political entities by government type.
     *
     * @param governmentType The government type
     * @return A list of political entities with the specified government type
     */
    List<PoliticalEntity> findByGovernmentType(int governmentType);

    /**
     * Finds political entities with a tech level greater than or equal to the specified value.
     *
     * @param techLevel The minimum tech level
     * @return A list of political entities with the specified tech level or higher
     */
    List<PoliticalEntity> findByTechLevelGreaterThanEqual(int techLevel);

    /**
     * Finds political entities that control a specific world.
     *
     * @param worldId The ID of the world
     * @return A list of political entities that control the specified world
     */
    @Query("SELECT pe FROM PoliticalEntity pe JOIN pe.controlledWorlds w WHERE w.id = :worldId")
    List<PoliticalEntity> findByControlledWorldId(@Param("worldId") Long worldId);

    /**
     * Finds political entities that have territory in a specific subsector.
     *
     * @param subsectorId The ID of the subsector
     * @return A list of political entities that have territory in the specified subsector
     */
    @Query("SELECT pe FROM PoliticalEntity pe JOIN pe.subsectors s WHERE s.id = :subsectorId")
    List<PoliticalEntity> findBySubsectorId(@Param("subsectorId") Long subsectorId);

    /**
     * Finds political entities that have territory in a specific sector.
     *
     * @param sectorId The ID of the sector
     * @return A list of political entities that have territory in the specified sector
     */
    @Query("SELECT pe FROM PoliticalEntity pe JOIN pe.sectors s WHERE s.id = :sectorId")
    List<PoliticalEntity> findBySectorId(@Param("sectorId") Long sectorId);

    /**
     * Finds political entities by founding date.
     *
     * @param foundingDate The founding date
     * @return A list of political entities with the specified founding date
     */
    List<PoliticalEntity> findByFoundingDate(String foundingDate);

    /**
     * Finds political entities with a specific characteristic.
     *
     * @param characteristic The characteristic to search for
     * @return A list of political entities with the specified characteristic
     */
    @Query("SELECT pe FROM PoliticalEntity pe JOIN pe.characteristics c WHERE c = :characteristic")
    List<PoliticalEntity> findByCharacteristic(@Param("characteristic") String characteristic);

    /**
     * Searches for political entities by name or description containing the given string (case-insensitive).
     *
     * @param searchTerm The term to search for
     * @return A list of matching political entities
     */
    @Query("SELECT pe FROM PoliticalEntity pe WHERE LOWER(pe.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(pe.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<PoliticalEntity> searchByNameOrDescription(@Param("searchTerm") String searchTerm);
}
