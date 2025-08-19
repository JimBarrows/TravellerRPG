import {
  devConfig,
  stagingConfig,
  prodConfig,
  getEnvironmentConfig,
  validateEnvironmentConfig,
  getParameterPath,
  getSecretName,
  EnvironmentConfig,
} from '../lib/config/environment';

describe('Environment Configuration', () => {
  describe('Configuration Objects', () => {
    test('dev config should have correct basic properties', () => {
      expect(devConfig.environment).toBe('dev');
      expect(devConfig.appName).toBe('TravellerRPG');
      expect(devConfig.region).toBe('us-east-1');
    });

    test('staging config should inherit from dev but override specific values', () => {
      expect(stagingConfig.environment).toBe('staging');
      expect(stagingConfig.appName).toBe('TravellerRPG');
      expect(stagingConfig.database.instanceClass).toBe('db.t3.small');
      expect(stagingConfig.database.multiAz).toBe(true);
    });

    test('prod config should have production-ready settings', () => {
      expect(prodConfig.environment).toBe('prod');
      expect(prodConfig.database.instanceClass).toBe('db.r5.large');
      expect(prodConfig.database.deletionProtection).toBe(true);
      expect(prodConfig.security.enableWaf).toBe(true);
      expect(prodConfig.security.enableShield).toBe(true);
    });
  });

  describe('Database Configuration', () => {
    test('dev should use minimal database settings', () => {
      expect(devConfig.database.instanceClass).toBe('db.t3.micro');
      expect(devConfig.database.multiAz).toBe(false);
      expect(devConfig.database.deletionProtection).toBe(false);
      expect(devConfig.database.backupRetention).toBe(7);
    });

    test('staging should use moderate database settings', () => {
      expect(stagingConfig.database.instanceClass).toBe('db.t3.small');
      expect(stagingConfig.database.multiAz).toBe(true);
      expect(stagingConfig.database.deletionProtection).toBe(true);
      expect(stagingConfig.database.backupRetention).toBe(14);
    });

    test('prod should use robust database settings', () => {
      expect(prodConfig.database.instanceClass).toBe('db.r5.large');
      expect(prodConfig.database.multiAz).toBe(true);
      expect(prodConfig.database.deletionProtection).toBe(true);
      expect(prodConfig.database.backupRetention).toBe(30);
    });
  });

  describe('Security Configuration', () => {
    test('dev should have minimal security features', () => {
      expect(devConfig.security.enableWaf).toBe(false);
      expect(devConfig.security.enableShield).toBe(false);
      expect(devConfig.security.enableGuardDuty).toBe(false);
      expect(devConfig.security.enableCloudTrail).toBe(false);
    });

    test('staging should have moderate security features', () => {
      expect(stagingConfig.security.enableWaf).toBe(true);
      expect(stagingConfig.security.enableShield).toBe(false);
      expect(stagingConfig.security.enableCloudTrail).toBe(true);
    });

    test('prod should have all security features enabled', () => {
      expect(prodConfig.security.enableWaf).toBe(true);
      expect(prodConfig.security.enableShield).toBe(true);
      expect(prodConfig.security.enableGuardDuty).toBe(true);
      expect(prodConfig.security.enableSecurityHub).toBe(true);
      expect(prodConfig.security.enableConfigRules).toBe(true);
      expect(prodConfig.security.enableCloudTrail).toBe(true);
    });
  });

  describe('Performance Configuration', () => {
    test('should scale max concurrent users across environments', () => {
      expect(devConfig.performance.maxConcurrentUsers).toBe(100);
      expect(stagingConfig.performance.maxConcurrentUsers).toBe(500);
      expect(prodConfig.performance.maxConcurrentUsers).toBe(1000);
    });

    test('should enable caching appropriately', () => {
      expect(devConfig.performance.enableCaching).toBe(false);
      expect(stagingConfig.performance.enableCaching).toBe(true);
      expect(prodConfig.performance.enableCaching).toBe(true);
    });

    test('should enable edge optimization in production', () => {
      expect(devConfig.performance.enableEdgeOptimization).toBe(false);
      expect(stagingConfig.performance.enableEdgeOptimization).toBe(false);
      expect(prodConfig.performance.enableEdgeOptimization).toBe(true);
    });
  });

  describe('Lambda Configuration', () => {
    test('should have appropriate timeouts for each environment', () => {
      expect(devConfig.lambda.timeout).toBe(900); // 15 minutes for debugging
      expect(stagingConfig.lambda.timeout).toBe(300); // 5 minutes
      expect(prodConfig.lambda.timeout).toBe(300); // 5 minutes
    });

    test('should scale memory appropriately', () => {
      expect(devConfig.lambda.memorySize).toBe(1024);
      expect(stagingConfig.lambda.memorySize).toBe(1024);
      expect(prodConfig.lambda.memorySize).toBe(2048);
    });

    test('should set reserved concurrency for non-dev environments', () => {
      expect(devConfig.lambda.reservedConcurrency).toBeUndefined();
      expect(stagingConfig.lambda.reservedConcurrency).toBe(50);
      expect(prodConfig.lambda.reservedConcurrency).toBe(100);
    });
  });

  describe('Monitoring Configuration', () => {
    test('should have appropriate log levels', () => {
      expect(devConfig.monitoring.logLevel).toBe('DEBUG');
      expect(stagingConfig.monitoring.logLevel).toBe('INFO');
      expect(prodConfig.monitoring.logLevel).toBe('WARN');
    });

    test('should have appropriate log retention', () => {
      expect(devConfig.monitoring.logRetentionDays).toBe(7);
      expect(stagingConfig.monitoring.logRetentionDays).toBe(30);
      expect(prodConfig.monitoring.logRetentionDays).toBe(90);
    });

    test('should enable monitoring features in non-dev environments', () => {
      expect(devConfig.monitoring.enableAlarms).toBe(false);
      expect(stagingConfig.monitoring.enableAlarms).toBe(true);
      expect(prodConfig.monitoring.enableAlarms).toBe(true);
    });
  });

  describe('Feature Flags', () => {
    test('should enable experimental features in dev', () => {
      expect(devConfig.features.enableAiGameMaster).toBe(true);
      expect(devConfig.features.enableAdvancedCharGen).toBe(true);
      expect(devConfig.features.enableVirtualTabletop).toBe(true);
    });

    test('should disable expensive features in production initially', () => {
      expect(prodConfig.features.enableAiGameMaster).toBe(false);
      expect(prodConfig.features.enableAudioSupport).toBe(true);
      expect(prodConfig.features.enableVoiceChat).toBe(true);
    });
  });

  describe('CORS Configuration', () => {
    test('should have development URLs in dev environment', () => {
      expect(devConfig.api.corsOrigins).toEqual([
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:5173',
      ]);
    });

    test('should have staging URL in staging environment', () => {
      expect(stagingConfig.api.corsOrigins).toEqual([
        'https://staging.travellerrpg.com',
      ]);
    });

    test('should have production URLs in prod environment', () => {
      expect(prodConfig.api.corsOrigins).toEqual([
        'https://travellerrpg.com',
        'https://www.travellerrpg.com',
      ]);
    });
  });
});

describe('Environment Configuration Functions', () => {
  describe('getEnvironmentConfig', () => {
    test('should return dev config for dev environment', () => {
      const config = getEnvironmentConfig('dev');
      expect(config).toEqual(devConfig);
    });

    test('should return staging config for staging environment', () => {
      const config = getEnvironmentConfig('staging');
      expect(config).toEqual(stagingConfig);
    });

    test('should return prod config for prod environment', () => {
      const config = getEnvironmentConfig('prod');
      expect(config).toEqual(prodConfig);
    });

    test('should throw error for unknown environment', () => {
      expect(() => getEnvironmentConfig('unknown')).toThrow('Unknown environment: unknown');
    });
  });

  describe('validateEnvironmentConfig', () => {
    test('should pass validation for valid dev config', () => {
      expect(() => validateEnvironmentConfig(devConfig)).not.toThrow();
    });

    test('should pass validation for valid staging config', () => {
      expect(() => validateEnvironmentConfig(stagingConfig)).not.toThrow();
    });

    test('should pass validation for valid prod config', () => {
      expect(() => validateEnvironmentConfig(prodConfig)).not.toThrow();
    });

    test('should throw error for missing app name', () => {
      const invalidConfig: EnvironmentConfig = { ...devConfig, appName: '' };
      expect(() => validateEnvironmentConfig(invalidConfig)).toThrow('App name is required');
    });

    test('should throw error for missing region', () => {
      const invalidConfig: EnvironmentConfig = { ...devConfig, region: '' };
      expect(() => validateEnvironmentConfig(invalidConfig)).toThrow('Region is required');
    });

    test('should throw error for invalid environment', () => {
      const invalidConfig: EnvironmentConfig = { ...devConfig, environment: 'invalid' as any };
      expect(() => validateEnvironmentConfig(invalidConfig)).toThrow('Environment must be dev, staging, or prod');
    });

    test('should throw error for invalid backup retention', () => {
      const invalidConfig: EnvironmentConfig = {
        ...devConfig,
        database: { ...devConfig.database, backupRetention: 40 },
      };
      expect(() => validateEnvironmentConfig(invalidConfig)).toThrow('Backup retention must be between 1 and 35 days');
    });

    test('should throw error for invalid lambda timeout', () => {
      const invalidConfig: EnvironmentConfig = {
        ...devConfig,
        lambda: { ...devConfig.lambda, timeout: 1000 },
      };
      expect(() => validateEnvironmentConfig(invalidConfig)).toThrow('Lambda timeout must be between 1 and 900 seconds');
    });

    test('should throw error for invalid lambda memory size', () => {
      const invalidConfig: EnvironmentConfig = {
        ...devConfig,
        lambda: { ...devConfig.lambda, memorySize: 50 },
      };
      expect(() => validateEnvironmentConfig(invalidConfig)).toThrow('Lambda memory size must be between 128 and 10240 MB');
    });

    test('should throw error for invalid max concurrent users', () => {
      const invalidConfig: EnvironmentConfig = {
        ...devConfig,
        performance: { ...devConfig.performance, maxConcurrentUsers: 0 },
      };
      expect(() => validateEnvironmentConfig(invalidConfig)).toThrow('Max concurrent users must be at least 1');
    });
  });

  describe('getParameterPath', () => {
    test('should generate correct parameter store path', () => {
      const path = getParameterPath('TravellerRPG', 'dev', 'database/password');
      expect(path).toBe('/TravellerRPG/dev/database/password');
    });

    test('should handle different app names and environments', () => {
      const path = getParameterPath('MyApp', 'prod', 'api/key');
      expect(path).toBe('/MyApp/prod/api/key');
    });
  });

  describe('getSecretName', () => {
    test('should generate correct secret name', () => {
      const secretName = getSecretName('TravellerRPG', 'dev', 'database/credentials');
      expect(secretName).toBe('/TravellerRPG/dev/database/credentials');
    });

    test('should handle different app names and environments', () => {
      const secretName = getSecretName('MyApp', 'staging', 'oauth/client-secret');
      expect(secretName).toBe('/MyApp/staging/oauth/client-secret');
    });
  });
});

describe('Configuration Consistency', () => {
  test('all environments should have the same configuration structure', () => {
    const devKeys = Object.keys(devConfig);
    const stagingKeys = Object.keys(stagingConfig);
    const prodKeys = Object.keys(prodConfig);

    expect(stagingKeys.sort()).toEqual(devKeys.sort());
    expect(prodKeys.sort()).toEqual(devKeys.sort());
  });

  test('all database configurations should have required properties', () => {
    const configs = [devConfig, stagingConfig, prodConfig];
    const requiredDbProps = ['name', 'port', 'instanceClass', 'multiAz', 'backupRetention', 'deletionProtection'];

    configs.forEach((config) => {
      requiredDbProps.forEach((prop) => {
        expect(config.database).toHaveProperty(prop);
      });
    });
  });

  test('all security configurations should have required properties', () => {
    const configs = [devConfig, stagingConfig, prodConfig];
    const requiredSecurityProps = [
      'enableWaf',
      'enableShield',
      'enableGuardDuty',
      'enableSecurityHub',
      'enableConfigRules',
      'enableCloudTrail',
    ];

    configs.forEach((config) => {
      requiredSecurityProps.forEach((prop) => {
        expect(config.security).toHaveProperty(prop);
      });
    });
  });

  test('prod should have stricter security than dev', () => {
    const prodSecurityFeatures = Object.values(prodConfig.security).filter(Boolean).length;
    const devSecurityFeatures = Object.values(devConfig.security).filter(Boolean).length;

    expect(prodSecurityFeatures).toBeGreaterThan(devSecurityFeatures);
  });

  test('prod should have higher performance limits than dev', () => {
    expect(prodConfig.performance.maxConcurrentUsers).toBeGreaterThan(devConfig.performance.maxConcurrentUsers);
    expect(prodConfig.lambda.memorySize).toBeGreaterThanOrEqual(devConfig.lambda.memorySize);
  });
});