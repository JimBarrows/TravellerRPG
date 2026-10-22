# Traveller RPG

A comprehensive digital platform for playing the Traveller tabletop role-playing game online.

# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk/cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   type-check the project
* `npm run watch`   watch for changes and type-check
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

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
