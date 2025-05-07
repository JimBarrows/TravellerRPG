package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Vehicle;
import com.barrows.travller.api.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository interface for the Vehicle entity.
 * Provides methods for accessing and manipulating vehicles in the database.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /**
     * Finds vehicles by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching vehicles
     */
    List<Vehicle> findByNameContainingIgnoreCase(String name);

    /**
     * Finds vehicles by description containing the given string (case-insensitive).
     *
     * @param description The description to search for
     * @return A list of matching vehicles
     */
    List<Vehicle> findByDescriptionContainingIgnoreCase(String description);

    /**
     * Finds vehicles by type.
     *
     * @param type The vehicle type
     * @return A list of vehicles of the specified type
     */
    List<Vehicle> findByType(VehicleType type);

    /**
     * Finds vehicles that require a specific skill.
     *
     * @param skillName The name of the required skill
     * @return A list of vehicles requiring the specified skill
     */
    List<Vehicle> findByRequiredSkillIgnoreCase(String skillName);

    /**
     * Finds vehicles that are currently operational.
     *
     * @return A list of operational vehicles
     */
    @Query("SELECT v FROM Vehicle v WHERE v.hullPoints > 0 AND v.condition > 20")
    List<Vehicle> findOperationalVehicles();

    /**
     * Finds vehicles that require a permit.
     *
     * @return A list of vehicles requiring a permit
     */
    List<Vehicle> findByRequiresPermitTrue();

    /**
     * Finds vehicles with a tech level less than or equal to the specified value.
     *
     * @param techLevel The maximum tech level
     * @return A list of vehicles available at the specified tech level
     */
    List<Vehicle> findByTechLevelLessThanEqual(int techLevel);

    /**
     * Finds vehicles within a specific price range.
     *
     * @param minPrice The minimum price
     * @param maxPrice The maximum price
     * @return A list of vehicles within the price range
     */
    List<Vehicle> findByCostBetween(int minPrice, int maxPrice);

    /**
     * Finds vehicles that are legal at the specified law level.
     *
     * @param lawLevel The law level
     * @return A list of legal vehicles
     */
    @Query("SELECT v FROM Vehicle v WHERE v.restrictedLawLevel > :lawLevel OR v.requiresPermit = false")
    List<Vehicle> findLegalAtLawLevel(@Param("lawLevel") int lawLevel);

    /**
     * Finds vehicles with a passenger capacity greater than or equal to the specified value.
     *
     * @param minPassengers The minimum passenger capacity
     * @return A list of vehicles with sufficient passenger capacity
     */
    List<Vehicle> findByPassengerCapacityGreaterThanEqual(int minPassengers);

    /**
     * Finds vehicles with a cargo capacity greater than or equal to the specified value.
     *
     * @param minCargo The minimum cargo capacity in tons
     * @return A list of vehicles with sufficient cargo capacity
     */
    List<Vehicle> findByCargoCapacityGreaterThanEqual(BigDecimal minCargo);

    /**
     * Finds vehicles with weapons.
     *
     * @return A list of armed vehicles
     */
    @Query("SELECT v FROM Vehicle v WHERE SIZE(v.weapons) > 0")
    List<Vehicle> findArmedVehicles();

    /**
     * Searches for vehicles by name or description containing the given string (case-insensitive).
     *
     * @param searchTerm The term to search for
     * @return A list of matching vehicles
     */
    @Query("SELECT v FROM Vehicle v WHERE LOWER(v.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(v.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Vehicle> searchByNameOrDescription(@Param("searchTerm") String searchTerm);
}
