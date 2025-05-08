package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Armor;
import com.barrows.travller.api.model.ArmorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Armor entity.
 * Provides methods for accessing and manipulating armor in the database.
 */
@Repository
public interface ArmorRepository extends JpaRepository<Armor, Long> {

    /**
     * Finds armor by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching armor
     */
    List<Armor> findByNameContainingIgnoreCase(String name);

    /**
     * Finds armor by type.
     *
     * @param type The armor type
     * @return A list of armor of the specified type
     */
    List<Armor> findByType(ArmorType type);

    /**
     * Finds armor with a tech level less than or equal to the specified value.
     *
     * @param techLevel The maximum tech level
     * @return A list of armor available at the specified tech level
     */
    List<Armor> findByTechLevelLessThanEqual(int techLevel);

    /**
     * Finds armor within a specific price range.
     *
     * @param minPrice The minimum price
     * @param maxPrice The maximum price
     * @return A list of armor within the price range
     */
    List<Armor> findByCostBetween(int minPrice, int maxPrice);

    /**
     * Finds powered armor.
     *
     * @return A list of powered armor
     */
    List<Armor> findByPoweredTrue();

    /**
     * Finds armor with protection value greater than or equal to the specified value.
     *
     * @param protection The minimum protection value
     * @return A list of armor with the specified protection
     */
    List<Armor> findByProtectionGreaterThanEqual(int protection);

    /**
     * Finds armor with energy protection value greater than or equal to the specified value.
     *
     * @param energyProtection The minimum energy protection value
     * @return A list of armor with the specified energy protection
     */
    List<Armor> findByEnergyProtectionGreaterThanEqual(int energyProtection);

    /**
     * Finds armor with radiation protection value greater than or equal to the specified value.
     *
     * @param radiationProtection The minimum radiation protection value
     * @return A list of armor with the specified radiation protection
     */
    List<Armor> findByRadiationProtectionGreaterThanEqual(int radiationProtection);

    /**
     * Searches for armor by name or with specific protection values.
     *
     * @param searchTerm The term to search for in the name
     * @param minProtection The minimum protection value
     * @return A list of matching armor
     */
    @Query("SELECT a FROM Armor a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR a.protection >= :minProtection")
    List<Armor> searchByNameOrMinProtection(@Param("searchTerm") String searchTerm, @Param("minProtection") int minProtection);
}
