package com.barrows.travller.api.tenant;

import com.barrows.travller.api.model.Tenant;
import com.barrows.travller.api.repository.TenantRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * Filter to extract tenant information from incoming requests.
 * This filter intercepts all HTTP requests and determines the tenant based on a header.
 */
@Component
@Order(1)
public class TenantFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(TenantFilter.class);
    private static final String TENANT_HEADER = "X-Tenant-ID";
    private static final String DEFAULT_TENANT = "default";

    private final TenantRepository tenantRepository;

    @Autowired
    public TenantFilter(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Extract tenant ID from header
            String tenantHeader = request.getHeader(TENANT_HEADER);
            Long tenantId = null;

            if (tenantHeader != null && !tenantHeader.isEmpty()) {
                try {
                    // Try to parse the header as a tenant ID
                    tenantId = Long.parseLong(tenantHeader);
                } catch (NumberFormatException e) {
                    // If not a number, try to find tenant by name
                    Optional<Tenant> tenant = tenantRepository.findByName(tenantHeader);
                    if (tenant.isPresent()) {
                        tenantId = tenant.get().getId();
                    }
                }
            }

            // If no tenant ID found, try to use the default tenant
            if (tenantId == null) {
                Optional<Tenant> defaultTenant = tenantRepository.findByName(DEFAULT_TENANT);
                if (defaultTenant.isPresent()) {
                    tenantId = defaultTenant.get().getId();
                    logger.debug("Using default tenant: {}", DEFAULT_TENANT);
                } else {
                    logger.warn("No tenant specified and default tenant not found");
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("Tenant not specified");
                    return;
                }
            }

            // Set the tenant ID in the context
            TenantContext.setCurrentTenant(tenantId);
            logger.debug("Set tenant ID to: {}", tenantId);

            // Continue with the request
            filterChain.doFilter(request, response);
        } finally {
            // Clear the tenant ID after the request is processed
            TenantContext.clear();
            logger.debug("Cleared tenant context");
        }
    }
}
