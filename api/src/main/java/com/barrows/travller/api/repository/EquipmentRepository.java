package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Equipment;
import com.barrows.travller.api.model.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Equipment entity.
 * Provides methods for accessing and manipulating equipment items in the database.
 */
@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    /**
     * Finds equipment items by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching equipment items
     */
    List<Equipment> findByNameContainingIgnoreCase(String name);

    /**
     * Finds equipment items by description containing the given string (case-insensitive).
     *
     * @param description The description to search for
     * @return A list of matching equipment items
     */
    List<Equipment> findByDescriptionContainingIgnoreCase(String description);

    /**
     * Finds equipment items by type.
     *
     * @param type The equipment type
     * @return A list of equipment items of the specified type
     */
    List<Equipment> findByType(EquipmentType type);

    /**
     * Finds equipment items that require a specific skill.
     *
     * @param skillName The name of the required skill
     * @return A list of equipment items requiring the specified skill
     */
    List<Equipment> findByRequiredSkillIgnoreCase(String skillName);

    /**
     * Finds equipment items that are currently functional.
     *
     * @return A list of functional equipment items
     */
    List<Equipment> findByConditionGreaterThan(int minCondition);

    /**
     * Finds equipment items that require a permit.
     *
     * @return A list of equipment items requiring a permit
     */
    List<Equipment> findByRequiresPermitTrue();

    /**
     * Finds equipment items with a tech level less than or equal to the specified value.
     *
     * @param techLevel The maximum tech level
     * @return A list of equipment items available at the specified tech level
     */
    List<Equipment> findByTechLevelLessThanEqual(int techLevel);

    /**
     * Finds equipment items within a specific price range.
     *
     * @param minPrice The minimum price
     * @param maxPrice The maximum price
     * @return A list of equipment items within the price range
     */
    List<Equipment> findByCostBetween(int minPrice, int maxPrice);

    /**
     * Finds equipment items that are legal at the specified law level.
     *
     * @param lawLevel The law level
     * @return A list of legal equipment items
     */
    @Query("SELECT e FROM Equipment e WHERE e.restrictedLawLevel > :lawLevel OR e.requiresPermit = false")
    List<Equipment> findLegalAtLawLevel(@Param("lawLevel") int lawLevel);

    /**
     * Searches for equipment items by name or description containing the given string (case-insensitive).
     *
     * @param searchTerm The term to search for
     * @return A list of matching equipment items
     */
    @Query("SELECT e FROM Equipment e WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Equipment> searchByNameOrDescription(@Param("searchTerm") String searchTerm);
}
