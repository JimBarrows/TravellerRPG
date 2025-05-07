package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Animal;
import com.barrows.travller.api.model.AnimalType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Animal entity.
 * Provides methods for accessing and manipulating animals in the database.
 */
@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    /**
     * Finds animals by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching animals
     */
    List<Animal> findByNameContainingIgnoreCase(String name);

    /**
     * Finds animals by description containing the given string (case-insensitive).
     *
     * @param description The description to search for
     * @return A list of matching animals
     */
    List<Animal> findByDescriptionContainingIgnoreCase(String description);

    /**
     * Finds animals by type.
     *
     * @param type The animal type
     * @return A list of animals of the specified type
     */
    List<Animal> findByType(AnimalType type);

    /**
     * Finds animals that are domesticated.
     *
     * @return A list of domesticated animals
     */
    List<Animal> findByDomesticatedTrue();

    /**
     * Finds animals that are trainable.
     *
     * @return A list of trainable animals
     */
    List<Animal> findByTrainableTrue();

    /**
     * Finds animals with a tech level less than or equal to the specified value.
     *
     * @param techLevel The maximum tech level
     * @return A list of animals available at the specified tech level
     */
    List<Animal> findByTechLevelLessThanEqual(int techLevel);

    /**
     * Finds animals within a specific price range.
     *
     * @param minPrice The minimum price
     * @param maxPrice The maximum price
     * @return A list of animals within the price range
     */
    List<Animal> findByCostBetween(int minPrice, int maxPrice);

    /**
     * Finds animals that are dangerous.
     * This is a custom query because the isDangerous() method is not a simple property.
     *
     * @return A list of dangerous animals
     */
    @Query("SELECT a FROM Animal a WHERE a.type = 'DANGEROUS' OR a.type = 'WILD_CARNIVORE' OR (a.type = 'WILD_OMNIVORE' AND a.domesticated = false)")
    List<Animal> findDangerousAnimals();

    /**
     * Searches for animals by name or description containing the given string (case-insensitive).
     *
     * @param searchTerm The term to search for
     * @return A list of matching animals
     */
    @Query("SELECT a FROM Animal a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Animal> searchByNameOrDescription(@Param("searchTerm") String searchTerm);
}
