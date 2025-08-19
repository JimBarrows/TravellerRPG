#!/usr/bin/env node

/**
 * Validation script for BDD E2E testing setup
 * Checks that all required components are properly configured
 */

const fs = require('fs');
const path = require('path');

class SetupValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = path.join(__dirname, '..', '..');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '✅',
      warn: '⚠️ ',
      error: '❌'
    }[type];
    
    console.log(`${prefix} ${message}`);
    
    if (type === 'error') {
      this.errors.push(message);
    } else if (type === 'warn') {
      this.warnings.push(message);
    }
  }

  checkFileExists(filePath, description, required = true) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      this.log(`${description} exists: ${filePath}`);
      return true;
    } else {
      const message = `${description} missing: ${filePath}`;
      this.log(message, required ? 'error' : 'warn');
      return false;
    }
  }

  checkDirectoryExists(dirPath, description) {
    const fullPath = path.join(this.projectRoot, dirPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      this.log(`${description} directory exists: ${dirPath}`);
      return true;
    } else {
      this.log(`${description} directory missing: ${dirPath}`, 'error');
      return false;
    }
  }

  checkPackageJsonScripts() {
    this.log('Checking package.json scripts...');
    
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const requiredScripts = [
        'e2e:build:ios',
        'e2e:test:ios',
        'e2e:build:android',
        'e2e:test:android',
        'e2e:run:ios',
        'e2e:run:android',
        'cucumber:features',
        'cucumber:report'
      ];
      
      for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.log(`Script '${script}' configured`);
        } else {
          this.log(`Script '${script}' missing`, 'error');
        }
      }
    } catch (error) {
      this.log(`Error reading package.json: ${error.message}`, 'error');
    }
  }

  checkDetoxConfiguration() {
    this.log('Checking Detox configuration...');
    
    try {
      const detoxConfigPath = path.join(this.projectRoot, '.detoxrc.js');
      if (fs.existsSync(detoxConfigPath)) {
        const detoxConfig = require(detoxConfigPath);
        
        // Check required configurations
        if (detoxConfig.apps && detoxConfig.apps['ios.debug']) {
          this.log('iOS debug app configuration found');
        } else {
          this.log('iOS debug app configuration missing', 'error');
        }
        
        if (detoxConfig.devices && detoxConfig.devices.simulator) {
          this.log('iOS simulator device configuration found');
        } else {
          this.log('iOS simulator device configuration missing', 'error');
        }
        
        if (detoxConfig.configurations && detoxConfig.configurations['ios.sim.debug']) {
          this.log('iOS simulator debug configuration found');
        } else {
          this.log('iOS simulator debug configuration missing', 'error');
        }
      } else {
        this.log('Detox configuration file missing', 'error');
      }
    } catch (error) {
      this.log(`Error reading Detox configuration: ${error.message}`, 'error');
    }
  }

  checkFeatureFiles() {
    this.log('Checking feature files...');
    
    const featureFiles = [
      'e2e/features/authentication.feature',
      'e2e/features/character-creation.feature', 
      'e2e/features/mobile-navigation.feature',
      'e2e/features/offline-functionality.feature',
      'e2e/features/push-notifications.feature'
    ];
    
    let totalScenarios = 0;
    
    for (const featureFile of featureFiles) {
      if (this.checkFileExists(featureFile, `Feature file`)) {
        // Count scenarios in each feature file
        try {
          const content = fs.readFileSync(path.join(this.projectRoot, featureFile), 'utf8');
          const scenarios = (content.match(/Scenario:/g) || []).length;
          totalScenarios += scenarios;
          this.log(`  ${featureFile}: ${scenarios} scenarios`);
        } catch (error) {
          this.log(`  Error reading ${featureFile}: ${error.message}`, 'warn');
        }
      }
    }
    
    this.log(`Total scenarios across all features: ${totalScenarios}`);
    
    if (totalScenarios >= 50) {
      this.log('✨ Excellent scenario coverage!');
    } else if (totalScenarios >= 20) {
      this.log('✨ Good scenario coverage');
    } else {
      this.log('Consider adding more test scenarios for better coverage', 'warn');
    }
  }

  checkStepDefinitions() {
    this.log('Checking step definition files...');
    
    const stepFiles = [
      'e2e/step-definitions/authentication-steps.js',
      'e2e/step-definitions/character-creation-steps.js',
      'e2e/step-definitions/navigation-steps.js',
      'e2e/step-definitions/offline-steps.js',
      'e2e/step-definitions/push-notifications-steps.js'
    ];
    
    for (const stepFile of stepFiles) {
      this.checkFileExists(stepFile, 'Step definition file');
    }
  }

  checkSupportFiles() {
    this.log('Checking support files...');
    
    const supportFiles = [
      'e2e/support/hooks.js',
      'e2e/support/detox-helper.js',
      'e2e/support/test-data.js',
      'e2e/support/generate-report.js',
      'e2e/world/World.js',
      'e2e/cucumber.config.js'
    ];
    
    for (const supportFile of supportFiles) {
      this.checkFileExists(supportFile, 'Support file');
    }
  }

  checkDirectoryStructure() {
    this.log('Checking directory structure...');
    
    const requiredDirs = [
      'e2e',
      'e2e/features',
      'e2e/step-definitions',
      'e2e/support', 
      'e2e/world'
    ];
    
    for (const dir of requiredDirs) {
      this.checkDirectoryExists(dir, `Required directory`);
    }
    
    // Create optional directories if they don't exist
    const optionalDirs = [
      'e2e/reports',
      'e2e/screenshots'
    ];
    
    for (const dir of optionalDirs) {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        this.log(`Created directory: ${dir}`);
      } else {
        this.log(`Optional directory exists: ${dir}`);
      }
    }
  }

  validateNodeModules() {
    this.log('Checking required dependencies...');
    
    const requiredDeps = [
      'detox',
      '@cucumber/cucumber',
      '@cucumber/pretty-formatter',
      'cucumber-html-reporter'
    ];
    
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const devDeps = packageJson.devDependencies || {};
      
      for (const dep of requiredDeps) {
        if (devDeps[dep]) {
          this.log(`Dependency '${dep}' installed: ${devDeps[dep]}`);
        } else {
          this.log(`Dependency '${dep}' missing`, 'error');
        }
      }
    } catch (error) {
      this.log(`Error checking dependencies: ${error.message}`, 'error');
    }
  }

  run() {
    console.log('🔍 Validating TravellerMobile BDD E2E Testing Setup...\n');
    
    this.checkDirectoryStructure();
    this.validateNodeModules();
    this.checkPackageJsonScripts();
    this.checkDetoxConfiguration();
    this.checkFeatureFiles();
    this.checkStepDefinitions();
    this.checkSupportFiles();
    
    console.log('\n📊 Validation Summary:');
    
    if (this.errors.length === 0) {
      this.log('🎉 Setup validation passed! All components are properly configured.');
    } else {
      this.log(`❌ Setup validation failed with ${this.errors.length} errors:`, 'error');
      this.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (this.warnings.length > 0) {
      this.log(`⚠️  ${this.warnings.length} warnings:`, 'warn');
      this.warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Start React Native metro server: npm start');
    console.log('   2. Build iOS app for testing: npm run e2e:build:ios');
    console.log('   3. Run BDD tests: npm run e2e:test:ios');
    console.log('   4. Generate HTML report: npm run cucumber:report');
    
    return this.errors.length === 0;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new SetupValidator();
  const success = validator.run();
  process.exit(success ? 0 : 1);
}

module.exports = SetupValidator;