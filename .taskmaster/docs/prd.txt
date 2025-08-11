# Product Requirements Document (PRD)
# Traveller RPG Digital Platform

## Executive Summary

The Traveller RPG Digital Platform is a comprehensive web and mobile application designed to facilitate playing the Traveller tabletop role-playing game online. The platform will support character creation, campaign management, dice rolling, rules reference, and collaborative gameplay between Game Masters (GMs) and players.

### Vision Statement
Create the definitive digital platform for playing Traveller RPG, combining the depth of the classic science fiction RPG with modern web and mobile technologies to enable seamless remote and in-person gameplay.

### Success Metrics
- User engagement: Average session duration > 2 hours
- User retention: 60% monthly active users
- Campaign completion rate: > 30%
- Mobile app rating: > 4.5 stars
- System performance: < 2 second page load times

## Product Overview

### Target Users

#### Primary Users
1. **Game Masters (GMs)**
   - Age: 25-55
   - Experience: Familiar with Traveller or similar TTRPGs
   - Needs: Campaign management, NPC tracking, world building tools
   - Platform: Primarily web (desktop/tablet)

2. **Players**
   - Age: 18-55
   - Experience: New to veteran Traveller players
   - Needs: Character management, rules reference, dice rolling
   - Platform: Mobile-first, with web access

3. **Campaign Groups**
   - Size: 3-7 members (1 GM, 2-6 players)
   - Play frequency: Weekly to monthly sessions
   - Session duration: 2-6 hours

### Core Value Propositions
1. **Accessibility**: Play Traveller anywhere, anytime, on any device
2. **Automation**: Streamline complex calculations and rules lookups
3. **Collaboration**: Real-time shared campaign state
4. **Organization**: Centralized campaign and character management
5. **Customization**: Support for house rules and homebrew content

## Feature Requirements

### 1. User Management & Authentication

#### 1.1 Account System
- **User Registration** via email or social providers (Google, Apple)
- **Profile Management** with avatar, display name, timezone
- **Multi-factor Authentication** support
- **Password Recovery** via email
- **Account Deletion** with data export option

#### 1.2 Subscription Tiers
- **Free Tier**: 1 campaign, 3 characters, core rules access
- **Standard Tier** ($4.99/month): 5 campaigns, unlimited characters, full rules
- **Premium Tier** ($9.99/month): Unlimited campaigns, priority support, early access

### 2. Character Management

#### 2.1 Character Creation
- **Guided Creation Wizard** following Traveller lifepath system
- **Career Path Selection** with all core careers
- **Background Events** generation
- **Skill Assignment** with point allocation
- **Starting Equipment** selection based on credits
- **Character Portrait** upload or avatar generator

#### 2.2 Character Sheet
- **Characteristics Display**: STR, DEX, END, INT, EDU, SOC
- **Skills Tracking** with levels and specializations
- **Equipment Management** with encumbrance calculation
- **Credits & Finances** tracking
- **Conditions & Status** (wounded, fatigued, etc.)
- **Notes & Background** rich text editor
- **Experience & Advancement** tracking

#### 2.3 Character Utilities
- **Dice Roller** integrated with skills
- **Task Resolution** calculator
- **Quick Actions** menu for common tasks
- **Character Backup** and version history
- **Character Sharing** via link or QR code

### 3. Campaign Management

#### 3.1 Campaign Creation
- **Campaign Setup Wizard** with templates
- **Setting Selection** (Third Imperium, custom, etc.)
- **House Rules** configuration
- **Invitation System** for players
- **Campaign Calendar** with session scheduling

#### 3.2 GM Tools
- **NPC Generator** with quick stats
- **Encounter Builder** with difficulty calculator
- **Initiative Tracker** for combat
- **Campaign Timeline** for events
- **Location Manager** for planets/stations
- **Plot Thread Tracker** for storylines
- **Session Notes** with markdown support
- **Handouts System** for sharing documents/images

#### 3.3 World Building
- **Sector Generator** with hex maps
- **System Generator** for star systems
- **Planet Generator** with UWP codes
- **Trade Route** calculator
- **Faction Manager** for organizations
- **Custom Content** creation tools

### 4. Gameplay Features

#### 4.1 Dice Rolling System
- **3D Animated Dice** with physics
- **Roll History** with timestamps
- **Public/Private Rolls** toggle
- **Advantage/Disadvantage** modifiers
- **Dice Macros** for common rolls
- **Roll Templates** for specific actions

#### 4.2 Combat Management
- **Turn Order** tracking
- **Action Economy** display
- **Range Bands** visualization
- **Damage Application** automation
- **Effect Duration** tracking
- **Combat Log** with replay

#### 4.3 Starship Operations
- **Ship Registry** with stats
- **Crew Positions** assignment
- **Ship Combat** tracker
- **Jump Navigation** calculator
- **Cargo Management** system
- **Maintenance Schedule** tracking
- **Ship Customization** builder

#### 4.4 Trade & Commerce
- **Trade Goods** database
- **Price Calculator** by world
- **Speculative Trade** simulator
- **Passenger Management** system
- **Contract Generator** for missions
- **Profit/Loss Tracking** ledger

### 5. Rules Reference

#### 5.1 Core Rulebook
- **Searchable Rules** database
- **Bookmarks** for quick access
- **Cross-references** hyperlinked
- **Examples** with dice notation
- **FAQ Section** curated
- **Glossary** of terms

#### 5.2 Quick References
- **Action Cheat Sheet** for players
- **GM Screen** with tables
- **Skill Descriptions** popup
- **Equipment Stats** comparison
- **Condition Effects** summary

### 6. Communication & Collaboration

#### 6.1 In-Game Communication
- **Text Chat** with dice roll integration
- **Voice/Video** (v2.0)
- **Drawing Tools** for tactical maps
- **Ping System** for attention
- **Emote Library** for roleplay

#### 6.2 Asynchronous Play
- **Play-by-Post** support
- **Turn Notifications** via email/push
- **Activity Feed** for campaign updates
- **Scheduled Posts** for delayed reveals

### 7. Mobile-Specific Features (React Native)

#### 7.1 Player Focus
- **Simplified Character Sheet** optimized for small screens
- **Quick Dice** widget
- **Gesture Controls** for common actions
- **Offline Mode** with sync
- **Push Notifications** for game events
- **AR Dice Rolling** using camera (future)

#### 7.2 Mobile Optimizations
- **Responsive Layouts** for all screen sizes
- **Touch-Optimized** controls
- **Reduced Data Usage** mode
- **Battery Optimization** settings
- **Dark Mode** support

### 8. Web-Specific Features (React/Vite)

#### 8.1 GM Focus
- **Multi-Panel Layout** for simultaneous tools
- **Keyboard Shortcuts** for efficiency
- **Drag-and-Drop** for organization
- **Multiple Monitor** support
- **Advanced Filters** for content
- **Batch Operations** for NPCs/items

#### 8.2 Enhanced Visualization
- **Interactive Star Maps** with zoom
- **3D Ship Models** viewer
- **Timeline Visualization** for campaigns
- **Relationship Graphs** for NPCs
- **Statistical Analytics** for campaigns

## Technical Architecture

### Frontend Architecture

#### Web Application (React/Vite/Tailwind CSS)
```
src/
├── features/           # Feature-based organization
│   ├── auth/          # Authentication
│   ├── characters/    # Character management
│   ├── campaigns/     # Campaign management
│   ├── combat/        # Combat tracker
│   ├── starships/     # Ship operations
│   └── trade/         # Trade system
├── shared/            # Shared components
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── api/          # API client
├── tests/            # Test files
│   ├── unit/         # Unit tests
│   └── integration/  # Integration tests
└── e2e/              # End-to-end tests
    └── features/     # Cucumber feature files
```

#### Mobile Application (React Native)
```
src/
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── components/       # Reusable components
├── services/        # Business logic
├── store/           # State management
└── utils/           # Helper functions
```

### Backend Architecture (GraphQL API)

#### AWS CDK Stack Structure
```
lib/
├── stacks/
│   ├── auth-stack.ts        # Cognito configuration
│   ├── api-stack.ts         # AppSync GraphQL API
│   ├── database-stack.ts    # RDS PostgreSQL
│   ├── storage-stack.ts     # S3 for assets
│   └── compute-stack.ts     # Lambda functions
├── constructs/
│   ├── graphql-api.ts       # GraphQL schema
│   ├── resolvers/           # GraphQL resolvers
│   └── data-sources/        # Data source configs
└── lambda/
    ├── auth/               # Auth functions
    ├── game-logic/         # Game calculations
    └── notifications/      # Push notifications
```

### Database Schema (PostgreSQL)

#### Core Tables
```sql
-- Users and Authentication
users
campaigns
campaign_members
characters
character_skills
character_equipment

-- Game Data
starships
star_systems
planets
trade_goods
encounters
combat_sessions

-- Content Management
custom_content
house_rules
handouts
session_notes
```

### BDD Feature Files Structure

```
features/
├── common/              # Shared features
│   ├── authentication.feature
│   ├── user-profile.feature
│   └── subscription.feature
├── character/
│   ├── character-creation.feature
│   ├── character-sheet.feature
│   ├── character-advancement.feature
│   └── character-equipment.feature
├── campaign/
│   ├── campaign-creation.feature
│   ├── campaign-invitation.feature
│   ├── campaign-management.feature
│   └── session-scheduling.feature
├── gameplay/
│   ├── dice-rolling.feature
│   ├── skill-checks.feature
│   ├── combat.feature
│   └── initiative.feature
├── starship/
│   ├── ship-management.feature
│   ├── ship-combat.feature
│   ├── jump-navigation.feature
│   └── cargo-management.feature
└── trade/
    ├── trade-goods.feature
    ├── speculative-trade.feature
    └── contracts.feature
```

### API Design (GraphQL Schema)

```graphql
type User {
  id: ID!
  email: String!
  profile: UserProfile!
  characters: [Character!]!
  campaigns: [Campaign!]!
}

type Campaign {
  id: ID!
  name: String!
  description: String
  gamemaster: User!
  players: [User!]!
  characters: [Character!]!
  sessions: [Session!]!
  settings: CampaignSettings!
}

type Character {
  id: ID!
  name: String!
  player: User!
  characteristics: Characteristics!
  skills: [Skill!]!
  equipment: [Equipment!]!
  credits: Int!
  history: [LifeEvent!]!
}

type Characteristics {
  strength: Int!
  dexterity: Int!
  endurance: Int!
  intelligence: Int!
  education: Int!
  socialStanding: Int!
}

type DiceRoll {
  id: ID!
  roller: User!
  type: RollType!
  dice: String!
  result: Int!
  modifiers: [Modifier!]
  timestamp: DateTime!
  public: Boolean!
}
```

## Development Roadmap

### Phase 1: Foundation (Months 1-3)
- [ ] AWS Infrastructure setup with CDK
- [ ] Cognito authentication implementation
- [ ] Basic user registration and profiles
- [ ] GraphQL API scaffolding
- [ ] Database schema implementation
- [ ] Web app skeleton with routing
- [ ] Mobile app skeleton with navigation

### Phase 2: Core Features (Months 4-6)
- [ ] Character creation system
- [ ] Character sheet management
- [ ] Basic dice rolling
- [ ] Campaign creation and invitation
- [ ] Simple GM tools
- [ ] Rules reference integration

### Phase 3: Gameplay (Months 7-9)
- [ ] Combat tracker
- [ ] Initiative system
- [ ] Skill check automation
- [ ] NPC generator
- [ ] Encounter builder
- [ ] Session notes

### Phase 4: Advanced Features (Months 10-12)
- [ ] Starship management
- [ ] Trade system
- [ ] Sector generator
- [ ] Custom content tools
- [ ] Campaign analytics
- [ ] Mobile optimization

### Phase 5: Polish & Launch (Months 13-15)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta testing program
- [ ] Documentation
- [ ] Marketing website
- [ ] Launch preparation

## Success Criteria

### Technical Metrics
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 200ms p95
- **Mobile App Size**: < 50MB
- **Offline Capability**: Core features work offline
- **Test Coverage**: > 80% for critical paths

### User Experience Metrics
- **Onboarding Completion**: > 80%
- **Feature Adoption**: > 60% use core features weekly
- **Session Duration**: Average > 2 hours
- **User Retention**: 60% MAU
- **NPS Score**: > 50

### Business Metrics
- **Free to Paid Conversion**: > 10%
- **Monthly Recurring Revenue**: $50k by end of Year 1
- **Customer Acquisition Cost**: < $10
- **Lifetime Value**: > $100
- **Churn Rate**: < 5% monthly

## Risk Analysis

### Technical Risks
1. **Real-time Synchronization Complexity**
   - Mitigation: Use AWS AppSync subscriptions
   - Fallback: Polling with optimistic updates

2. **Mobile Performance**
   - Mitigation: Aggressive caching and lazy loading
   - Fallback: Reduced feature set for low-end devices

3. **Database Scaling**
   - Mitigation: Read replicas and caching layer
   - Fallback: Database sharding strategy

### Business Risks
1. **License Compliance**
   - Mitigation: Work with Mongoose Publishing
   - Fallback: Generic sci-fi RPG platform

2. **Competition from VTT Platforms**
   - Mitigation: Traveller-specific features
   - Fallback: Integration with existing VTTs

3. **User Adoption**
   - Mitigation: Free tier and referral program
   - Fallback: Pivot to general sci-fi RPG

## Compliance & Security

### Data Protection
- **GDPR Compliance** for EU users
- **CCPA Compliance** for California users
- **COPPA Compliance** for users under 13
- **Data Encryption** at rest and in transit
- **Right to Delete** user data

### Security Requirements
- **AWS WAF** for API protection
- **Rate Limiting** on all endpoints
- **Input Validation** and sanitization
- **SQL Injection** prevention
- **XSS Protection** headers
- **CORS Configuration** properly set
- **Regular Security Audits** quarterly

### Content Moderation
- **User-Generated Content** filtering
- **Report System** for inappropriate content
- **Community Guidelines** enforcement
- **DMCA Compliance** for copyrighted material

## Appendices

### A. Glossary of Traveller Terms
- **UWP**: Universal World Profile
- **TL**: Tech Level
- **Jump**: Faster-than-light travel
- **Credits**: Standard currency
- **Imperium**: The Third Imperium setting

### B. Competitor Analysis
- **Roll20**: General VTT, not Traveller-specific
- **Foundry VTT**: Requires hosting, complex setup
- **Fantasy Grounds**: Desktop-only, expensive
- **TravellerMap**: Great for sectors, limited gameplay

### C. User Stories Examples
- As a GM, I want to quickly generate NPCs during play
- As a player, I want to track my character's advancement
- As a group, we want to schedule our next session
- As a new player, I want guided character creation

### D. Technical Dependencies
- **AWS Services**: Cognito, AppSync, RDS, S3, Lambda
- **Frontend**: React 18+, Vite, Tailwind CSS, GraphQL
- **Mobile**: React Native, Expo
- **Testing**: Jest, Cucumber, Cypress
- **CI/CD**: GitHub Actions, AWS CodePipeline