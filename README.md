# Traveller RPG

A comprehensive digital platform for playing the Traveller tabletop role-playing game online.

## Project Structure

- `/api` - Spring Boot API server
- `/ui-player` - React web application for players
- `/traveller-web` - Alternative web client
- `/infrastructure` - AWS CDK infrastructure code
- `/database` - Database schemas and migrations
- `/TravellerMobile` - Mobile application

## Prerequisites

- Node.js 18+
- Java 21 (for API)
- AWS CLI configured
- Docker (optional)

## Getting Started

### Install Dependencies

```bash
# Install UI dependencies
cd ui-player && npm install

# Install infrastructure dependencies
cd ../infrastructure && npm install

# Install API dependencies
cd ../api && ./gradlew build
```

### Running Locally

```bash
# Start the API
cd api && ./gradlew bootRun

# Start the UI
cd ui-player && npm run dev

# Deploy infrastructure (requires AWS credentials)
cd infrastructure && npm run cdk deploy
```

## Development

### Pre-commit Hooks

This project uses Git hooks to ensure code quality. The hooks run automatically before each commit and check:

- Code formatting (Prettier)
- Linting (ESLint)
- Tests
- TypeScript compilation
- Commit message format

### Testing

```bash
# Run UI tests
cd ui-player && npm test

# Run API tests
cd api && ./gradlew test

# Run infrastructure tests
cd infrastructure && npm test
```

## Deployment

The project uses GitHub Actions for CI/CD. Deployments are triggered automatically:

- `main` branch → Production
- `develop` branch → Staging
- Pull requests → Run validation only

## Test Coverage

Current project test coverage status:

- **UI Player**: 73.91% (Good)
- **Infrastructure**: 100% statements, 85%+ branches (Excellent) 
- **API**: 29% with JaCoCo reporting enabled (Improving)
- **Database**: Tests exist but some failing (Needs attention)

### Coverage Reports

- UI Player: `ui-player/coverage/index.html`
- Infrastructure: Jest output
- API: `api/build/reports/jacoco/test/html/index.html`

## License

[License information here]
