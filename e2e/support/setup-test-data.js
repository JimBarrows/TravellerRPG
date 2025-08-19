#!/usr/bin/env node

/**
 * Test Data Setup Script
 * Sets up initial test data for E2E testing
 */

import { TestDataManager } from './test-data-manager.js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:8080';
const OUTPUT_FILE = path.join(process.cwd(), 'e2e-results', 'test-data.json');

async function setupTestData() {
  console.log('🚀 Setting up test data for E2E tests...');
  console.log(`API URL: ${API_URL}`);

  const testDataManager = new TestDataManager(API_URL);

  try {
    // Ensure output directory exists
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

    // Check if API is available
    const { default: axios } = await import('axios');
    
    try {
      await axios.get(`${API_URL}/health`);
      console.log('✅ API is available');
    } catch (error) {
      console.error('❌ API is not available. Please start the API server first.');
      process.exit(1);
    }

    // Create base test data
    console.log('\n📊 Creating base test data...');

    // Create admin user
    const adminUser = await testDataManager.createTestUser({
      email: 'e2e-admin@traveller-rpg.test',
      username: 'e2e-admin',
      firstName: 'E2E',
      lastName: 'Admin'
    });
    console.log(`✅ Created admin user: ${adminUser.email}`);

    // Create GM user
    const gmUser = await testDataManager.createTestUser({
      email: 'e2e-gm@traveller-rpg.test',
      username: 'e2e-gamemaster',
      firstName: 'Game',
      lastName: 'Master'
    });
    console.log(`✅ Created GM user: ${gmUser.email}`);

    // Create regular player users
    const playerUsers = [];
    for (let i = 1; i <= 3; i++) {
      const player = await testDataManager.createTestUser({
        email: `e2e-player${i}@traveller-rpg.test`,
        username: `e2e-player${i}`,
        firstName: `Player`,
        lastName: `${i}`
      });
      playerUsers.push(player);
      console.log(`✅ Created player user: ${player.email}`);
    }

    // Create characters for each player
    const allCharacters = [];
    for (const player of playerUsers) {
      testDataManager.setAuthToken(player.token);
      
      const character = await testDataManager.createTestCharacter(player.id, {
        name: `${player.firstName} ${player.lastName}'s Character`,
        background: `Test character for ${player.username}`
      });
      
      allCharacters.push(character);
      console.log(`✅ Created character: ${character.name} for ${player.username}`);
    }

    // Create a test campaign with the GM
    testDataManager.setAuthToken(gmUser.token);
    const testCampaign = await testDataManager.createTestCampaign(gmUser.id, {
      name: 'E2E Test Campaign',
      description: 'Campaign created for end-to-end testing purposes',
      maxPlayers: 4,
      isPublic: false
    });
    console.log(`✅ Created test campaign: ${testCampaign.name}`);

    // Create some additional test data for specific scenarios
    console.log('\n🎲 Creating scenario-specific test data...');

    // Character with complete career history
    testDataManager.setAuthToken(playerUsers[0].token);
    const veteranCharacter = await testDataManager.createTestCharacter(playerUsers[0].id, {
      name: 'Veteran Spacer',
      age: 38,
      background: 'Experienced character with multiple career terms for testing advanced features'
    });
    console.log(`✅ Created veteran character: ${veteranCharacter.name}`);

    // Load test data (smaller set)
    if (process.argv.includes('--with-load-data')) {
      console.log('\n⚡ Creating load test data...');
      
      const loadData = await testDataManager.generateLoadTestData({
        userCount: 5,
        charactersPerUser: 2,
        campaignCount: 1
      });
      
      console.log(`✅ Load test data created: ${loadData.summary.totalUsers} users, ${loadData.summary.totalCharacters} characters, ${loadData.summary.totalCampaigns} campaigns`);
    }

    // Save test data manifest
    const testDataManifest = {
      createdAt: new Date().toISOString(),
      apiUrl: API_URL,
      users: {
        admin: { email: adminUser.email, token: adminUser.token },
        gm: { email: gmUser.email, token: gmUser.token },
        players: playerUsers.map(p => ({ email: p.email, token: p.token, username: p.username }))
      },
      characters: allCharacters.map(c => ({ id: c.id, name: c.name })),
      campaigns: [{ id: testCampaign.id, name: testCampaign.name }],
      summary: testDataManager.exportTestData()
    };

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(testDataManifest, null, 2));
    console.log(`\n💾 Test data manifest saved to: ${OUTPUT_FILE}`);

    // Validate created data
    console.log('\n🔍 Validating created test data...');
    
    let validationErrors = 0;
    for (const character of allCharacters) {
      testDataManager.setAuthToken(adminUser.token);
      const validation = await testDataManager.validateCharacterData(character.id);
      
      if (!validation.isValid) {
        console.error(`❌ Character ${character.name} validation failed:`, validation.validations);
        validationErrors++;
      } else {
        console.log(`✅ Character ${character.name} validated successfully`);
      }
    }

    if (validationErrors > 0) {
      console.warn(`⚠️  ${validationErrors} characters failed validation`);
    }

    console.log('\n🎉 Test data setup completed successfully!');
    console.log('\nTest Credentials:');
    console.log(`Admin: ${adminUser.email} / TestPass123!`);
    console.log(`GM: ${gmUser.email} / TestPass123!`);
    playerUsers.forEach((player, index) => {
      console.log(`Player ${index + 1}: ${player.email} / TestPass123!`);
    });

    console.log(`\nTest data manifest: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ Test data setup failed:', error.message);
    console.error(error.stack);

    // Attempt cleanup on failure
    try {
      console.log('\n🧹 Attempting to clean up partial data...');
      await testDataManager.cleanupTestData();
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError.message);
    }

    process.exit(1);
  }
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log(`
E2E Test Data Setup

Usage: node setup-test-data.js [options]

Options:
  --with-load-data    Include additional data for load testing
  --help              Show this help message

Environment Variables:
  API_URL            API base URL (default: http://localhost:8080)

This script creates:
- Admin user account
- Game Master user account  
- 3 Player user accounts
- Test characters for each player
- Test campaign
- Validation of all created data

All accounts use the password: TestPass123!
Test data manifest is saved to e2e-results/test-data.json
`);
    process.exit(0);
  }

  await setupTestData();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}