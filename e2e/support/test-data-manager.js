import { faker } from "faker";
import axios from "axios";

export class TestDataManager {
  constructor(apiURL, authToken = null) {
    this.apiURL = apiURL;
    this.authToken = authToken;
    this.createdData = {
      users: [],
      characters: [],
      campaigns: [],
      sessions: [],
    };
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // User data generation and management
  async createTestUser(overrides = {}) {
    const userData = {
      email: faker.internet.email(),
      password: "TestPass123!",
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      username: faker.internet.userName(),
      ...overrides,
    };

    try {
      // Register user
      const registrationResponse = await axios.post(
        `${this.apiURL}/auth/register`,
        userData,
      );
      const registrationData = registrationResponse.data;

      // Auto-verify user for testing
      await axios.post(`${this.apiURL}/auth/verify`, {
        token: registrationData.verificationToken,
      });

      // Login to get auth token
      const loginResponse = await axios.post(`${this.apiURL}/auth/login`, {
        email: userData.email,
        password: userData.password,
      });

      const user = {
        ...userData,
        id: registrationData.id,
        token: loginResponse.data.token,
        verified: true,
      };

      this.createdData.users.push(user);
      return user;
    } catch (error) {
      console.error(
        "Failed to create test user:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async createTestCharacter(userId, overrides = {}) {
    const characterData = {
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      age: faker.datatype.number({ min: 18, max: 50 }),
      gender: faker.random.arrayElement(["Male", "Female", "Non-binary"]),
      race: "HUMAN",
      background: faker.lorem.paragraph(),
      ...overrides,
    };

    try {
      const response = await axios.post(
        `${this.apiURL}/graphql`,
        {
          query: `
          mutation CreateCharacter($input: CharacterInput!) {
            createCharacter(input: $input) {
              id
              name
              age
              gender
              race { type }
              status
            }
          }
        `,
          variables: {
            input: {
              name: characterData.name,
              gender: characterData.gender,
              raceId: "1", // Assuming Human race ID
            },
          },
        },
        {
          headers: this.getHeaders(),
        },
      );

      const character = response.data.data.createCharacter;

      this.createdData.characters.push({
        ...character,
        userId,
        testData: characterData,
      });

      return character;
    } catch (error) {
      console.error(
        "Failed to create test character:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async createTestCampaign(gmUserId, overrides = {}) {
    const campaignData = {
      name: faker.company.companyName() + " Campaign",
      description: faker.lorem.paragraphs(2),
      maxPlayers: faker.datatype.number({ min: 3, max: 8 }),
      isPublic: faker.datatype.boolean(),
      gameSystem: "Traveller RPG",
      ...overrides,
    };

    try {
      const response = await axios.post(
        `${this.apiURL}/campaigns`,
        campaignData,
        {
          headers: this.getHeaders(),
        },
      );

      const campaign = response.data;

      this.createdData.campaigns.push({
        ...campaign,
        gmUserId,
        testData: campaignData,
      });

      return campaign;
    } catch (error) {
      console.error(
        "Failed to create test campaign:",
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  // Batch data creation for load testing
  async createBatchUsers(count = 10) {
    const users = [];
    const batchSize = 5;

    for (let i = 0; i < count; i += batchSize) {
      const batch = [];
      const remaining = Math.min(batchSize, count - i);

      for (let j = 0; j < remaining; j++) {
        batch.push(
          this.createTestUser({
            username: `batch_user_${i + j + 1}_${Date.now()}`,
          }),
        );
      }

      const batchResults = await Promise.all(batch);
      users.push(...batchResults);

      // Small delay between batches to avoid overwhelming the API
      if (i + batchSize < count) {
        await this.delay(100);
      }
    }

    return users;
  }

  async createBatchCharacters(userId, count = 5) {
    const characters = [];

    for (let i = 0; i < count; i++) {
      const character = await this.createTestCharacter(userId, {
        name: `Test Character ${i + 1} - ${faker.name.firstName()}`,
      });
      characters.push(character);

      // Small delay between character creations
      await this.delay(50);
    }

    return characters;
  }

  // Data cleanup methods
  async cleanupTestData() {
    console.log("🧹 Starting test data cleanup...");

    try {
      // Clean up characters
      if (this.createdData.characters.length > 0) {
        await this.cleanupCharacters();
      }

      // Clean up campaigns
      if (this.createdData.campaigns.length > 0) {
        await this.cleanupCampaigns();
      }

      // Clean up users (do this last)
      if (this.createdData.users.length > 0) {
        await this.cleanupUsers();
      }

      // Reset data tracking
      this.createdData = {
        users: [],
        characters: [],
        campaigns: [],
        sessions: [],
      };

      console.log("✅ Test data cleanup completed");
    } catch (error) {
      console.error("❌ Test data cleanup failed:", error.message);
      throw error;
    }
  }

  async cleanupCharacters() {
    console.log(
      `Cleaning up ${this.createdData.characters.length} test characters...`,
    );

    const cleanupPromises = this.createdData.characters.map(
      async (character) => {
        try {
          await axios.delete(`${this.apiURL}/characters/${character.id}`, {
            headers: this.getHeaders(),
          });
        } catch (error) {
          console.warn(
            `Failed to delete character ${character.id}:`,
            error.message,
          );
        }
      },
    );

    await Promise.all(cleanupPromises);
    this.createdData.characters = [];
  }

  async cleanupCampaigns() {
    console.log(
      `Cleaning up ${this.createdData.campaigns.length} test campaigns...`,
    );

    const cleanupPromises = this.createdData.campaigns.map(async (campaign) => {
      try {
        await axios.delete(`${this.apiURL}/campaigns/${campaign.id}`, {
          headers: this.getHeaders(),
        });
      } catch (error) {
        console.warn(
          `Failed to delete campaign ${campaign.id}:`,
          error.message,
        );
      }
    });

    await Promise.all(cleanupPromises);
    this.createdData.campaigns = [];
  }

  async cleanupUsers() {
    console.log(`Cleaning up ${this.createdData.users.length} test users...`);

    const cleanupPromises = this.createdData.users.map(async (user) => {
      try {
        await axios.delete(`${this.apiURL}/users/${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.warn(`Failed to delete user ${user.id}:`, error.message);
      }
    });

    await Promise.all(cleanupPromises);
    this.createdData.users = [];
  }

  // Test data validation
  async validateCharacterData(characterId) {
    try {
      const response = await axios.post(
        `${this.apiURL}/graphql`,
        {
          query: `
          query ValidateCharacter($id: ID!) {
            character(id: $id) {
              id
              name
              characteristics {
                type
                value
              }
              skills {
                name
                level
              }
              careerHistory {
                career {
                  name
                }
                rank
              }
            }
          }
        `,
          variables: { id: characterId },
        },
        {
          headers: this.getHeaders(),
        },
      );

      const character = response.data.data.character;

      // Validate character has required data
      const validations = {
        hasId: !!character.id,
        hasName: !!character.name,
        hasCharacteristics: character.characteristics.length === 6,
        characteristicsInRange: character.characteristics.every(
          (c) => c.value >= 1 && c.value <= 18,
        ),
        hasSkills: character.skills.length > 0,
        hasCareerHistory: character.careerHistory.length > 0,
      };

      return {
        isValid: Object.values(validations).every((v) => v === true),
        validations,
        character,
      };
    } catch (error) {
      console.error(
        `Failed to validate character ${characterId}:`,
        error.message,
      );
      return { isValid: false, error: error.message };
    }
  }

  // Utility methods
  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Performance test data generation
  async generateLoadTestData(options = {}) {
    const {
      userCount = 10,
      charactersPerUser = 3,
      campaignCount = 2,
    } = options;

    console.log(
      `🚀 Generating load test data: ${userCount} users, ${charactersPerUser} chars/user, ${campaignCount} campaigns`,
    );

    try {
      // Create users
      const users = await this.createBatchUsers(userCount);
      console.log(`✅ Created ${users.length} users`);

      // Create characters for each user
      const allCharacters = [];
      for (const user of users) {
        this.setAuthToken(user.token);
        const characters = await this.createBatchCharacters(
          user.id,
          charactersPerUser,
        );
        allCharacters.push(...characters);
      }
      console.log(`✅ Created ${allCharacters.length} characters`);

      // Create campaigns with random GMs
      const campaigns = [];
      for (let i = 0; i < campaignCount; i++) {
        const randomGM = users[Math.floor(Math.random() * users.length)];
        this.setAuthToken(randomGM.token);
        const campaign = await this.createTestCampaign(randomGM.id, {
          name: `Load Test Campaign ${i + 1}`,
        });
        campaigns.push(campaign);
      }
      console.log(`✅ Created ${campaigns.length} campaigns`);

      return {
        users,
        characters: allCharacters,
        campaigns,
        summary: {
          totalUsers: users.length,
          totalCharacters: allCharacters.length,
          totalCampaigns: campaigns.length,
        },
      };
    } catch (error) {
      console.error("❌ Load test data generation failed:", error.message);
      throw error;
    }
  }

  // Export test data for external use
  exportTestData() {
    return {
      users: this.createdData.users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        token: u.token,
      })),
      characters: this.createdData.characters.map((c) => ({
        id: c.id,
        name: c.name,
        userId: c.userId,
      })),
      campaigns: this.createdData.campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        gmUserId: c.gmUserId,
      })),
    };
  }

  // Import existing test data (for test continuation)
  importTestData(data) {
    this.createdData = {
      users: data.users || [],
      characters: data.characters || [],
      campaigns: data.campaigns || [],
      sessions: data.sessions || [],
    };
  }
}

export default TestDataManager;
