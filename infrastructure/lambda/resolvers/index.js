/**
 * Main GraphQL Resolver Handler for AWS AppSync
 * Routes GraphQL operations to appropriate resolver functions
 */

const queries = require('./queries');
const mutations = require('./mutations');
const { disconnectDatabase } = require('./database');

/**
 * Main handler function for AWS Lambda
 */
exports.handler = async (event, context) => {
  console.log('GraphQL resolver event:', JSON.stringify(event, null, 2));
  
  // Set context to not wait for empty event loop
  context.callbackWaitsForEmptyEventLoop = false;
  
  const { fieldName, typeName, arguments: args } = event;
  
  try {
    let result;
    
    switch (typeName) {
      case 'Query':
        result = await handleQuery(event, fieldName, args);
        break;
      case 'Mutation':
        result = await handleMutation(event, fieldName, args);
        break;
      default:
        throw new Error(`Unknown GraphQL type: ${typeName}`);
    }
    
    console.log('Resolver result:', JSON.stringify(result, null, 2));
    return result;
    
  } catch (error) {
    console.error('Resolver error:', error);
    console.error('Error stack:', error.stack);
    
    // Return structured error for GraphQL
    throw new Error(error.message || 'Internal server error');
  }
};

/**
 * Handle GraphQL queries
 */
async function handleQuery(event, fieldName, args) {
  switch (fieldName) {
    // User queries
    case 'getUser':
      return await queries.getUser(event, args);
    case 'getCurrentUser':
      return await queries.getCurrentUser(event);
    
    // Campaign queries
    case 'getCampaign':
      return await queries.getCampaign(event, args);
    case 'listCampaigns':
      return await queries.listCampaigns(event, args);
    case 'listUserCampaigns':
      return await queries.listUserCampaigns(event);
    
    // Character queries
    case 'getCharacter':
      return await queries.getCharacter(event, args);
    case 'listCharacters':
      return await queries.listCharacters(event, args);
    case 'listUserCharacters':
      return await queries.listUserCharacters(event);
    
    // Session queries
    case 'getSession':
      return await queries.getSession(event, args);
    case 'listSessions':
      return await queries.listSessions(event, args);
    
    // Dice roll queries
    case 'listDiceRolls':
      return await queries.listDiceRolls(event, args);
    
    default:
      throw new Error(`Unknown query: ${fieldName}`);
  }
}

/**
 * Handle GraphQL mutations
 */
async function handleMutation(event, fieldName, args) {
  switch (fieldName) {
    // User mutations
    case 'updateUserProfile':
      return await mutations.updateUserProfile(event, args);
    
    // Campaign mutations
    case 'createCampaign':
      return await mutations.createCampaign(event, args);
    case 'updateCampaign':
      return await mutations.updateCampaign(event, args);
    case 'deleteCampaign':
      return await mutations.deleteCampaign(event, args);
    case 'invitePlayerToCampaign':
      return await mutations.invitePlayerToCampaign(event, args);
    
    // Character mutations
    case 'createCharacter':
      return await mutations.createCharacter(event, args);
    case 'updateCharacter':
      return await mutations.updateCharacter(event, args);
    case 'deleteCharacter':
      return await mutations.deleteCharacter(event, args);
    
    // Session mutations
    case 'createSession':
      return await mutations.createSession(event, args);
    case 'updateSession':
      return await mutations.updateSession(event, args);
    
    // Dice roll mutations
    case 'rollDice':
      return await mutations.rollDice(event, args);
    
    default:
      throw new Error(`Unknown mutation: ${fieldName}`);
  }
}

/**
 * Graceful shutdown handler
 */
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connections...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database connections...');
  await disconnectDatabase();
  process.exit(0);
});