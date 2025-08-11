/**
 * Environment configuration for the Traveller RPG Digital Platform
 * This file centralizes all environment-specific settings and provides
 * type safety for configuration values across the application.
 */

export interface EnvironmentConfig {
  // Basic environment settings
  environment: 'dev' | 'staging' | 'prod';
  appName: string;
  region: string;
  
  // Database configuration
  database: {
    name: string;
    port: number;
    instanceClass: string;
    multiAz: boolean;
    backupRetention: number;
    deletionProtection: boolean;
    performanceInsights: boolean;
  };

  // Authentication configuration
  auth: {
    passwordPolicy: {
      minLength: number;
      requireNumbers: boolean;
      requireSymbols: boolean;
      requireUppercase: boolean;
      requireLowercase: boolean;
    };
    mfaConfiguration: 'OFF' | 'OPTIONAL' | 'REQUIRED';
    enableSelfSignup: boolean;
    enableSocialLogin: boolean;
  };

  // API configuration
  api: {
    corsOrigins: string[];
    enableCaching: boolean;
    cacheTimeToLive: number;
    enableFieldLevelAuth: boolean;
    enableSubscriptions: boolean;
  };

  // Storage configuration
  storage: {
    enableVersioning: boolean;
    enableEncryption: boolean;
    lifecycleRules: boolean;
    enableCloudFront: boolean;
    enableLogging: boolean;
  };

  // Compute configuration
  lambda: {
    timeout: number;
    memorySize: number;
    reservedConcurrency?: number;
    enableTracing: boolean;
    enableDeadLetterQueue: boolean;
    retryAttempts: number;
  };

  // Monitoring and logging
  monitoring: {
    logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    enableDetailedMonitoring: boolean;
    enableAlarms: boolean;
    enableDashboards: boolean;
    logRetentionDays: number;
  };

  // Feature flags
  features: {
    enableAdvancedCharGen: boolean;
    enableVirtualTabletop: boolean;
    enableAiGameMaster: boolean;
    enableRealTimeUpdates: boolean;
    enableImageUpload: boolean;
    enableAudioSupport: boolean;
    enableVoiceChat: boolean;
    enableVideoChat: boolean;
  };

  // Performance settings
  performance: {
    maxConcurrentUsers: number;
    enableCaching: boolean;
    cacheTimeToLive: number;
    enableCompression: boolean;
    enableEdgeOptimization: boolean;
  };

  // Security settings
  security: {
    enableWaf: boolean;
    enableShield: boolean;
    enableGuardDuty: boolean;
    enableSecurityHub: boolean;
    enableConfigRules: boolean;
    enableCloudTrail: boolean;
  };

  // Cost optimization
  costOptimization: {
    enableSpotInstances: boolean;
    enableScheduledScaling: boolean;
    enableAutoShutdown: boolean;
    enableReservedCapacity: boolean;
  };
}

/**
 * Development environment configuration
 */
export const devConfig: EnvironmentConfig = {
  environment: 'dev',
  appName: 'TravellerRPG',
  region: 'us-east-1',
  
  database: {
    name: 'travellerrpg',
    port: 5432,
    instanceClass: 'db.t3.micro',
    multiAz: false,
    backupRetention: 7,
    deletionProtection: false,
    performanceInsights: false,
  },

  auth: {
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
      requireLowercase: true,
    },
    mfaConfiguration: 'OPTIONAL',
    enableSelfSignup: true,
    enableSocialLogin: true,
  },

  api: {
    corsOrigins: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:5173'],
    enableCaching: false,
    cacheTimeToLive: 300,
    enableFieldLevelAuth: true,
    enableSubscriptions: true,
  },

  storage: {
    enableVersioning: false,
    enableEncryption: true,
    lifecycleRules: false,
    enableCloudFront: false,
    enableLogging: false,
  },

  lambda: {
    timeout: 900, // 15 minutes for dev debugging
    memorySize: 1024,
    enableTracing: true,
    enableDeadLetterQueue: true,
    retryAttempts: 2,
  },

  monitoring: {
    logLevel: 'DEBUG',
    enableDetailedMonitoring: false,
    enableAlarms: false,
    enableDashboards: false,
    logRetentionDays: 7,
  },

  features: {
    enableAdvancedCharGen: true,
    enableVirtualTabletop: true,
    enableAiGameMaster: true,
    enableRealTimeUpdates: true,
    enableImageUpload: true,
    enableAudioSupport: false,
    enableVoiceChat: false,
    enableVideoChat: false,
  },

  performance: {
    maxConcurrentUsers: 100,
    enableCaching: false,
    cacheTimeToLive: 300,
    enableCompression: false,
    enableEdgeOptimization: false,
  },

  security: {
    enableWaf: false,
    enableShield: false,
    enableGuardDuty: false,
    enableSecurityHub: false,
    enableConfigRules: false,
    enableCloudTrail: false,
  },

  costOptimization: {
    enableSpotInstances: false,
    enableScheduledScaling: false,
    enableAutoShutdown: true,
    enableReservedCapacity: false,
  },
};

/**
 * Staging environment configuration
 */
export const stagingConfig: EnvironmentConfig = {
  ...devConfig,
  environment: 'staging',
  
  database: {
    ...devConfig.database,
    instanceClass: 'db.t3.small',
    multiAz: true,
    backupRetention: 14,
    deletionProtection: true,
    performanceInsights: true,
  },

  api: {
    ...devConfig.api,
    corsOrigins: ['https://staging.travellerrpg.com'],
    enableCaching: true,
  },

  storage: {
    ...devConfig.storage,
    enableVersioning: true,
    enableCloudFront: true,
    enableLogging: true,
  },

  lambda: {
    ...devConfig.lambda,
    timeout: 300, // 5 minutes
    memorySize: 1024,
    reservedConcurrency: 50,
  },

  monitoring: {
    ...devConfig.monitoring,
    logLevel: 'INFO',
    enableDetailedMonitoring: true,
    enableAlarms: true,
    enableDashboards: true,
    logRetentionDays: 30,
  },

  performance: {
    ...devConfig.performance,
    maxConcurrentUsers: 500,
    enableCaching: true,
    enableCompression: true,
  },

  security: {
    ...devConfig.security,
    enableWaf: true,
    enableCloudTrail: true,
  },
};

/**
 * Production environment configuration
 */
export const prodConfig: EnvironmentConfig = {
  ...stagingConfig,
  environment: 'prod',
  
  database: {
    ...stagingConfig.database,
    instanceClass: 'db.r5.large',
    multiAz: true,
    backupRetention: 30,
    deletionProtection: true,
    performanceInsights: true,
  },

  auth: {
    ...stagingConfig.auth,
    mfaConfiguration: 'OPTIONAL', // Can be upgraded to REQUIRED based on security requirements
  },

  api: {
    ...stagingConfig.api,
    corsOrigins: ['https://travellerrpg.com', 'https://www.travellerrpg.com'],
    enableCaching: true,
    cacheTimeToLive: 3600, // 1 hour
  },

  lambda: {
    ...stagingConfig.lambda,
    timeout: 300, // 5 minutes
    memorySize: 2048,
    reservedConcurrency: 100,
  },

  monitoring: {
    ...stagingConfig.monitoring,
    logLevel: 'WARN',
    enableDetailedMonitoring: true,
    enableAlarms: true,
    enableDashboards: true,
    logRetentionDays: 90,
  },

  features: {
    ...stagingConfig.features,
    enableAiGameMaster: false, // Disable expensive features in prod initially
    enableAudioSupport: true,
    enableVoiceChat: true,
    enableVideoChat: true,
  },

  performance: {
    ...stagingConfig.performance,
    maxConcurrentUsers: 1000,
    cacheTimeToLive: 3600,
    enableEdgeOptimization: true,
  },

  security: {
    enableWaf: true,
    enableShield: true,
    enableGuardDuty: true,
    enableSecurityHub: true,
    enableConfigRules: true,
    enableCloudTrail: true,
  },

  costOptimization: {
    enableSpotInstances: true,
    enableScheduledScaling: true,
    enableAutoShutdown: false,
    enableReservedCapacity: true,
  },
};

/**
 * Get environment configuration based on environment name
 */
export function getEnvironmentConfig(environment: string): EnvironmentConfig {
  switch (environment) {
    case 'dev':
      return devConfig;
    case 'staging':
      return stagingConfig;
    case 'prod':
      return prodConfig;
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}

/**
 * Validate environment configuration
 */
export function validateEnvironmentConfig(config: EnvironmentConfig): void {
  // Basic validation
  if (!config.appName) {
    throw new Error('App name is required');
  }
  
  if (!config.region) {
    throw new Error('Region is required');
  }
  
  if (!['dev', 'staging', 'prod'].includes(config.environment)) {
    throw new Error('Environment must be dev, staging, or prod');
  }
  
  // Database validation
  if (config.database.backupRetention < 1 || config.database.backupRetention > 35) {
    throw new Error('Backup retention must be between 1 and 35 days');
  }
  
  // Lambda validation
  if (config.lambda.timeout < 1 || config.lambda.timeout > 900) {
    throw new Error('Lambda timeout must be between 1 and 900 seconds');
  }
  
  if (config.lambda.memorySize < 128 || config.lambda.memorySize > 10240) {
    throw new Error('Lambda memory size must be between 128 and 10240 MB');
  }
  
  // Performance validation
  if (config.performance.maxConcurrentUsers < 1) {
    throw new Error('Max concurrent users must be at least 1');
  }
}

/**
 * Get parameter store path for a given key
 */
export function getParameterPath(appName: string, environment: string, key: string): string {
  return `/${appName}/${environment}/${key}`;
}

/**
 * Get secret name for a given key
 */
export function getSecretName(appName: string, environment: string, key: string): string {
  return `/${appName}/${environment}/${key}`;
}