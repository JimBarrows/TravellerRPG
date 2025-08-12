// Environment configuration
export const env = {
  // API Configuration
  graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:8080/graphql',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  
  // App Configuration
  appTitle: import.meta.env.VITE_APP_TITLE || 'Traveller RPG Manager',
  appVersion: import.meta.env.VITE_APP_VERSION || '0.1.0',
  
  // Feature Flags
  enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  enableDarkMode: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  
  // Development Configuration
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

export type Environment = typeof env;