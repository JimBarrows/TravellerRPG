
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  displayName: 'displayName',
  avatar: 'avatar',
  timezone: 'timezone',
  subscriptionTier: 'subscriptionTier',
  cognitoUserId: 'cognitoUserId',
  emailVerified: 'emailVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLoginAt: 'lastLoginAt'
};

exports.Prisma.CampaignScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  maxPlayers: 'maxPlayers',
  isPublic: 'isPublic',
  allowedBooks: 'allowedBooks',
  houseRules: 'houseRules',
  gamemasterId: 'gamemasterId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CampaignMemberScalarFieldEnum = {
  id: 'id',
  campaignId: 'campaignId',
  userId: 'userId',
  role: 'role',
  isActive: 'isActive',
  joinedAt: 'joinedAt'
};

exports.Prisma.CharacterScalarFieldEnum = {
  id: 'id',
  name: 'name',
  credits: 'credits',
  notes: 'notes',
  portrait: 'portrait',
  homeworld: 'homeworld',
  age: 'age',
  gender: 'gender',
  species: 'species',
  playerId: 'playerId',
  campaignId: 'campaignId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CharacteristicsScalarFieldEnum = {
  id: 'id',
  strength: 'strength',
  dexterity: 'dexterity',
  endurance: 'endurance',
  intelligence: 'intelligence',
  education: 'education',
  socialStanding: 'socialStanding',
  physicalDamage: 'physicalDamage',
  mentalDamage: 'mentalDamage',
  characterId: 'characterId'
};

exports.Prisma.CharacterSkillScalarFieldEnum = {
  id: 'id',
  name: 'name',
  level: 'level',
  specialization: 'specialization',
  characterId: 'characterId'
};

exports.Prisma.CharacterEquipmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  weight: 'weight',
  cost: 'cost',
  quantity: 'quantity',
  equipped: 'equipped',
  category: 'category',
  subcategory: 'subcategory',
  weaponType: 'weaponType',
  damage: 'damage',
  range: 'range',
  armorValue: 'armorValue',
  armorType: 'armorType',
  characterId: 'characterId'
};

exports.Prisma.LifeEventScalarFieldEnum = {
  id: 'id',
  age: 'age',
  event: 'event',
  description: 'description',
  effects: 'effects',
  career: 'career',
  rank: 'rank',
  skills: 'skills',
  characterId: 'characterId'
};

exports.Prisma.StarSystemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  hexLocation: 'hexLocation',
  sector: 'sector',
  subsector: 'subsector',
  allegiance: 'allegiance',
  starType: 'starType',
  gasGiants: 'gasGiants',
  jumpRoutes: 'jumpRoutes',
  campaignId: 'campaignId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlanetScalarFieldEnum = {
  id: 'id',
  name: 'name',
  uwp: 'uwp',
  size: 'size',
  atmosphere: 'atmosphere',
  hydrographics: 'hydrographics',
  population: 'population',
  government: 'government',
  lawLevel: 'lawLevel',
  techLevel: 'techLevel',
  starport: 'starport',
  tradeCodes: 'tradeCodes',
  bases: 'bases',
  gasGiant: 'gasGiant',
  description: 'description',
  notes: 'notes',
  starSystemId: 'starSystemId'
};

exports.Prisma.StarshipScalarFieldEnum = {
  id: 'id',
  name: 'name',
  class: 'class',
  hullCode: 'hullCode',
  tonnage: 'tonnage',
  jumpDrive: 'jumpDrive',
  maneuverDrive: 'maneuverDrive',
  powerPlant: 'powerPlant',
  crew: 'crew',
  passengers: 'passengers',
  cargo: 'cargo',
  fuel: 'fuel',
  armor: 'armor',
  weapons: 'weapons',
  status: 'status',
  location: 'location',
  owner: 'owner',
  campaignId: 'campaignId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TradeGoodScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  basePrice: 'basePrice',
  availability: 'availability',
  legality: 'legality',
  dtm: 'dtm',
  planetId: 'planetId'
};

exports.Prisma.TradeRouteScalarFieldEnum = {
  id: 'id',
  name: 'name',
  distance: 'distance',
  difficulty: 'difficulty',
  originId: 'originId',
  destinationId: 'destinationId',
  cargoTypes: 'cargoTypes',
  profitMargin: 'profitMargin'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  scheduledFor: 'scheduledFor',
  duration: 'duration',
  notes: 'notes',
  status: 'status',
  campaignId: 'campaignId',
  participants: 'participants',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EncounterScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  encounterType: 'encounterType',
  difficulty: 'difficulty',
  location: 'location',
  environment: 'environment',
  npcs: 'npcs',
  rewards: 'rewards',
  status: 'status',
  outcome: 'outcome',
  campaignId: 'campaignId',
  sessionId: 'sessionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CombatSessionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  round: 'round',
  phase: 'phase',
  status: 'status',
  initiative: 'initiative',
  encounterId: 'encounterId',
  sessionId: 'sessionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CombatActionScalarFieldEnum = {
  id: 'id',
  actionType: 'actionType',
  description: 'description',
  target: 'target',
  result: 'result',
  diceRolled: 'diceRolled',
  rollResult: 'rollResult',
  modifiers: 'modifiers',
  characterId: 'characterId',
  combatSessionId: 'combatSessionId',
  round: 'round',
  timestamp: 'timestamp'
};

exports.Prisma.DiceRollScalarFieldEnum = {
  id: 'id',
  dice: 'dice',
  result: 'result',
  individual: 'individual',
  modifiers: 'modifiers',
  description: 'description',
  isPublic: 'isPublic',
  isGMOnly: 'isGMOnly',
  rollerId: 'rollerId',
  campaignId: 'campaignId',
  character: 'character',
  skill: 'skill',
  timestamp: 'timestamp'
};

exports.Prisma.CustomContentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  contentType: 'contentType',
  category: 'category',
  data: 'data',
  tags: 'tags',
  isPublic: 'isPublic',
  isOfficial: 'isOfficial',
  authorId: 'authorId',
  campaignId: 'campaignId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HouseRuleScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  category: 'category',
  ruleText: 'ruleText',
  pageReference: 'pageReference',
  replaces: 'replaces',
  isActive: 'isActive',
  campaignId: 'campaignId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HandoutScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  content: 'content',
  imageUrl: 'imageUrl',
  fileUrl: 'fileUrl',
  isPlayerVisible: 'isPlayerVisible',
  recipients: 'recipients',
  authorId: 'authorId',
  campaignId: 'campaignId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SessionNoteScalarFieldEnum = {
  id: 'id',
  title: 'title',
  content: 'content',
  noteType: 'noteType',
  tags: 'tags',
  isPublic: 'isPublic',
  authorId: 'authorId',
  campaignId: 'campaignId',
  sessionId: 'sessionId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.SubscriptionTier = exports.$Enums.SubscriptionTier = {
  FREE: 'FREE',
  STANDARD: 'STANDARD',
  PREMIUM: 'PREMIUM'
};

exports.CampaignRole = exports.$Enums.CampaignRole = {
  GAMEMASTER: 'GAMEMASTER',
  PLAYER: 'PLAYER',
  OBSERVER: 'OBSERVER'
};

exports.SessionStatus = exports.$Enums.SessionStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Campaign: 'Campaign',
  CampaignMember: 'CampaignMember',
  Character: 'Character',
  Characteristics: 'Characteristics',
  CharacterSkill: 'CharacterSkill',
  CharacterEquipment: 'CharacterEquipment',
  LifeEvent: 'LifeEvent',
  StarSystem: 'StarSystem',
  Planet: 'Planet',
  Starship: 'Starship',
  TradeGood: 'TradeGood',
  TradeRoute: 'TradeRoute',
  Session: 'Session',
  Encounter: 'Encounter',
  CombatSession: 'CombatSession',
  CombatAction: 'CombatAction',
  DiceRoll: 'DiceRoll',
  CustomContent: 'CustomContent',
  HouseRule: 'HouseRule',
  Handout: 'Handout',
  SessionNote: 'SessionNote'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
