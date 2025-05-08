package com.barrows.travller.api.config;

import graphql.execution.instrumentation.Instrumentation;
import graphql.execution.instrumentation.tracing.TracingInstrumentation;
import graphql.scalars.ExtendedScalars;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

/**
 * Configuration for GraphQL with Relay support.
 */
@Configuration
public class GraphQLConfig {

    /**
     * Configure GraphQL runtime wiring with extended scalars and Relay support.
     */
    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> wiringBuilder
                .scalar(ExtendedScalars.Date)
                .scalar(ExtendedScalars.DateTime)
                .scalar(ExtendedScalars.Object)
                .scalar(ExtendedScalars.Json)
                .scalar(ExtendedScalars.Url);
    }

    /**
     * Configuration specific to local development environment.
     */
    @Configuration
    @Profile("local")
    public static class LocalGraphQLConfig {

        /**
         * Add tracing instrumentation for local development to see query execution details.
         */
        @Bean
        public Instrumentation tracingInstrumentation() {
            return new TracingInstrumentation();
        }
    }

    /**
     * Configuration specific to CICD environment.
     */
    @Configuration
    @Profile("cicd")
    public static class CicdGraphQLConfig {
        // CICD specific beans can be added here
    }

    /**
     * Configuration specific to production environment.
     */
    @Configuration
    @Profile("prod")
    public static class ProductionGraphQLConfig {
        // Production specific beans can be added here
    }
}
