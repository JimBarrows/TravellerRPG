package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Character;
import com.barrows.travller.api.model.CharacterStatus;
import com.barrows.travller.api.model.Race;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Character entity.
 * Provides methods for accessing and manipulating characters in the database.
 */
@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {

    /**
     * Finds characters by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching characters
     */
    List<Character> findByNameContainingIgnoreCase(String name);

    /**
     * Finds characters by race.
     *
     * @param race The race
     * @return A list of characters of the specified race
     */
    List<Character> findByRace(Race race);

    /**
     * Finds characters by status.
     *
     * @param status The character status
     * @return A list of characters with the specified status
     */
    List<Character> findByStatus(CharacterStatus status);

    /**
     * Finds characters that are alive.
     *
     * @return A list of living characters
     */
    @Query("SELECT c FROM Character c WHERE c.status != 'DECEASED'")
    List<Character> findLivingCharacters();

    /**
     * Finds characters with age greater than or equal to the specified value.
     *
     * @param age The minimum age
     * @return A list of characters with the specified minimum age
     */
    List<Character> findByAgeGreaterThanEqual(int age);

    /**
     * Finds characters with age less than or equal to the specified value.
     *
     * @param age The maximum age
     * @return A list of characters with the specified maximum age
     */
    List<Character> findByAgeLessThanEqual(int age);

    /**
     * Finds characters with a specific skill.
     *
     * @param skillName The name of the skill
     * @return A list of characters with the specified skill
     */
    @Query("SELECT c FROM Character c JOIN c.skills s WHERE s.name = :skillName")
    List<Character> findBySkillName(@Param("skillName") String skillName);

    /**
     * Finds characters with a skill level greater than or equal to the specified value.
     *
     * @param skillName The name of the skill
     * @param level The minimum skill level
     * @return A list of characters with the specified skill at the minimum level
     */
    @Query("SELECT c FROM Character c JOIN c.skills s WHERE s.name = :skillName AND s.level >= :level")
    List<Character> findBySkillNameAndMinimumLevel(@Param("skillName") String skillName, @Param("level") int level);

    /**
     * Searches for characters by name or with specific characteristics.
     *
     * @param searchTerm The term to search for in the name
     * @return A list of matching characters
     */
    @Query("SELECT c FROM Character c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Character> searchByName(@Param("searchTerm") String searchTerm);
}
