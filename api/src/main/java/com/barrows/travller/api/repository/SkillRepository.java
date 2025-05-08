package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Skill;
import com.barrows.travller.api.model.SkillCategory;
import com.barrows.travller.api.model.CharacteristicType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for the Skill entity.
 * Provides methods for accessing and manipulating skills in the database.
 */
@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {

    /**
     * Finds skills by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching skills
     */
    List<Skill> findByNameContainingIgnoreCase(String name);

    /**
     * Finds a skill by its exact name (case-insensitive).
     *
     * @param name The exact name to search for
     * @return An optional containing the skill if found
     */
    Optional<Skill> findByNameIgnoreCase(String name);

    /**
     * Finds skills by category.
     *
     * @param category The skill category
     * @return A list of skills in the specified category
     */
    List<Skill> findByCategory(SkillCategory category);

    /**
     * Finds skills by primary characteristic.
     *
     * @param characteristic The primary characteristic
     * @return A list of skills associated with the specified characteristic
     */
    List<Skill> findByPrimaryCharacteristic(CharacteristicType characteristic);

    /**
     * Finds skills with level greater than or equal to the specified value.
     *
     * @param level The minimum level
     * @return A list of skills with the specified minimum level
     */
    List<Skill> findByLevelGreaterThanEqual(int level);

    /**
     * Finds skills by category and with level greater than or equal to the specified value.
     *
     * @param category The skill category
     * @param level The minimum level
     * @return A list of skills in the specified category with the minimum level
     */
    List<Skill> findByCategoryAndLevelGreaterThanEqual(SkillCategory category, int level);

    /**
     * Finds skills by primary characteristic and with level greater than or equal to the specified value.
     *
     * @param characteristic The primary characteristic
     * @param level The minimum level
     * @return A list of skills associated with the specified characteristic with the minimum level
     */
    List<Skill> findByPrimaryCharacteristicAndLevelGreaterThanEqual(CharacteristicType characteristic, int level);

    /**
     * Searches for skills by name or category.
     *
     * @param searchTerm The term to search for
     * @return A list of matching skills
     */
    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR s.category = :category")
    List<Skill> searchByNameOrCategory(@Param("searchTerm") String searchTerm, @Param("category") SkillCategory category);
}
