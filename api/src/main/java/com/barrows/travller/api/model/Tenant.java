package com.barrows.travller.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a tenant in the multi-tenant Traveller RPG system.
 * Each tenant represents a separate game instance or campaign.
 */
@Entity
@Table(name = "tenants")
@Data
@NoArgsConstructor
public class Tenant {

    /**
     * The unique identifier for the tenant.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The name of the tenant.
     */
    @NotNull
    @NotEmpty
    @Column(nullable = false, unique = true)
    private String name;

    /**
     * A description of the tenant.
     */
    @Column(length = 2000)
    private String description;

    /**
     * Creates a new tenant with the specified name.
     *
     * @param name The name of the tenant
     */
    public Tenant(String name) {
        this.name = name;
        this.description = "";
    }

    /**
     * Creates a new tenant with the specified name and description.
     *
     * @param name The name of the tenant
     * @param description The description of the tenant
     */
    public Tenant(String name, String description) {
        this.name = name;
        this.description = description;
    }
}
