package com.barrows.travller.api.graphql;

import com.barrows.travller.api.model.Tenant;
import com.barrows.travller.api.repository.TenantRepository;
import com.barrows.travller.api.tenant.TenantService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL resolver for Tenant-related queries and mutations.
 */
@Controller
public class TenantResolver {

    private final TenantRepository tenantRepository;
    private final TenantService tenantService;

    public TenantResolver(TenantRepository tenantRepository, TenantService tenantService) {
        this.tenantRepository = tenantRepository;
        this.tenantService = tenantService;
    }

    /**
     * Query to get a tenant by ID.
     */
    @QueryMapping
    public Tenant tenant(@Argument Long id) {
        return tenantRepository.findById(id).orElse(null);
    }

    /**
     * Query to get all tenants.
     */
    @QueryMapping
    public List<Tenant> tenants() {
        return tenantRepository.findAll();
    }

    /**
     * Query to get the current tenant.
     */
    @QueryMapping
    public Tenant currentTenant() {
        return tenantService.getCurrentTenant();
    }

    /**
     * Mutation to create a new tenant.
     */
    @MutationMapping
    public Tenant createTenant(@Argument TenantInput input) {
        Tenant tenant = new Tenant(input.getName(), input.getDescription());
        return tenantRepository.save(tenant);
    }

    /**
     * Mutation to update an existing tenant.
     */
    @MutationMapping
    public Tenant updateTenant(@Argument Long id, @Argument TenantInput input) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        tenant.setName(input.getName());
        tenant.setDescription(input.getDescription());

        return tenantRepository.save(tenant);
    }

    /**
     * Input class for tenant creation/update.
     */
    public static class TenantInput {
        private String name;
        private String description;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
