# Traveller RPG E2E Testing Suite

A comprehensive end-to-end testing framework using Playwright and Cucumber for the Traveller RPG platform, covering web, mobile web, and API integration testing.

## 🎯 Overview

This E2E testing suite provides:

- **Cross-platform testing** across web, mobile web, and API
- **Multi-browser support** (Chrome, Firefox, Safari, Mobile browsers)
- **BDD approach** with Cucumber for readable test scenarios
- **Real-time testing** for live campaign features
- **API integration testing** including GraphQL
- **Performance and load testing** capabilities
- **CI/CD integration** with automated reporting

## 📁 Project Structure

```
e2e/
├── features/                    # Cucumber feature files
│   ├── authentication/         # Auth-related scenarios
│   ├── character/              # Character creation & management
│   ├── campaign/               # Campaign & real-time features
│   ├── gameplay/               # Dice rolling & game mechanics
│   ├── cross-platform/         # Cross-platform sync scenarios
│   └── api/                    # API-specific testing
├── step-definitions/           # Cucumber step implementations
│   ├── authentication.steps.js
│   ├── login.steps.js
│   ├── character-creation.steps.js
│   ├── api.steps.js
│   └── cross-platform.steps.js
├── support/                    # Test utilities and setup
│   ├── setup.js               # Playwright/Cucumber setup
│   ├── world.js               # Custom world with helpers
│   ├── test-data-manager.js   # Test data generation/cleanup
│   ├── setup-test-data.js     # Data setup script
│   └── cleanup-test-data.js   # Data cleanup script
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Java 21+ (for API service)
- PostgreSQL (for test database)

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Install Playwright browsers:**

```bash
npm run e2e:install
```

3. **Set up environment variables:**

```bash
# Copy and edit environment file
cp .env.example .env

# Set these variables:
API_URL=http://localhost:8080
BASE_URL=http://localhost:5173
DATABASE_URL=postgresql://user:pass@localhost:5432/traveller_test
```

### Running Tests

#### Basic Test Execution

```bash
# Run all smoke tests
npm run e2e:test:smoke

# Run regression tests
npm run e2e:test:regression

# Run with headed browser (visible)
npm run e2e:test:headed

# Run specific test tags
TAGS=@character npm run e2e:test

# Run on specific browser
BROWSER=firefox npm run e2e:test
```

#### Platform-Specific Testing

```bash
# Mobile testing
npm run e2e:test:mobile

# Cross-platform scenarios
npm run e2e:test:cross-platform

# API-only testing
npm run e2e:test:api
```

#### Advanced Options

```bash
# Run with custom tags and browser
TAGS="@smoke and @character" BROWSER=webkit npm run e2e:test

# Run with debugging
npm run e2e:playwright:debug

# Run with UI mode
npm run e2e:playwright:ui

# Performance testing
TAGS=@performance npm run e2e:test
```

## 🧪 Test Categories

### Smoke Tests (`@smoke`)

Critical path scenarios that must pass for basic functionality:

- User registration and login
- Character creation basics
- Campaign joining
- API health checks

### Regression Tests (`@regression`)

Comprehensive testing covering all features:

- Complete user workflows
- Edge cases and error scenarios
- Cross-platform synchronization
- Performance requirements

### Mobile Tests (`@mobile`)

Mobile-specific scenarios:

- Touch interface interactions
- Responsive design validation
- Mobile navigation patterns
- Offline functionality

### API Tests (`@api`)

Backend and GraphQL testing:

- CRUD operations
- Data validation
- Authentication/authorization
- Performance and scalability

### Cross-Platform Tests (`@cross-platform`)

Multi-platform synchronization:

- Data sync across devices
- Real-time updates
- Session management
- Offline/online transitions

## 🎮 Test Features Coverage

### Authentication & User Management

- ✅ User registration with email verification
- ✅ Login/logout across platforms
- ✅ JWT token management and refresh
- ✅ Session persistence and security
- ✅ Password strength validation
- ✅ Account lockout protection

### Character Creation & Management

- ✅ Complete character creation wizard
- ✅ Characteristic generation and modification
- ✅ Career path selection and progression
- ✅ Skill advancement system
- ✅ Equipment management
- ✅ Character sheet validation
- ✅ Portrait upload and management
- ✅ Character data synchronization

### Campaign & Real-Time Features

- ✅ Campaign creation and management
- ✅ Player invitation and joining
- ✅ Real-time dice rolling
- ✅ Live chat and communication
- ✅ Initiative and turn management
- ✅ Shared maps and tokens
- ✅ Session persistence
- ✅ Notification system

### Cross-Platform & Data Sync

- ✅ Character sync between devices
- ✅ Campaign state synchronization
- ✅ Real-time update propagation
- ✅ Conflict resolution
- ✅ Offline handling
- ✅ Progressive sync with poor connectivity

### API & GraphQL Integration

- ✅ GraphQL query optimization
- ✅ Mutation error handling
- ✅ Pagination with Relay connections
- ✅ Subscription real-time updates
- ✅ Custom scalar types
- ✅ Performance monitoring

## 🛠 Test Data Management

### Automated Test Data Setup

```bash
# Create test users, characters, and campaigns
npm run e2e:setup

# Create additional load testing data
node e2e/support/setup-test-data.js --with-load-data

# Clean up all test data
npm run e2e:teardown
```

### Test Data Structure

The system creates:

- **Admin user**: Full system access
- **GM user**: Game master capabilities
- **Player users**: Regular player accounts (3)
- **Test characters**: Sample characters for each user
- **Test campaigns**: Sample campaigns for testing
- **Load test data**: Additional data for performance testing

### Cleanup Options

```bash
# Full cleanup
npm run e2e:teardown

# Selective cleanup
node e2e/support/cleanup-test-data.js --selective --characters
node e2e/support/cleanup-test-data.js --selective --artifacts

# Force cleanup (no confirmation)
npm run e2e:teardown --force
```

## 📊 Test Reporting

### Report Types

1. **HTML Reports**: Visual test results with screenshots
2. **JSON Reports**: Machine-readable results for CI/CD
3. **JUnit XML**: Integration with test management systems
4. **Performance Reports**: Response times and load metrics

### Accessing Reports

```bash
# Open latest HTML report
npm run e2e:report

# Generate custom report
npx cucumber-html-reporter --input e2e-results/cucumber-report.json --output custom-report.html
```

### CI Integration

The test suite includes GitHub Actions workflow (`.github/workflows/e2e-tests.yml`) that:

- Runs tests on PR and push to main/develop
- Executes nightly comprehensive test runs
- Provides test result comments on PRs
- Archives test artifacts and reports

## 🎨 Writing New Tests

### Creating Feature Files

```gherkin
@smoke @new-feature
Feature: New Feature Testing
  As a user
  I want to test new functionality
  So that it works correctly

  Background:
    Given the application is running
    And I am logged in as a verified user

  @ui @desktop
  Scenario: Test new feature on desktop
    Given I am on the new feature page
    When I perform some action
    Then I should see expected results
    And the data should be persisted
```

### Implementing Step Definitions

```javascript
import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

Given("I am on the new feature page", async function () {
  await this.navigateTo("/new-feature");
  await this.waitForElement('[data-testid="new-feature-page"]');
});

When("I perform some action", async function () {
  await this.clickElement('[data-testid="action-button"]');
});

Then("I should see expected results", async function () {
  await this.waitForElement('[data-testid="results"]');
  const results = await this.page.textContent('[data-testid="results"]');
  expect(results).toContain("Expected text");
});
```

### Using Test Helpers

The custom world provides helpful methods:

```javascript
// Navigation
await this.navigateTo("/path");

// Form interaction
await this.fillField('[data-testid="input"]', "value");
await this.clickElement('[data-testid="button"]');

// Waiting and verification
await this.waitForElement('[data-testid="element"]');
await this.waitForAPIResponse("endpoint", "POST");

// Test data management
const user = this.generateTestUser();
this.storeTestData("key", value);
const data = this.getTestData("key");

// Screenshots
await this.takeScreenshot("test-state");
```

## 🔧 Configuration

### Environment Variables

| Variable       | Default                 | Description                   |
| -------------- | ----------------------- | ----------------------------- |
| `API_URL`      | `http://localhost:8080` | Backend API base URL          |
| `BASE_URL`     | `http://localhost:5173` | Frontend application URL      |
| `DATABASE_URL` | -                       | PostgreSQL connection string  |
| `HEADLESS`     | `true`                  | Run browsers in headless mode |
| `SLOW_MO`      | `0`                     | Slow down actions (ms)        |
| `BROWSER`      | `chromium`              | Primary browser for testing   |
| `TAGS`         | `@smoke`                | Cucumber tags to execute      |
| `VIDEO`        | `false`                 | Record test videos            |
| `TRACE`        | `false`                 | Capture Playwright traces     |

### Browser Configuration

Supported browsers and devices:

- **Desktop**: Chrome, Firefox, Safari (1280x720)
- **Mobile**: iPhone 12, Pixel 5, iPad Pro
- **Custom**: Define viewport and user agent

### Tag Strategy

Test organization using Cucumber tags:

- `@smoke`: Critical functionality (runs on every PR)
- `@regression`: Full feature coverage (nightly runs)
- `@api`: Backend/GraphQL testing
- `@ui`: Frontend interface testing
- `@mobile`: Mobile-specific scenarios
- `@cross-platform`: Multi-device testing
- `@performance`: Load and timing tests
- `@security`: Authentication and authorization

## 📈 Performance Testing

### Load Test Scenarios

```bash
# Generate load test data (50 users, 5 chars each)
node e2e/support/setup-test-data.js --with-load-data

# Run performance tests
TAGS=@performance npm run e2e:test

# Monitor during test execution
# - Response times
# - Memory usage
# - Database connections
# - WebSocket connections
```

### Performance Assertions

Tests include performance validations:

- Page load times < 3 seconds
- API responses < 2 seconds
- Character creation < 5 seconds
- Real-time updates < 1 second

## 🚨 Troubleshooting

### Common Issues

**Tests failing with timeout errors:**

```bash
# Increase timeout globally
TIMEOUT=120000 npm run e2e:test

# Or debug specific test
npm run e2e:playwright:debug
```

**Browser installation issues:**

```bash
# Reinstall browsers
npx playwright install --force --with-deps
```

**API connection failures:**

```bash
# Verify API is running
curl http://localhost:8080/health

# Check database connection
psql $DATABASE_URL -c "SELECT 1"
```

**Test data conflicts:**

```bash
# Clean up existing data
npm run e2e:teardown --force

# Reset and recreate
npm run e2e:setup
```

### Debug Mode

```bash
# Run with debug output
DEBUG=* npm run e2e:test

# Run single scenario with debugging
npx cucumber-js e2e/features/authentication/login-flow.feature:15 --require e2e/step-definitions --require e2e/support
```

### Verbose Logging

Enable detailed logging:

```bash
# Set in environment or .env file
CUCUMBER_VERBOSE=true
PLAYWRIGHT_DEBUG=true
TEST_DEBUG=true
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [Traveller RPG Game Rules](https://www.mongoosepublishing.com/us/rpgs/traveller)
- [GraphQL Testing Best Practices](https://graphql.org/learn/best-practices/)

## 🤝 Contributing

When adding new tests:

1. **Follow BDD principles**: Write scenarios that describe business value
2. **Use appropriate tags**: Tag scenarios for proper test organization
3. **Maintain test data**: Clean up after test execution
4. **Cross-platform coverage**: Consider mobile and desktop variants
5. **Performance awareness**: Include timing assertions where relevant
6. **Documentation**: Update this README for new features

## 📄 License

This E2E testing suite is part of the Traveller RPG project. See the main project license for details.
