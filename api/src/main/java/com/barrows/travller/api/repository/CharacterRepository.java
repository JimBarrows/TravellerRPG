package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Character;
import com.barrows.travller.api.model.CharacterStatus;
import com.barrows.travller.api.model.Race;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Character entity.
 * Provides methods for accessing and manipulating characters in the database.
 * Extends TenantAwareRepository to ensure tenant isolation.
 */
@Repository
public interface CharacterRepository extends TenantAwareRepository<Character, Long> {

    /**
     * Finds characters by name containing the given string (case-insensitive) for a specific tenant.
     *
     * @param name The name to search for
     * @param tenantId The tenant ID
     * @return A list of matching characters
     */
    List<Character> findByNameContainingIgnoreCaseAndTenantId(String name, Long tenantId);

    /**
     * Finds characters by race for a specific tenant.
     *
     * @param race The race
     * @param tenantId The tenant ID
     * @return A list of characters of the specified race
     */
    List<Character> findByRaceAndTenantId(Race race, Long tenantId);

    /**
     * Finds characters by status for a specific tenant.
     *
     * @param status The character status
     * @param tenantId The tenant ID
     * @return A list of characters with the specified status
     */
    List<Character> findByStatusAndTenantId(CharacterStatus status, Long tenantId);

    /**
     * Finds characters that are alive for a specific tenant.
     *
     * @param tenantId The tenant ID
     * @return A list of living characters
     */
    @Query("SELECT c FROM Character c WHERE c.status != 'DECEASED' AND c.tenant.id = :tenantId")
    List<Character> findLivingCharacters(@Param("tenantId") Long tenantId);

    /**
     * Finds characters with age greater than or equal to the specified value for a specific tenant.
     *
     * @param age The minimum age
     * @param tenantId The tenant ID
     * @return A list of characters with the specified minimum age
     */
    List<Character> findByAgeGreaterThanEqualAndTenantId(int age, Long tenantId);

    /**
     * Finds characters with age less than or equal to the specified value for a specific tenant.
     *
     * @param age The maximum age
     * @param tenantId The tenant ID
     * @return A list of characters with the specified maximum age
     */
    List<Character> findByAgeLessThanEqualAndTenantId(int age, Long tenantId);

    /**
     * Finds characters with a specific skill for a specific tenant.
     *
     * @param skillName The name of the skill
     * @param tenantId The tenant ID
     * @return A list of characters with the specified skill
     */
    @Query("SELECT c FROM Character c JOIN c.skills s WHERE s.name = :skillName AND c.tenant.id = :tenantId")
    List<Character> findBySkillName(@Param("skillName") String skillName, @Param("tenantId") Long tenantId);

    /**
     * Finds characters with a skill level greater than or equal to the specified value for a specific tenant.
     *
     * @param skillName The name of the skill
     * @param level The minimum skill level
     * @param tenantId The tenant ID
     * @return A list of characters with the specified skill at the minimum level
     */
    @Query("SELECT c FROM Character c JOIN c.skills s WHERE s.name = :skillName AND s.level >= :level AND c.tenant.id = :tenantId")
    List<Character> findBySkillNameAndMinimumLevel(@Param("skillName") String skillName, @Param("level") int level, @Param("tenantId") Long tenantId);

    /**
     * Searches for characters by name for a specific tenant.
     *
     * @param searchTerm The term to search for in the name
     * @param tenantId The tenant ID
     * @return A list of matching characters
     */
    @Query("SELECT c FROM Character c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) AND c.tenant.id = :tenantId")
    List<Character> searchByName(@Param("searchTerm") String searchTerm, @Param("tenantId") Long tenantId);
}
