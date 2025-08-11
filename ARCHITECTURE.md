# Technical Architecture Document
# Traveller RPG Digital Platform

## System Overview

The Traveller RPG Digital Platform is a cloud-native, serverless application built on AWS infrastructure using a modern microservices architecture. The system comprises a React web application, React Native mobile applications, and a GraphQL API backend powered by AWS AppSync.

## Architecture Principles

### Core Principles
1. **Serverless First**: Minimize operational overhead using managed services
2. **Event-Driven**: Loosely coupled services communicating via events
3. **API-First Design**: GraphQL API as the single source of truth
4. **Mobile-First UX**: Responsive design with offline capabilities
5. **Security by Design**: Zero-trust architecture with defense in depth
6. **Cost Optimization**: Pay-per-use model with auto-scaling
7. **High Availability**: Multi-AZ deployment with 99.9% uptime SLA

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                               │
├─────────────────┬─────────────────┬────────────────────────┤
│   Web App       │   Mobile App    │    Admin Portal         │
│   (React)       │ (React Native)  │    (React)              │
└────────┬────────┴────────┬────────┴──────────┬─────────────┘
         │                 │                    │
         └─────────────────┼────────────────────┘
                          │
                    ┌──────▼──────┐
                    │  CloudFront  │
                    │     CDN      │
                    └──────┬──────┘
                          │
                    ┌──────▼──────┐
                    │   AWS WAF    │
                    └──────┬──────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼─────┐    ┌─────▼─────┐   ┌─────▼─────┐
    │   API    │    │  Cognito   │   │    S3     │
    │ Gateway  │    │   Auth     │   │  Storage  │
    └────┬─────┘    └───────────┘   └───────────┘
         │
    ┌────▼─────┐
    │ AppSync  │
    │ GraphQL  │
    └────┬─────┘
         │
    ┌────▼──────────────────────────────┐
    │         Lambda Functions          │
    ├───────────────────────────────────┤
    │ • Resolvers                       │
    │ • Business Logic                  │
    │ • Background Jobs                 │
    │ • Event Processors                 │
    └────┬──────────────────────────────┘
         │
    ┌────▼──────────────────────────────┐
    │          Data Layer               │
    ├───────────────┬───────────────────┤
    │  Aurora RDS   │   DynamoDB        │
    │  PostgreSQL   │   NoSQL            │
    └───────────────┴───────────────────┘
```

## AWS Infrastructure (CDK)

### CDK Stack Architecture

```typescript
// lib/stacks/main-stack.ts
export class TravellerMainStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Network Layer
    const vpc = new VpcStack(this, 'VpcStack');
    
    // Authentication
    const auth = new AuthStack(this, 'AuthStack');
    
    // Database
    const database = new DatabaseStack(this, 'DatabaseStack', {
      vpc: vpc.vpc
    });
    
    // Storage
    const storage = new StorageStack(this, 'StorageStack');
    
    // API
    const api = new ApiStack(this, 'ApiStack', {
      userPool: auth.userPool,
      database: database.cluster,
      storage: storage.bucket
    });
    
    // Compute
    const compute = new ComputeStack(this, 'ComputeStack', {
      api: api.graphqlApi,
      database: database.cluster
    });
    
    // Frontend
    const frontend = new FrontendStack(this, 'FrontendStack', {
      api: api.graphqlApi,
      userPool: auth.userPool
    });
  }
}
```

### Authentication Stack (Cognito)

```typescript
// lib/stacks/auth-stack.ts
export class AuthStack extends NestedStack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly identityPool: CfnIdentityPool;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    // User Pool
    this.userPool = new UserPool(this, 'UserPool', {
      userPoolName: 'traveller-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: false
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        },
        fullname: {
          required: true,
          mutable: true
        }
      },
      customAttributes: {
        subscription_tier: new StringAttribute({ mutable: true }),
        campaign_count: new NumberAttribute({ mutable: true }),
        character_count: new NumberAttribute({ mutable: true })
      },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: false,
        otp: true
      }
    });

    // User Pool Client
    this.userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false
        },
        scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
        callbackUrls: [
          'http://localhost:3000/callback',
          'https://app.traveller-rpg.com/callback'
        ]
      },
      preventUserExistenceErrors: true,
      generateSecret: false
    });

    // Identity Pool for federated identities
    this.identityPool = new CfnIdentityPool(this, 'IdentityPool', {
      identityPoolName: 'traveller-identity-pool',
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: this.userPoolClient.userPoolClientId,
        providerName: this.userPool.userPoolProviderName
      }]
    });
  }
}
```

### Database Stack (RDS Aurora PostgreSQL)

```typescript
// lib/stacks/database-stack.ts
export class DatabaseStack extends NestedStack {
  public readonly cluster: DatabaseCluster;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    // Database Subnet Group
    const subnetGroup = new SubnetGroup(this, 'SubnetGroup', {
      vpc: props.vpc,
      description: 'Subnet group for Traveller RDS',
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_ISOLATED
      }
    });

    // Database Cluster
    this.cluster = new DatabaseCluster(this, 'Database', {
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_15_3
      }),
      defaultDatabaseName: 'traveller',
      instanceProps: {
        vpc: props.vpc,
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.MEDIUM),
        vpcSubnets: {
          subnetType: SubnetType.PRIVATE_ISOLATED
        }
      },
      backup: {
        retention: Duration.days(30),
        preferredWindow: '03:00-04:00'
      },
      cloudwatchLogsRetention: RetentionDays.ONE_MONTH,
      storageEncrypted: true,
      deletionProtection: true,
      iamAuthentication: true,
      parameterGroup: new ParameterGroup(this, 'ParameterGroup', {
        engine: DatabaseClusterEngine.auroraPostgres({
          version: AuroraPostgresEngineVersion.VER_15_3
        }),
        parameters: {
          'shared_preload_libraries': 'pg_stat_statements,pgaudit',
          'log_statement': 'all',
          'log_connections': '1',
          'log_disconnections': '1'
        }
      })
    });

    // Read Replica for scaling
    this.cluster.addReader('ReadReplica', {
      instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL)
    });
  }
}
```

### GraphQL API Stack (AppSync)

```typescript
// lib/stacks/api-stack.ts
export class ApiStack extends NestedStack {
  public readonly graphqlApi: GraphqlApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // GraphQL API
    this.graphqlApi = new GraphqlApi(this, 'GraphQLApi', {
      name: 'traveller-api',
      schema: SchemaFile.fromAsset(path.join(__dirname, '../graphql/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: props.userPool
          }
        },
        additionalAuthorizationModes: [{
          authorizationType: AuthorizationType.IAM
        }]
      },
      xrayEnabled: true,
      logConfig: {
        fieldLogLevel: FieldLogLevel.ERROR,
        excludeVerboseContent: false
      }
    });

    // RDS Data Source
    const rdsDataSource = this.graphqlApi.addRdsDataSource(
      'RdsDataSource',
      props.database,
      {
        name: 'RdsDataSource',
        description: 'Aurora PostgreSQL data source'
      }
    );

    // DynamoDB Data Source for real-time features
    const realtimeTable = new Table(this, 'RealtimeTable', {
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute: 'ttl'
    });

    const dynamoDataSource = this.graphqlApi.addDynamoDbDataSource(
      'DynamoDataSource',
      realtimeTable
    );

    // Lambda Data Source for complex operations
    const lambdaDataSource = this.graphqlApi.addLambdaDataSource(
      'LambdaDataSource',
      props.resolverFunction,
      {
        name: 'LambdaDataSource',
        description: 'Lambda resolver for complex operations'
      }
    );

    // Configure Resolvers
    this.configureResolvers(rdsDataSource, dynamoDataSource, lambdaDataSource);
  }

  private configureResolvers(
    rds: RdsDataSource,
    dynamo: DynamoDbDataSource,
    lambda: LambdaDataSource
  ) {
    // User Resolvers
    rds.createResolver('GetUserResolver', {
      typeName: 'Query',
      fieldName: 'getUser',
      requestMappingTemplate: MappingTemplate.fromFile(
        'resolvers/User.getUser.req.vtl'
      ),
      responseMappingTemplate: MappingTemplate.fromFile(
        'resolvers/User.getUser.res.vtl'
      )
    });

    // Character Resolvers
    rds.createResolver('CreateCharacterResolver', {
      typeName: 'Mutation',
      fieldName: 'createCharacter',
      requestMappingTemplate: MappingTemplate.fromFile(
        'resolvers/Character.create.req.vtl'
      ),
      responseMappingTemplate: MappingTemplate.fromFile(
        'resolvers/Character.create.res.vtl'
      )
    });

    // Real-time Dice Rolls
    dynamo.createResolver('DiceRollResolver', {
      typeName: 'Mutation',
      fieldName: 'rollDice',
      requestMappingTemplate: MappingTemplate.fromFile(
        'resolvers/Dice.roll.req.vtl'
      ),
      responseMappingTemplate: MappingTemplate.fromFile(
        'resolvers/Dice.roll.res.vtl'
      )
    });

    // Complex Campaign Operations
    lambda.createResolver('CampaignResolver', {
      typeName: 'Mutation',
      fieldName: 'createCampaign',
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation": "Invoke",
          "payload": $util.toJson($context.arguments)
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        $util.toJson($context.result)
      `)
    });
  }
}
```

## Frontend Architecture

### Web Application Structure (React/Vite/Tailwind)

```
src/
├── app/                    # Application core
│   ├── App.tsx            # Root component
│   ├── Router.tsx         # Route configuration
│   └── Store.tsx          # Redux store setup
├── features/              # Feature modules
│   ├── auth/             # Authentication
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── store/
│   ├── characters/       # Character management
│   │   ├── components/
│   │   │   ├── CharacterSheet.tsx
│   │   │   ├── CharacterCreation.tsx
│   │   │   └── SkillManager.tsx
│   │   ├── hooks/
│   │   ├── services/
│   │   └── store/
│   ├── campaigns/        # Campaign management
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── store/
│   └── gameplay/         # Game mechanics
│       ├── components/
│       │   ├── DiceRoller.tsx
│       │   ├── CombatTracker.tsx
│       │   └── InitiativeOrder.tsx
│       ├── hooks/
│       └── services/
├── shared/               # Shared resources
│   ├── components/      # Common UI components
│   ├── hooks/          # Common hooks
│   ├── utils/          # Utility functions
│   ├── api/            # API client
│   └── types/          # TypeScript types
└── assets/             # Static assets
```

### Mobile Application Structure (React Native)

```
src/
├── screens/            # Screen components
│   ├── Auth/
│   ├── Character/
│   ├── Campaign/
│   └── Gameplay/
├── navigation/         # Navigation setup
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── TabNavigator.tsx
├── components/        # Reusable components
├── services/         # Business logic
├── store/           # State management
├── hooks/           # Custom hooks
├── utils/           # Utilities
└── api/             # API integration
```

## Data Models

### PostgreSQL Schema

```sql
-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cognito_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'FREE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    gamemaster_id UUID REFERENCES users(id),
    settings JSONB DEFAULT '{}',
    house_rules JSONB DEFAULT '{}',
    join_code VARCHAR(10) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Characters
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES users(id),
    campaign_id UUID REFERENCES campaigns(id),
    name VARCHAR(255) NOT NULL,
    characteristics JSONB NOT NULL,
    skills JSONB DEFAULT '[]',
    equipment JSONB DEFAULT '[]',
    credits INTEGER DEFAULT 0,
    background TEXT,
    history JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Starships
CREATE TABLE starships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),
    name VARCHAR(255) NOT NULL,
    class VARCHAR(100),
    tonnage INTEGER,
    specifications JSONB,
    crew JSONB DEFAULT '[]',
    cargo JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Star Systems
CREATE TABLE star_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),
    name VARCHAR(255) NOT NULL,
    hex_location VARCHAR(10),
    uwp_code VARCHAR(20),
    trade_codes JSONB DEFAULT '[]',
    allegiance VARCHAR(50),
    bases JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game Sessions
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id),
    scheduled_at TIMESTAMP,
    duration_hours INTEGER,
    status VARCHAR(20) DEFAULT 'SCHEDULED',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_cognito_id ON users(cognito_id);
CREATE INDEX idx_characters_player_id ON characters(player_id);
CREATE INDEX idx_characters_campaign_id ON characters(campaign_id);
CREATE INDEX idx_campaigns_gamemaster_id ON campaigns(gamemaster_id);
CREATE INDEX idx_campaigns_join_code ON campaigns(join_code);
```

### DynamoDB Schema for Real-time Features

```typescript
// Real-time table schema
interface RealtimeItem {
  pk: string;           // CAMPAIGN#${campaignId}
  sk: string;           // DICE#${timestamp}#${userId}
  type: string;         // DICE_ROLL | CHAT | COMBAT_ACTION
  data: any;           // Polymorphic data
  ttl: number;         // Expiration timestamp
  timestamp: number;    // Event timestamp
}

// Example items
const diceRoll: RealtimeItem = {
  pk: 'CAMPAIGN#abc-123',
  sk: 'DICE#1234567890#user-456',
  type: 'DICE_ROLL',
  data: {
    roller: 'Player Name',
    dice: '2D6+3',
    result: 11,
    purpose: 'Pilot skill check',
    public: true
  },
  ttl: Math.floor(Date.now() / 1000) + 86400,
  timestamp: 1234567890
};

const combatAction: RealtimeItem = {
  pk: 'CAMPAIGN#abc-123',
  sk: 'COMBAT#1234567891#user-789',
  type: 'COMBAT_ACTION',
  data: {
    character: 'Character Name',
    action: 'ATTACK',
    target: 'NPC Name',
    damage: 8,
    effects: ['wounded']
  },
  ttl: Math.floor(Date.now() / 1000) + 86400,
  timestamp: 1234567891
};
```

## Security Architecture

### Defense in Depth

```
Layer 1: CloudFront + AWS WAF
  ├── DDoS Protection
  ├── Rate Limiting
  ├── Geographic Restrictions
  └── Custom WAF Rules

Layer 2: API Gateway
  ├── API Keys
  ├── Request Throttling
  ├── Request Validation
  └── CORS Configuration

Layer 3: Cognito Authentication
  ├── MFA Support
  ├── Password Policies
  ├── Token Validation
  └── User Pools

Layer 4: AppSync Authorization
  ├── Field-level Authorization
  ├── Query Depth Limiting
  ├── Request Size Limits
  └── Role-based Access

Layer 5: Lambda Functions
  ├── IAM Roles
  ├── Environment Variables Encryption
  ├── VPC Isolation
  └── Secrets Manager Integration

Layer 6: Database
  ├── Encryption at Rest
  ├── Encryption in Transit
  ├── IAM Database Authentication
  └── Audit Logging
```

## Deployment Pipeline

### CI/CD with GitHub Actions

```yaml
name: Deploy Traveller Platform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run BDD tests
        run: npm run test:bdd

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Deploy CDK Stack
        run: |
          npm ci
          npx cdk deploy --all --require-approval never
          
      - name: Build and Deploy Web App
        run: |
          cd web
          npm ci
          npm run build
          aws s3 sync dist/ s3://${{ secrets.WEB_BUCKET }}
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DISTRIBUTION }}
          
      - name: Build and Deploy Mobile App
        run: |
          cd mobile
          npm ci
          expo build:android
          expo build:ios
```

## Monitoring and Observability

### CloudWatch Dashboards

```typescript
// lib/constructs/monitoring.ts
export class MonitoringConstruct extends Construct {
  constructor(scope: Construct, id: string, props: MonitoringProps) {
    super(scope, id);

    const dashboard = new Dashboard(this, 'Dashboard', {
      dashboardName: 'traveller-platform'
    });

    // API Metrics
    dashboard.addWidgets(
      new GraphWidget({
        title: 'API Request Count',
        left: [props.api.metric('Count')]
      }),
      new GraphWidget({
        title: 'API Latency',
        left: [props.api.metric('Latency')]
      })
    );

    // Database Metrics
    dashboard.addWidgets(
      new GraphWidget({
        title: 'Database Connections',
        left: [props.database.metricDatabaseConnections()]
      }),
      new GraphWidget({
        title: 'Database CPU',
        left: [props.database.metricCPUUtilization()]
      })
    );

    // Alarms
    new Alarm(this, 'ApiErrorAlarm', {
      metric: props.api.metric('4XXError'),
      threshold: 10,
      evaluationPeriods: 1
    });

    new Alarm(this, 'DatabaseHighCPU', {
      metric: props.database.metricCPUUtilization(),
      threshold: 80,
      evaluationPeriods: 2
    });
  }
}
```

## Performance Optimization

### Caching Strategy

1. **CloudFront CDN**: Static assets, 1 year TTL
2. **API Gateway Caching**: GET requests, 5 minute TTL
3. **AppSync Caching**: GraphQL queries, configurable TTL
4. **ElastiCache Redis**: Session data, real-time state
5. **Application Cache**: React Query / Apollo Client

### Database Optimization

1. **Connection Pooling**: PgBouncer for connection management
2. **Read Replicas**: Distribute read load
3. **Indexes**: Optimize query performance
4. **Partitioning**: Historical data management
5. **Materialized Views**: Complex query optimization

## Disaster Recovery

### Backup Strategy

- **RDS Automated Backups**: Daily, 30-day retention
- **Point-in-Time Recovery**: Up to 5 minutes ago
- **Cross-Region Replication**: For critical data
- **S3 Versioning**: For user uploads
- **Infrastructure as Code**: Complete environment recreation

### RTO/RPO Targets

- **Recovery Time Objective (RTO)**: < 4 hours
- **Recovery Point Objective (RPO)**: < 1 hour
- **Availability Target**: 99.9% uptime
- **Data Durability**: 99.999999999% (11 9's)

## Cost Optimization

### Strategies

1. **Reserved Instances**: For predictable workloads
2. **Spot Instances**: For batch processing
3. **Auto-scaling**: Match capacity to demand
4. **S3 Lifecycle Policies**: Archive old data
5. **Lambda Provisioned Concurrency**: Only for critical paths
6. **CloudWatch Log Retention**: 30 days for most logs

### Estimated Monthly Costs

- **Development Environment**: ~$200/month
- **Staging Environment**: ~$500/month
- **Production (1000 users)**: ~$2,000/month
- **Production (10,000 users)**: ~$8,000/month

## Future Enhancements

### Phase 2 Features
- WebRTC integration for voice/video
- AI-powered GM assistant
- Procedural content generation
- Advanced analytics dashboard
- Marketplace for custom content

### Technical Improvements
- GraphQL Federation for microservices
- Event sourcing for game state
- CQRS pattern implementation
- Machine learning for recommendations
- Blockchain for digital asset ownership