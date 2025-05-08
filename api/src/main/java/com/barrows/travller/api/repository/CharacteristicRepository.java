package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Characteristic;
import com.barrows.travller.api.model.CharacteristicType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the Characteristic entity.
 * Provides methods for accessing and manipulating characteristics in the database.
 */
@Repository
public interface CharacteristicRepository extends JpaRepository<Characteristic, Long> {

    /**
     * Finds characteristics by type.
     *
     * @param type The characteristic type
     * @return A list of characteristics of the specified type
     */
    List<Characteristic> findByType(CharacteristicType type);

    /**
     * Finds characteristics with a value greater than or equal to the specified value.
     *
     * @param value The minimum value
     * @return A list of characteristics with the specified minimum value
     */
    List<Characteristic> findByValueGreaterThanEqual(int value);

    /**
     * Finds characteristics with a value less than or equal to the specified value.
     *
     * @param value The maximum value
     * @return A list of characteristics with the specified maximum value
     */
    List<Characteristic> findByValueLessThanEqual(int value);

    /**
     * Finds characteristics with a value between the specified minimum and maximum values.
     *
     * @param minValue The minimum value
     * @param maxValue The maximum value
     * @return A list of characteristics within the specified value range
     */
    List<Characteristic> findByValueBetween(int minValue, int maxValue);

    /**
     * Finds characteristics by type with a value greater than or equal to the specified value.
     *
     * @param type The characteristic type
     * @param value The minimum value
     * @return A list of characteristics of the specified type with the minimum value
     */
    List<Characteristic> findByTypeAndValueGreaterThanEqual(CharacteristicType type, int value);

    /**
     * Finds characteristics by type with a value less than or equal to the specified value.
     *
     * @param type The characteristic type
     * @param value The maximum value
     * @return A list of characteristics of the specified type with the maximum value
     */
    List<Characteristic> findByTypeAndValueLessThanEqual(CharacteristicType type, int value);

    /**
     * Finds characteristics where the value is less than the original value.
     *
     * @return A list of characteristics that have been damaged
     */
    @Query("SELECT c FROM Characteristic c WHERE c.value < c.originalValue")
    List<Characteristic> findDamagedCharacteristics();

    /**
     * Finds characteristics by type where the value is less than the original value.
     *
     * @param type The characteristic type
     * @return A list of characteristics of the specified type that have been damaged
     */
    @Query("SELECT c FROM Characteristic c WHERE c.type = :type AND c.value < c.originalValue")
    List<Characteristic> findDamagedCharacteristicsByType(@Param("type") CharacteristicType type);
}
