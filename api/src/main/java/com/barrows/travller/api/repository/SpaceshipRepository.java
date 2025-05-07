package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Spaceship;
import com.barrows.travller.api.model.SpaceshipType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Spaceship entity.
 * Provides methods for accessing and manipulating spaceships in the database.
 */
@Repository
public interface SpaceshipRepository extends JpaRepository<Spaceship, Long> {

    /**
     * Finds spaceships by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching spaceships
     */
    List<Spaceship> findByNameContainingIgnoreCase(String name);

    /**
     * Finds spaceships by description containing the given string (case-insensitive).
     *
     * @param description The description to search for
     * @return A list of matching spaceships
     */
    List<Spaceship> findByDescriptionContainingIgnoreCase(String description);

    /**
     * Finds spaceships by type.
     *
     * @param type The spaceship type
     * @return A list of spaceships of the specified type
     */
    List<Spaceship> findByType(SpaceshipType type);

    /**
     * Finds spaceships that require a specific skill.
     *
     * @param skillName The name of the required skill
     * @return A list of spaceships requiring the specified skill
     */
    List<Spaceship> findByRequiredSkillIgnoreCase(String skillName);

    /**
     * Finds spaceships that are currently operational.
     *
     * @return A list of operational spaceships
     */
    @Query("SELECT s FROM Spaceship s WHERE s.hullPoints > 0 AND s.structurePoints > 0 AND s.condition > 20")
    List<Spaceship> findOperationalSpaceships();

    /**
     * Finds spaceships that require a permit.
     *
     * @return A list of spaceships requiring a permit
     */
    List<Spaceship> findByRequiresPermitTrue();

    /**
     * Finds spaceships with a tech level less than or equal to the specified value.
     *
     * @param techLevel The maximum tech level
     * @return A list of spaceships available at the specified tech level
     */
    List<Spaceship> findByTechLevelLessThanEqual(int techLevel);

    /**
     * Finds spaceships within a specific price range.
     *
     * @param minPrice The minimum price in MCr
     * @param maxPrice The maximum price in MCr
     * @return A list of spaceships within the price range
     */
    List<Spaceship> findByCostMCrBetween(double minPrice, double maxPrice);

    /**
     * Finds spaceships that are legal at the specified law level.
     *
     * @param lawLevel The law level
     * @return A list of legal spaceships
     */
    @Query("SELECT s FROM Spaceship s WHERE s.restrictedLawLevel > :lawLevel OR s.requiresPermit = false")
    List<Spaceship> findLegalAtLawLevel(@Param("lawLevel") int lawLevel);

    /**
     * Finds spaceships with a passenger capacity greater than or equal to the specified value.
     *
     * @param minPassengers The minimum passenger capacity
     * @return A list of spaceships with sufficient passenger capacity
     */
    List<Spaceship> findByPassengerCapacityGreaterThanEqual(int minPassengers);

    /**
     * Finds spaceships with a cargo capacity greater than or equal to the specified value.
     *
     * @param minCargo The minimum cargo capacity in tons
     * @return A list of spaceships with sufficient cargo capacity
     */
    List<Spaceship> findByCargoCapacityGreaterThanEqual(double minCargo);

    /**
     * Finds spaceships with a jump drive rating greater than or equal to the specified value.
     *
     * @param minJumpRating The minimum jump drive rating
     * @return A list of spaceships with sufficient jump capability
     */
    List<Spaceship> findByJumpDriveRatingGreaterThanEqual(int minJumpRating);

    /**
     * Finds spaceships with weapons.
     *
     * @return A list of armed spaceships
     */
    @Query("SELECT s FROM Spaceship s WHERE SIZE(s.weapons) > 0")
    List<Spaceship> findArmedSpaceships();

    /**
     * Finds spaceships with a fuel scoop.
     *
     * @return A list of spaceships with a fuel scoop
     */
    List<Spaceship> findByHasFuelScoopTrue();

    /**
     * Searches for spaceships by name or description containing the given string (case-insensitive).
     *
     * @param searchTerm The term to search for
     * @return A list of matching spaceships
     */
    @Query("SELECT s FROM Spaceship s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(s.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Spaceship> searchByNameOrDescription(@Param("searchTerm") String searchTerm);
}
