package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for the Tenant entity.
 */
@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {

    /**
     * Finds a tenant by its name.
     *
     * @param name The name of the tenant
     * @return An Optional containing the tenant if found, or empty if not found
     */
    Optional<Tenant> findByName(String name);

    /**
     * Checks if a tenant with the given name exists.
     *
     * @param name The name to check
     * @return true if a tenant with the name exists, false otherwise
     */
    boolean existsByName(String name);
}
