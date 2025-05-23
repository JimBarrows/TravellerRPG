package com.barrows.travller.api.tenant;

import com.barrows.travller.api.model.Tenant;
import com.barrows.travller.api.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for tenant-related operations.
 * This service provides methods to get the current tenant and set it in entities.
 */
@Service
public class TenantService {

    private final TenantRepository tenantRepository;

    @Autowired
    public TenantService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    /**
     * Gets the current tenant ID from the TenantContext.
     *
     * @return The current tenant ID
     * @throws IllegalStateException if no tenant is set in the context
     */
    public Long getCurrentTenantId() {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant specified in the current context");
        }
        return tenantId;
    }

    /**
     * Gets the current tenant from the TenantContext.
     *
     * @return The current tenant
     * @throws IllegalStateException if no tenant is set in the context or the tenant is not found
     */
    public Tenant getCurrentTenant() {
        Long tenantId = getCurrentTenantId();
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    /**
     * Sets the tenant in the given entity.
     *
     * @param entity The entity to set the tenant in
     * @param <T> The entity type
     * @return The entity with the tenant set
     */
    public <T extends com.barrows.travller.api.model.TenantAwareEntity> T setTenant(T entity) {
        entity.setTenant(getCurrentTenant());
        return entity;
    }
}
