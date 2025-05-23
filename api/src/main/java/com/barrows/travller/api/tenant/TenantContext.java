package com.barrows.travller.api.tenant;

/**
 * ThreadLocal storage for tenant information.
 * This class provides a way to store and retrieve the current tenant ID throughout the request lifecycle.
 */
public class TenantContext {
    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    /**
     * Sets the current tenant ID.
     *
     * @param tenantId The ID of the current tenant
     */
    public static void setCurrentTenant(Long tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    /**
     * Gets the current tenant ID.
     *
     * @return The ID of the current tenant, or null if not set
     */
    public static Long getCurrentTenant() {
        return CURRENT_TENANT.get();
    }

    /**
     * Clears the current tenant ID.
     * This should be called at the end of each request to prevent memory leaks.
     */
    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
