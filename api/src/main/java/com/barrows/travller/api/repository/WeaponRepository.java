package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Weapon;
import com.barrows.travller.api.model.WeaponType;
import com.barrows.travller.api.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Weapon entity.
 * Provides methods for accessing and manipulating weapons in the database.
 */
@Repository
public interface WeaponRepository extends JpaRepository<Weapon, Long> {

    /**
     * Finds weapons by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching weapons
     */
    List<Weapon> findByNameContainingIgnoreCase(String name);

    /**
     * Finds weapons by type.
     *
     * @param type The weapon type
     * @return A list of weapons of the specified type
     */
    List<Weapon> findByType(WeaponType type);

    /**
     * Finds weapons with a tech level less than or equal to the specified value.
     *
     * @param techLevel The maximum tech level
     * @return A list of weapons available at the specified tech level
     */
    List<Weapon> findByTechLevelLessThanEqual(int techLevel);

    /**
     * Finds weapons within a specific price range.
     *
     * @param minPrice The minimum price
     * @param maxPrice The maximum price
     * @return A list of weapons within the price range
     */
    List<Weapon> findByCostBetween(int minPrice, int maxPrice);

    /**
     * Finds weapons that can be used with automatic fire.
     *
     * @return A list of automatic weapons
     */
    List<Weapon> findByAutomaticTrue();

    /**
     * Finds weapons with a range greater than or equal to the specified value.
     *
     * @param range The minimum range
     * @return A list of weapons with the specified minimum range
     */
    List<Weapon> findByRangeGreaterThanEqual(int range);

    /**
     * Finds weapons that use a specific skill.
     *
     * @param skill The skill
     * @return A list of weapons that use the specified skill
     */
    List<Weapon> findBySkill(Skill skill);

    /**
     * Finds melee weapons.
     *
     * @return A list of melee weapons
     */
    @Query("SELECT w FROM Weapon w WHERE w.type = 'MELEE' OR w.type = 'NATURAL'")
    List<Weapon> findMeleeWeapons();

    /**
     * Finds ranged weapons.
     *
     * @return A list of ranged weapons
     */
    @Query("SELECT w FROM Weapon w WHERE w.type != 'MELEE' AND w.type != 'NATURAL'")
    List<Weapon> findRangedWeapons();

    /**
     * Finds explosive weapons.
     *
     * @return A list of explosive weapons
     */
    @Query("SELECT w FROM Weapon w WHERE w.type = 'EXPLOSIVE'")
    List<Weapon> findExplosiveWeapons();

    /**
     * Searches for weapons by name or damage formula.
     *
     * @param searchTerm The term to search for
     * @return A list of matching weapons
     */
    @Query("SELECT w FROM Weapon w WHERE LOWER(w.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(w.damageFormula) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Weapon> searchByNameOrDamageFormula(@Param("searchTerm") String searchTerm);
}
