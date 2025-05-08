package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Career;
import com.barrows.travller.api.model.CharacteristicType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for the Career entity.
 * Provides methods for accessing and manipulating careers in the database.
 */
@Repository
public interface CareerRepository extends JpaRepository<Career, Long> {

    /**
     * Finds careers by name containing the given string (case-insensitive).
     *
     * @param name The name to search for
     * @return A list of matching careers
     */
    List<Career> findByNameContainingIgnoreCase(String name);

    /**
     * Finds a career by its exact name (case-insensitive).
     *
     * @param name The exact name to search for
     * @return An optional containing the career if found
     */
    Optional<Career> findByNameIgnoreCase(String name);

    /**
     * Finds careers by description containing the given string (case-insensitive).
     *
     * @param description The description to search for
     * @return A list of matching careers
     */
    List<Career> findByDescriptionContainingIgnoreCase(String description);

    /**
     * Finds careers that have a qualification requirement for the specified characteristic.
     *
     * @param characteristicType The characteristic type
     * @return A list of careers requiring the specified characteristic
     */
    @Query("SELECT c FROM Career c JOIN c.qualificationRequirements qr WHERE KEY(qr) = :characteristicType")
    List<Career> findByQualificationRequirementCharacteristic(@Param("characteristicType") CharacteristicType characteristicType);

    /**
     * Finds careers that have a qualification requirement for the specified characteristic
     * with a minimum value less than or equal to the specified value.
     *
     * @param characteristicType The characteristic type
     * @param value The maximum required value
     * @return A list of careers with the specified qualification requirement
     */
    @Query("SELECT c FROM Career c JOIN c.qualificationRequirements qr WHERE KEY(qr) = :characteristicType AND VALUE(qr) <= :value")
    List<Career> findByQualificationRequirementLessThanEqual(
            @Param("characteristicType") CharacteristicType characteristicType,
            @Param("value") int value);

    /**
     * Finds careers with a qualification DM greater than or equal to the specified value.
     *
     * @param dm The minimum qualification DM
     * @return A list of careers with the specified minimum qualification DM
     */
    List<Career> findByQualificationDMGreaterThanEqual(int dm);

    /**
     * Searches for careers by name or description.
     *
     * @param searchTerm The term to search for
     * @return A list of matching careers
     */
    @Query("SELECT c FROM Career c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Career> searchByNameOrDescription(@Param("searchTerm") String searchTerm);
}
