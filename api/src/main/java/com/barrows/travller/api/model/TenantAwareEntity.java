package com.barrows.travller.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Base class for all entities that are tenant-aware in the multi-tenant Traveller RPG system.
 * This class provides common tenant-related functionality.
 */
@MappedSuperclass
@Getter
@Setter
public abstract class TenantAwareEntity {

    /**
     * The tenant that owns this entity.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;
}
