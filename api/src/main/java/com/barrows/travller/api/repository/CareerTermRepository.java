package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Career;
import com.barrows.travller.api.model.CareerTerm;
import com.barrows.travller.api.model.Character;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for the CareerTerm entity.
 * Provides methods for accessing and manipulating career terms in the database.
 */
@Repository
public interface CareerTermRepository extends JpaRepository<CareerTerm, Long> {

    /**
     * Finds career terms by career.
     *
     * @param career The career
     * @return A list of career terms for the specified career
     */
    List<CareerTerm> findByCareer(Career career);

    /**
     * Finds career terms by term number.
     *
     * @param termNumber The term number
     * @return A list of career terms with the specified term number
     */
    List<CareerTerm> findByTermNumber(int termNumber);

    /**
     * Finds career terms by rank.
     *
     * @param rank The rank
     * @return A list of career terms with the specified rank
     */
    List<CareerTerm> findByRank(int rank);

    /**
     * Finds career terms where the character was commissioned.
     *
     * @return A list of career terms where the character was commissioned
     */
    List<CareerTerm> findByCommissionedTrue();

    /**
     * Finds career terms where the character was advanced.
     *
     * @return A list of career terms where the character was advanced
     */
    List<CareerTerm> findByAdvancedTrue();

    /**
     * Finds career terms where the character survived.
     *
     * @return A list of career terms where the character survived
     */
    List<CareerTerm> findBySurvivedTrue();

    /**
     * Finds career terms where the character did not survive.
     *
     * @return A list of career terms where the character did not survive
     */
    List<CareerTerm> findBySurvivedFalse();

    /**
     * Finds career terms by career and term number.
     *
     * @param career The career
     * @param termNumber The term number
     * @return A list of career terms for the specified career and term number
     */
    List<CareerTerm> findByCareerAndTermNumber(Career career, int termNumber);

    /**
     * Finds career terms by career and rank.
     *
     * @param career The career
     * @param rank The rank
     * @return A list of career terms for the specified career and rank
     */
    List<CareerTerm> findByCareerAndRank(Career career, int rank);

    /**
     * Finds career terms by career where the character was commissioned.
     *
     * @param career The career
     * @return A list of career terms for the specified career where the character was commissioned
     */
    List<CareerTerm> findByCareerAndCommissionedTrue(Career career);
}
