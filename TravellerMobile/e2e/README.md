# TravellerMobile BDD E2E Testing Suite

This directory contains the complete Behavior-Driven Development (BDD) testing framework for the TravellerMobile React Native application using Detox and Cucumber.

## Overview

The BDD test suite provides comprehensive end-to-end testing for mobile-specific functionality including:

- **Authentication flows** with biometric support
- **Character creation** with mobile-optimized wizard interface
- **Mobile navigation** with gestures and touch interactions
- **Offline functionality** with synchronization scenarios
- **Push notifications** handling and settings management

## Architecture

```
e2e/
├── features/                  # Gherkin feature files
│   ├── authentication.feature
│   ├── character-creation.feature
│   ├── mobile-navigation.feature
│   ├── offline-functionality.feature
│   └── push-notifications.feature
├── step-definitions/          # Step implementation files
│   ├── authentication-steps.js
│   ├── character-creation-steps.js
│   ├── navigation-steps.js
│   ├── offline-steps.js
│   └── push-notifications-steps.js
├── support/                   # Test utilities and configuration
│   ├── hooks.js              # BeforeAll/AfterAll hooks
│   ├── detox-helper.js       # Detox interaction utilities
│   ├── test-data.js          # Test data management
│   └── generate-report.js    # HTML report generation
├── world/                     # Test world and context
│   └── World.js              # Custom World class
├── reports/                   # Generated test reports
├── screenshots/               # Test failure screenshots
└── cucumber.config.js         # Cucumber configuration
```

## Features Coverage

### 🔐 Authentication (7 scenarios)
- Login with valid/invalid credentials
- User registration and email verification
- Biometric authentication setup and usage
- Secure logout process

### 👤 Character Creation (10 scenarios)  
- Mobile wizard interface navigation
- Form validation and data persistence
- Mobile-specific input methods (touch, swipe, scroll)
- Camera integration for character portraits

### 📱 Mobile Navigation (14 scenarios)
- Tab bar and drawer navigation
- Touch gestures (swipe, pinch, long-press)
- Hardware back button handling
- Accessibility navigation support

### 🔄 Offline Functionality (12 scenarios)
- Offline character access and editing
- Data synchronization and conflict resolution
- Network status management
- Background sync processing

### 🔔 Push Notifications (13 scenarios)
- Campaign invitations and session reminders
- Character updates and dice roll notifications
- Notification settings and quiet hours
- Interactive notification actions

**Total: 56 comprehensive BDD scenarios covering mobile-specific functionality**

## Prerequisites

- Node.js >= 18
- React Native development environment
- iOS Simulator (for iOS testing)
- Android Emulator (for Android testing)
- Xcode (for iOS builds)
- Android Studio (for Android builds)

## Installation

Dependencies are already installed as part of the project setup:

```bash
# Dependencies included:
# - detox: E2E testing framework
# - @cucumber/cucumber: BDD test runner
# - @cucumber/pretty-formatter: Enhanced output formatting
# - cucumber-html-reporter: HTML report generation
```

## Configuration

### Detox Configuration (`.detoxrc.js`)

The Detox configuration is set up for both iOS and Android platforms:

- **iOS Simulator**: iPhone 15 with debug/release builds
- **Android Emulator**: Pixel_3a_API_30_x86 with debug/release builds
- **Test Runner**: Cucumber-js with custom configuration

### Cucumber Configuration (`e2e/cucumber.config.js`)

- **Step Definitions**: Automatically loaded from `e2e/step-definitions/`
- **Support Files**: Test utilities and hooks
- **Reporting**: JSON, HTML, and console output formats
- **Timeout**: 120 seconds for mobile operations
- **Parallel Execution**: Disabled for mobile testing stability

## Usage

### Running Tests

```bash
# Run all iOS E2E tests
npm run e2e:run:ios

# Run all Android E2E tests  
npm run e2e:run:android

# Build only (without running tests)
npm run e2e:build:ios
npm run e2e:build:android

# Run tests only (assumes app is built)
npm run e2e:test:ios
npm run e2e:test:android

# Run Cucumber features independently
npm run cucumber:features

# Generate HTML reports
npm run cucumber:report
```

### Running Specific Features

```bash
# Run specific feature file
npx cucumber-js e2e/features/authentication.feature

# Run scenarios with specific tags
npx cucumber-js e2e/features --tags "@smoke"
npx cucumber-js e2e/features --tags "@authentication"
npx cucumber-js e2e/features --tags "@critical"

# Run excluding certain tags
npx cucumber-js e2e/features --tags "not @slow"
```

## Test Tags

Features are organized using Cucumber tags for selective test execution:

- `@smoke` - Critical functionality tests
- `@critical` - High-priority scenarios
- `@authentication` - Login/logout scenarios
- `@character-creation` - Character building workflows
- `@navigation` - Mobile navigation patterns
- `@gestures` - Touch gesture interactions
- `@offline` - Offline functionality
- `@sync` - Data synchronization
- `@notifications` - Push notification handling
- `@mobile` - Mobile-specific behaviors

## Helper Utilities

### DetoxHelper Class

Provides simplified methods for common mobile interactions:

```javascript
// Element interactions
await DetoxHelper.tapElement('button-id');
await DetoxHelper.typeText('input-id', 'text');
await DetoxHelper.clearAndType('input-id', 'new-text');

// Gestures
await DetoxHelper.swipeLeft('carousel-id');
await DetoxHelper.longPress('item-id');
await DetoxHelper.scrollToElement('list-id', 'target-id');

// Assertions  
await DetoxHelper.expectElementVisible('element-id');
await DetoxHelper.expectTextVisible('Expected Text');

// Wait utilities
await DetoxHelper.waitForElement('loading-id', 10000);
```

### Test World

Custom World class provides:

- Screenshot capture on test failure
- Test data management across scenarios
- Device interaction helpers
- Cleanup utilities

### Test Data Manager

Centralized test data including:

- User credentials (valid/invalid)
- Character templates
- Equipment catalogs
- Notification payloads
- Random data generators

## Reporting

### Console Output
Real-time test execution with detailed step information and failure details.

### HTML Reports  
Comprehensive HTML reports generated in `e2e/reports/cucumber-report.html` including:

- Scenario execution status
- Step-by-step results
- Failure screenshots
- Execution metadata
- Test duration metrics

### Screenshots
Automatic screenshot capture on test failures saved to `e2e/screenshots/`.

## Best Practices

### Test Organization
- Keep scenarios focused on single user journeys
- Use Background steps to reduce duplication
- Tag scenarios appropriately for selective execution
- Maintain clear Given-When-Then structure

### Mobile Testing
- Always wait for elements before interaction
- Use appropriate timeouts for mobile operations
- Test both portrait and landscape orientations
- Include network condition variations
- Test with different device sizes

### Data Management
- Use the TestDataManager for consistent test data
- Clean up test data between scenarios
- Isolate tests to avoid dependencies
- Use appropriate test data for different scenarios

### Performance Considerations
- Run tests on simulators/emulators for consistency
- Use parallel execution cautiously with mobile tests  
- Include performance assertions where relevant
- Monitor test execution times

## Troubleshooting

### Common Issues

1. **App Build Failures**
   ```bash
   # Clean builds
   cd ios && xcodebuild clean
   cd android && ./gradlew clean
   ```

2. **Simulator/Emulator Issues**
   ```bash
   # Reset iOS simulator
   xcrun simctl erase all
   
   # Cold boot Android emulator
   emulator -avd Pixel_3a_API_30_x86 -cold-boot
   ```

3. **Element Not Found**
   - Verify element IDs in React Native code
   - Check element hierarchy with Detox debugger
   - Increase wait timeouts for slow operations

4. **Network Simulation**
   - Use device settings to simulate network conditions
   - Test offline scenarios thoroughly
   - Verify synchronization logic

### Debug Mode

Enable verbose logging:

```bash
# Detox debug mode
npm run e2e:test:ios -- --loglevel verbose

# Cucumber debug
DEBUG=cucumber npm run cucumber:features
```

## Contributing

When adding new scenarios:

1. Create feature files using proper Gherkin syntax
2. Implement step definitions with appropriate waits/assertions
3. Add test data to TestDataManager if needed
4. Update this README with new features
5. Tag scenarios appropriately
6. Test on both iOS and Android platforms

## Integration

This BDD test suite integrates with:

- **CI/CD**: Scripts can be run in automated pipelines  
- **Performance Monitoring**: Metrics collection during test runs
- **Bug Tracking**: Link test failures to bug reports
- **Code Coverage**: Integration with coverage tools
- **Accessibility**: WCAG compliance testing scenarios

The mobile BDD testing framework ensures comprehensive coverage of TravellerMobile's unique mobile functionality while maintaining the flexibility to adapt to changing requirements and new features.