package com.barrows.travller.api.tenant;

import com.barrows.travller.api.model.Tenant;
import com.barrows.travller.api.repository.TenantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Optional;

/**
 * GraphQL interceptor that extracts tenant information from the request and sets it in the TenantContext.
 */
@Component
public class TenantGraphQLContextBuilder implements WebGraphQlInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(TenantGraphQLContextBuilder.class);
    private static final String TENANT_HEADER = "X-Tenant-ID";
    private static final String DEFAULT_TENANT = "default";

    private final TenantRepository tenantRepository;

    public TenantGraphQLContextBuilder(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    @Override
    public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
        try {
            // Extract tenant ID from header
            String tenantHeader = request.getHeaders().getFirst(TENANT_HEADER);
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
                    throw new IllegalStateException("Tenant not specified and default tenant not found");
                }
            }

            // Set the tenant ID in the context
            final Long finalTenantId = tenantId;
            TenantContext.setCurrentTenant(finalTenantId);
            logger.debug("Set tenant ID to: {}", finalTenantId);

            // Continue with the request
            return chain.next(request)
                    .doFinally(signalType -> {
                        // Clear the tenant ID after the request is processed
                        TenantContext.clear();
                        logger.debug("Cleared tenant context");
                    });
        } catch (Exception e) {
            logger.error("Error processing tenant information", e);
            return Mono.error(e);
        }
    }
}
