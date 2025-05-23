package com.barrows.travller.api.repository;

import com.barrows.travller.api.model.TenantAwareEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;
import java.util.Optional;

/**
 * Base repository interface for tenant-aware entities.
 * This interface provides methods to find entities by tenant ID.
 *
 * @param <T> The entity type
 * @param <ID> The entity ID type
 */
@NoRepositoryBean
public interface TenantAwareRepository<T extends TenantAwareEntity, ID> extends JpaRepository<T, ID> {

    /**
     * Finds all entities for the specified tenant.
     *
     * @param tenantId The tenant ID
     * @return A list of entities for the tenant
     */
    List<T> findAllByTenantId(Long tenantId);

    /**
     * Finds an entity by ID for the specified tenant.
     *
     * @param id The entity ID
     * @param tenantId The tenant ID
     * @return An Optional containing the entity if found, or empty if not found
     */
    Optional<T> findByIdAndTenantId(ID id, Long tenantId);

    /**
     * Checks if an entity with the given ID exists for the specified tenant.
     *
     * @param id The entity ID
     * @param tenantId The tenant ID
     * @return true if the entity exists, false otherwise
     */
    boolean existsByIdAndTenantId(ID id, Long tenantId);

    /**
     * Counts the number of entities for the specified tenant.
     *
     * @param tenantId The tenant ID
     * @return The number of entities for the tenant
     */
    long countByTenantId(Long tenantId);
}
