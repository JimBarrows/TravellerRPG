# Traveller RPG Database

Comprehensive database schema and migration management for the Traveller RPG Digital Platform.

## Overview

This package provides:
- **Prisma Schema**: Complete database schema for all Traveller RPG game entities
- **Migrations**: Deployment scripts for AWS RDS PostgreSQL instances
- **Utilities**: Game-specific calculation and validation functions
- **Seed Data**: Initial data including canonical Traveller systems and test data
- **Type Safety**: Full TypeScript support for all database operations

## Database Schema

### Core Tables

- **Users & Authentication**: User profiles, subscriptions, authentication
- **Campaigns**: Game campaigns, members, sessions, and house rules
- **Characters**: Character sheets, characteristics, skills, equipment, life events
- **Game World**: Star systems, planets, starships, trade routes and goods
- **Gameplay**: Combat sessions, encounters, dice rolls, and custom content

### Key Features

- **Multi-tenant Architecture**: Campaigns isolate user data
- **Flexible Character System**: Supports all Traveller character creation rules
- **Complete World Data**: UWP parsing, trade classifications, hex distances
- **Audit Trail**: Comprehensive logging of game events and changes
- **Performance Optimized**: Strategic indexes and efficient queries

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ database
- AWS RDS instance (for production)

### Installation

```bash
npm install
npm run build
```

### Environment Setup

Copy `.env.example` to `.env` and configure your database URLs:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### Deploy Schema

```bash
# Deploy to development database
npm run deploy:dev

# Deploy to production (AWS RDS)
npm run deploy:prod

# Full deployment with seed data
npm run deploy:full:dev
```

## Database Operations

### Schema Management

```bash
# Validate Prisma schema
npm run db:validate

# Generate Prisma Client
npm run prisma:generate

# Open Prisma Studio (database browser)
npm run prisma:studio
```

### Migrations

```bash
# Deploy schema to development
npm run deploy:dev

# Deploy schema to production
npm run deploy:prod

# Deploy with seed data
npm run deploy:full:dev
```

### Testing

```bash
# Run all tests
npm test

# Run utility tests only (no database required)
npm run test:standalone

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Data Management

```bash
# Seed development database
npm run seed:dev

# Reset development database (DESTRUCTIVE)
npm run reset:dev
```

## Schema Details

### User Management

```typescript
// User with subscription tiers
model User {
  id               String   @id @default(cuid())
  email            String   @unique
  displayName      String?
  subscriptionTier SubscriptionTier @default(FREE)
  campaigns        Campaign[]
  characters       Character[]
}
```

### Campaign System

```typescript
// Campaign with house rules and member management
model Campaign {
  id          String   @id @default(cuid())
  name        String
  description String?
  gamemaster  User     @relation("GamemasterCampaigns")
  members     CampaignMember[]
  characters  Character[]
  sessions    Session[]
  houseRules  Json?    // Flexible house rules storage
}
```

### Character Sheets

```typescript
// Complete character with characteristics, skills, equipment
model Character {
  id              String         @id @default(cuid())
  name            String
  characteristics Characteristics?
  skills          CharacterSkill[]
  equipment       CharacterEquipment[]
  lifeEvents      LifeEvent[]
}
```

### World Generation

```typescript
// Star system with UWP and trade classifications
model Planet {
  id          String   @id @default(cuid())
  name        String
  uwp         String   // Universal World Profile (e.g., "A867569-C")
  tradeCodes  String[] // Trade classifications (e.g., ["Ag", "Hi", "Ri"])
  starport    String   // A-E, X
  size        Int      // 0-10 (hex A)
  population  Int      // 0-15 (hex A-F)
}
```

## Utility Functions

### Character Calculations

```typescript
import { calculateCharacteristicModifier, calculateDerivedCharacteristics } from './src/utilities';

// Calculate DMs from characteristics
const strengthDM = calculateCharacteristicModifier(11); // Returns +1

// Calculate derived characteristics
const derived = calculateDerivedCharacteristics({
  strength: 8, dexterity: 11, endurance: 9,
  intelligence: 10, education: 12, socialStanding: 7
});
// Returns: { physicalDamage: 8, mentalDamage: 11, strengthDM: 0, ... }
```

### World Generation

```typescript
import { parseUWP, determineTradeClassifications, calculateHexDistance } from './src/utilities';

// Parse Universal World Profile
const regina = parseUWP('A788899-C');
// Returns: { starport: 'A', size: 7, atmosphere: 8, ... }

// Determine trade codes
const tradeCodes = determineTradeClassifications(regina);
// Returns: ['Ag', 'Hi', 'Ri'] etc.

// Calculate hex map distances
const distance = calculateHexDistance('1910', '2716'); // Regina to Rhylanor
// Returns: 11 (parsecs)
```

### Dice Rolling

```typescript
import { rollDice, performTaskCheck } from './src/utilities';

// Roll dice with modifiers
const roll = rollDice('2d6+1', [
  { name: 'skill', value: 2 },
  { name: 'difficulty', value: -1 }
]);
// Returns: { dice: '2d6+1', individual: [4, 3], total: 7, finalResult: 9, ... }

// Traveller task check
const check = performTaskCheck(2, 1, 8); // skill 2, characteristic DM +1, difficulty 8
// Returns: { success: true/false, effect: +/-N, ... }
```

## AWS RDS Integration

### Production Deployment

The database is designed to work with AWS RDS PostgreSQL instances. Configure your RDS credentials in `.env`:

```bash
RDS_HOSTNAME="your-rds-endpoint.amazonaws.com"
RDS_PORT="5432"
RDS_DB_NAME="travellerrpg"
RDS_USERNAME="dbadmin"
RDS_PASSWORD="your-secure-password"
```

Deploy to production:

```bash
npm run deploy:prod
```

### Security Considerations

- Enable RDS encryption at rest
- Use AWS Secrets Manager for credentials
- Configure VPC security groups properly
- Enable automated backups and point-in-time recovery
- Monitor with CloudWatch and set up alerts

## API Integration

The database client is exported for use in other packages:

```typescript
import { db, disconnect } from '@travellerrpg/database';

// Use Prisma client
const users = await db.user.findMany();

// Always disconnect when done
await disconnect();
```

## Development Workflow

### Adding New Features

1. Update `prisma/schema.prisma` with new models/fields
2. Add utility functions to `src/utilities.ts` if needed
3. Write tests in `test/` directory
4. Run tests: `npm test`
5. Deploy to development: `npm run deploy:dev`
6. Update seed data if needed

### Schema Changes

1. Modify `prisma/schema.prisma`
2. Validate: `npm run db:validate`
3. Test locally: `npm run deploy:dev`
4. Deploy to production: `npm run deploy:prod`

**⚠️ Warning**: Production deployments are irreversible. Always test thoroughly in development first.

## Troubleshooting

### Common Issues

**"Can't reach database server"**
- Check database credentials in `.env`
- Ensure database server is running
- Verify network connectivity (VPN for RDS)

**"Environment variable not found: DATABASE_URL"**
- Create `.env` file from `.env.example`
- Set correct database URL for your environment

**Schema validation errors**
- Run `npm run db:validate` to check schema
- Fix any syntax errors in `prisma/schema.prisma`

**Migration failures**
- Check database user has sufficient privileges
- Ensure no conflicting data exists
- Use `--accept-data-loss` flag for destructive changes (development only)

### Getting Help

1. Check the logs in console output
2. Use `npx prisma studio` to browse database visually
3. Enable query logging: `ENABLE_QUERY_LOGGING=true`
4. Check AWS RDS logs for connection issues

## Contributing

1. Follow TypeScript and Prisma best practices
2. Add tests for all new utilities
3. Update documentation for schema changes
4. Test against both development and production environments
5. Use semantic commit messages

## License

MIT License - see LICENSE file for details.