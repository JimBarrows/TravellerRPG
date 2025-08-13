# Traveller RPG GraphQL API Documentation

## Overview

The Traveller RPG Digital Platform provides a comprehensive GraphQL API built on AWS AppSync for managing campaigns, characters, sessions, and gameplay mechanics specific to the Traveller tabletop RPG system.

## Authentication

### Cognito User Pool
- **Primary Authentication**: AWS Cognito User Pool with JWT tokens
- **API Key**: Available for development and testing (limited functionality)

### Authorization Levels
- **Public**: Read access to public campaigns and general game data
- **User**: Full access to own data and campaigns they're members of
- **Gamemaster**: Full control over campaigns they manage
- **Admin**: System-wide administrative access

## Core Types

### User
Represents a platform user with subscription tiers and profile information.

```graphql
type User {
  id: ID!
  email: String!
  displayName: String
  avatar: String
  timezone: String
  subscriptionTier: SubscriptionTier!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

enum SubscriptionTier {
  FREE      # Basic features, 1 campaign
  STANDARD  # Enhanced features, 5 campaigns
  PREMIUM   # Full features, unlimited campaigns
}
```

### Campaign
Represents a game campaign with settings and membership management.

```graphql
type Campaign {
  id: ID!
  name: String!
  description: String
  gamemaster: User!
  players: [User!]!
  characters: [Character!]!
  sessions: [Session!]!
  settings: CampaignSettings
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type CampaignSettings {
  houseRules: AWSJSON      # Custom rule modifications
  allowedBooks: [String!]  # Permitted rulebooks
  maxPlayers: Int          # Maximum player count
  isPublic: Boolean        # Public visibility
}
```

### Character
Represents a player character with full Traveller RPG statistics.

```graphql
type Character {
  id: ID!
  name: String!
  player: User!
  campaign: Campaign!
  characteristics: Characteristics!
  skills: [Skill!]!
  equipment: [Equipment!]!
  credits: Int!
  history: [LifeEvent!]!
  notes: String
  portrait: String
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}

type Characteristics {
  strength: Int!        # 1-15 range
  dexterity: Int!       # 1-15 range
  endurance: Int!       # 1-15 range
  intelligence: Int!    # 1-15 range
  education: Int!       # 1-15 range
  socialStanding: Int!  # 1-15 range
}
```

### Session
Represents a game session with scheduling and notes.

```graphql
type Session {
  id: ID!
  campaign: Campaign!
  name: String!
  scheduledFor: AWSDateTime
  duration: Int
  notes: String
  participants: [User!]!
  status: SessionStatus!
  createdAt: AWSDateTime!
}

enum SessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### DiceRoll
Represents dice rolls with full Traveller mechanics support.

```graphql
type DiceRoll {
  id: ID!
  roller: User!
  campaign: Campaign!
  dice: String!           # Dice notation (e.g., "2d6+1")
  result: Int!            # Final result after modifiers
  modifiers: [String!]    # Applied modifiers
  timestamp: AWSDateTime!
  isPublic: Boolean!      # Visibility to other players
}
```

## Extended Types

### StarSystem & Planet
World building support with Universal World Profile (UWP) integration.

```graphql
type StarSystem {
  id: ID!
  name: String!
  hexLocation: String!    # Hex coordinates (e.g., "1910")
  sector: String!
  subsector: String
  allegiance: String
  starType: String
  gasGiants: Int
  planets: [Planet!]!
}

type Planet {
  id: ID!
  name: String!
  starSystem: StarSystem!
  uwp: String!            # Universal World Profile
  tradeCodes: [String!]!  # Trade classifications
  starport: String!       # A, B, C, D, E, X
  size: Int!              # 0-10 (A)
  atmosphere: Int!        # 0-15 (F)
  hydrographics: Int!     # 0-10 (A)
  population: Int!        # 0-15 (F)
  government: Int!        # 0-15 (F)
  lawLevel: Int!          # 0-15 (F)
  techLevel: Int!         # 0-15+ (F+)
  gasGiant: Boolean!
}
```

### Starship
Starship management with full specifications.

```graphql
type Starship {
  id: ID!
  name: String!
  shipClass: String!
  tonnage: Int!
  jumpDrive: Int          # Jump rating
  maneuverDrive: Int      # Maneuver rating
  powerPlant: Int         # Power plant rating
  fuel: Int!              # Fuel capacity
  cargo: Int!             # Cargo capacity
  crew: [Character!]!
  currentLocation: StarSystem
}
```

## Queries

### User Queries
```graphql
# Get specific user (limited info for others)
getUser(id: ID!): User

# Get current authenticated user
getCurrentUser: User
```

### Campaign Queries
```graphql
# Get specific campaign (requires membership)
getCampaign(id: ID!): Campaign

# List public campaigns with filters
listCampaigns(filter: CampaignFilter): [Campaign!]!

# List user's campaigns
listUserCampaigns: [Campaign!]!

# Paginated campaign queries
campaignsPaginated(
  first: Int,
  after: String,
  filter: CampaignFilter
): CampaignConnection!
```

### Character Queries
```graphql
# Get specific character (requires campaign access)
getCharacter(id: ID!): Character

# List characters in campaign
listCharacters(campaignId: ID!): [Character!]!

# List user's characters across campaigns
listUserCharacters: [Character!]!
```

### Session Queries
```graphql
# Get specific session
getSession(id: ID!): Session

# List campaign sessions
listSessions(campaignId: ID!): [Session!]!
```

### Dice Roll Queries
```graphql
# List dice rolls for campaign
listDiceRolls(campaignId: ID!, limit: Int): [DiceRoll!]!

# Paginated dice rolls
diceRollsPaginated(
  campaignId: ID!,
  first: Int,
  after: String
): DiceRollConnection!
```

## Mutations

### User Mutations
```graphql
# Update user profile
updateUserProfile(input: UpdateUserProfileInput!): User
```

### Campaign Mutations
```graphql
# Create new campaign
createCampaign(input: CreateCampaignInput!): Campaign

# Update campaign (GM only)
updateCampaign(id: ID!, input: UpdateCampaignInput!): Campaign

# Delete campaign (GM only)
deleteCampaign(id: ID!): Boolean

# Invite player to campaign (GM only)
invitePlayerToCampaign(campaignId: ID!, email: String!): Boolean
```

### Character Mutations
```graphql
# Create character
createCharacter(input: CreateCharacterInput!): Character

# Update character (owner only)
updateCharacter(id: ID!, input: UpdateCharacterInput!): Character

# Delete character (owner only)
deleteCharacter(id: ID!): Boolean
```

### Session Mutations
```graphql
# Create session (GM only)
createSession(input: CreateSessionInput!): Session

# Update session (GM only)
updateSession(id: ID!, input: UpdateSessionInput!): Session
```

### Dice Roll Mutations
```graphql
# Roll dice with Traveller mechanics
rollDice(input: RollDiceInput!): DiceRoll
```

## Subscriptions

Real-time updates for active campaigns:

```graphql
# Campaign updates
onCampaignUpdate(campaignId: ID!): Campaign

# Character updates
onCharacterUpdate(characterId: ID!): Character

# New dice rolls
onDiceRoll(campaignId: ID!): DiceRoll

# Session updates
onSessionUpdate(campaignId: ID!): Session
```

## Input Types

### Campaign Inputs
```graphql
input CreateCampaignInput {
  name: String!
  description: String
  settings: CampaignSettingsInput
}

input CampaignSettingsInput {
  houseRules: AWSJSON
  allowedBooks: [String!]
  maxPlayers: Int
  isPublic: Boolean
}
```

### Character Inputs
```graphql
input CreateCharacterInput {
  name: String!
  campaignId: ID!
  characteristics: CharacteristicsInput!
  portrait: String
}

input CharacteristicsInput {
  strength: Int!        # Must be 1-15
  dexterity: Int!       # Must be 1-15
  endurance: Int!       # Must be 1-15
  intelligence: Int!    # Must be 1-15
  education: Int!       # Must be 1-15
  socialStanding: Int!  # Must be 1-15
}

input SkillInput {
  name: String!
  level: Int!           # Must be 0-15
  specialization: String
}
```

### Dice Roll Inputs
```graphql
input RollDiceInput {
  campaignId: ID!
  dice: String!         # Format: "XdY" or "XdY+Z" (e.g., "2d6+1")
  modifiers: [String!]
  isPublic: Boolean!
  description: String
}
```

## Error Handling

The API uses standard GraphQL error responses with detailed error messages:

```json
{
  "errors": [
    {
      "message": "Access denied: Not a member of this campaign",
      "locations": [{"line": 2, "column": 3}],
      "path": ["getCampaign"],
      "extensions": {
        "code": "FORBIDDEN",
        "type": "AuthorizationError"
      }
    }
  ]
}
```

### Common Error Codes
- `UNAUTHENTICATED`: User not logged in
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid input data
- `INTERNAL_ERROR`: Server error

## Rate Limiting

The API implements rate limiting based on subscription tiers:

- **FREE**: 100 requests/hour
- **STANDARD**: 500 requests/hour  
- **PREMIUM**: 2000 requests/hour

## Caching

Responses are cached with appropriate TTLs:

- **User data**: 5 minutes
- **Campaign data**: 3 minutes
- **Character data**: 2 minutes
- **Session data**: 1 minute
- **Dice rolls**: 30 seconds
- **World data**: 1 hour

## Pagination

The API supports cursor-based pagination following the GraphQL connection specification:

```graphql
type CampaignConnection {
  edges: [CampaignEdge!]!
  nodes: [Campaign!]!
  pageInfo: PageInfo!
  totalCount: Int
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

## Traveller RPG Integration

### Dice Mechanics
- Supports standard Traveller 2d6 system
- Handles skill levels, characteristic modifiers
- Automatic difficulty calculation
- Effect calculation (margin of success/failure)

### Character Creation
- Full lifepath system support
- Career progression tracking
- Skill development rules
- Equipment management

### World Building
- UWP (Universal World Profile) parsing
- Trade code generation
- Hex map coordinate system
- Jump route calculation

### Game Mechanics
- Initiative and combat tracking
- Damage and healing systems
- Experience and advancement
- Trade and commerce rules

## Examples

### Create a Campaign
```graphql
mutation CreateCampaign {
  createCampaign(input: {
    name: "The Third Imperium"
    description: "Classic Traveller campaign in the Spinward Marches"
    settings: {
      maxPlayers: 6
      isPublic: false
      allowedBooks: ["Core Rulebook", "High Guard"]
      houseRules: {
        "criticalHits": true,
        "extendedCharacterCreation": true
      }
    }
  }) {
    id
    name
    gamemaster {
      displayName
    }
    settings {
      maxPlayers
      isPublic
    }
  }
}
```

### Roll Dice
```graphql
mutation RollDice {
  rollDice(input: {
    campaignId: "campaign123"
    dice: "2d6+2"
    isPublic: true
    description: "Attack with Blade skill"
    modifiers: ["Blade-2", "Dexterity+1"]
  }) {
    id
    result
    individual
    modifiers
    roller {
      displayName
    }
  }
}
```

### Subscribe to Campaign Updates
```graphql
subscription CampaignUpdates {
  onCampaignUpdate(campaignId: "campaign123") {
    id
    name
    players {
      displayName
    }
    characters {
      name
      player {
        displayName
      }
    }
  }
}
```

## Client Integration

### Apollo Client Setup
```typescript
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

const httpLink = createHttpLink({
  uri: 'https://your-appsync-endpoint/graphql',
  headers: {
    authorization: `Bearer ${userToken}`,
  },
});

const wsLink = new WebSocketLink({
  uri: 'wss://your-appsync-endpoint/graphql',
  options: {
    reconnect: true,
    connectionParams: {
      authorization: `Bearer ${userToken}`,
    },
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

## Security Considerations

- All sensitive operations require authentication
- Campaign data is isolated by membership
- Characters can only be modified by their owners
- Dice rolls can be private or public per player choice
- Rate limiting prevents API abuse
- Input validation prevents injection attacks
- Audit logging tracks all mutations

This API provides a comprehensive foundation for building Traveller RPG applications with real-time capabilities, proper authorization, and full game mechanics support.