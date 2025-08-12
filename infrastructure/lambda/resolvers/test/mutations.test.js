/**
 * Unit tests for GraphQL mutation resolvers
 */

const mutations = require('../mutations');
const { withDatabase } = require('../database');
const { validateInput } = require('../validation');

// Mock the database module
jest.mock('../database', () => ({
  withDatabase: jest.fn(),
}));

// Mock the auth module
jest.mock('../auth', () => ({
  getUserFromEvent: jest.fn(),
  requireCampaignAccess: jest.fn(),
  requireGamemasterAccess: jest.fn(),
  requireCharacterOwnership: jest.fn(),
}));

// Mock validation module
jest.mock('../validation', () => ({
  validateInput: jest.fn(),
  validateDiceNotation: jest.fn(),
}));

const { getUserFromEvent, requireGamemasterAccess, requireCharacterOwnership } = require('../auth');
const { validateDiceNotation } = require('../validation');

describe('GraphQL Mutation Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock for validateInput to return input as-is
    validateInput.mockImplementation((schema, input) => input);
  });

  describe('createCampaign', () => {
    it('should create a new campaign', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };
      const mockInput = {
        name: 'Test Campaign',
        description: 'A test campaign',
        settings: {
          maxPlayers: 6,
          isPublic: false,
        },
      };
      const mockCreatedCampaign = {
        id: 'campaign1',
        ...mockInput,
        gamemasterId: 'user1',
      };

      getUserFromEvent.mockReturnValue(mockUser);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          campaign: {
            create: jest.fn().mockResolvedValue(mockCreatedCampaign),
            findUnique: jest.fn().mockResolvedValue({
              ...mockCreatedCampaign,
              gamemaster: { id: 'user1', displayName: 'Test User' },
            }),
          },
          campaignMember: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockPrisma);
      });

      const result = await mutations.createCampaign(
        { identity: { cognitoIdentityId: 'user1' } },
        { input: mockInput }
      );

      expect(result.name).toBe('Test Campaign');
      expect(result.gamemaster.id).toBe('user1');
    });

    it('should validate input before creating campaign', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };
      const invalidInput = { name: '' }; // Invalid: empty name

      getUserFromEvent.mockReturnValue(mockUser);
      validateInput.mockImplementation((schema, input) => {
        if (!input.name || input.name.trim() === '') {
          throw new Error('Validation failed: name must not be empty');
        }
        return input;
      });

      await expect(mutations.createCampaign(
        { identity: { cognitoIdentityId: 'user1' } },
        { input: invalidInput }
      )).rejects.toThrow('Validation failed');

      expect(validateInput).toHaveBeenCalled();
    });
  });

  describe('updateCharacter', () => {
    it('should update character with ownership check', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };
      const mockInput = {
        name: 'Updated Character',
        credits: 5000,
        characteristics: {
          strength: 10,
          dexterity: 11,
          endurance: 9,
          intelligence: 12,
          education: 13,
          socialStanding: 8,
        },
      };
      const mockUpdatedCharacter = {
        id: 'char1',
        ...mockInput,
        player: { id: 'user1', displayName: 'Test User' },
        campaign: { id: 'campaign1', name: 'Test Campaign' },
        characteristics: mockInput.characteristics,
        skills: [],
        equipment: [],
        lifeEvents: [],
      };

      getUserFromEvent.mockReturnValue(mockUser);
      requireCharacterOwnership.mockResolvedValue(true);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          character: {
            update: jest.fn().mockResolvedValue({}),
            findUnique: jest.fn().mockResolvedValue(mockUpdatedCharacter),
          },
          characteristics: {
            upsert: jest.fn().mockResolvedValue(mockInput.characteristics),
          },
          characterSkill: {
            deleteMany: jest.fn().mockResolvedValue({}),
          },
          characterEquipment: {
            deleteMany: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockPrisma);
      });

      const result = await mutations.updateCharacter(
        { identity: { cognitoIdentityId: 'user1' } },
        { id: 'char1', input: mockInput }
      );

      expect(result.name).toBe('Updated Character');
      expect(result.characteristics.strength).toBe(10);
      expect(requireCharacterOwnership).toHaveBeenCalledWith(expect.anything(), mockUser, 'char1');
    });

    it('should deny update if user does not own character', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };
      const mockInput = { name: 'Updated Character' };

      getUserFromEvent.mockReturnValue(mockUser);
      validateInput.mockImplementation((schema, input) => input); // Allow validation to pass
      requireCharacterOwnership.mockRejectedValue(new Error('Access denied: Character ownership required'));

      await expect(mutations.updateCharacter(
        { identity: { cognitoIdentityId: 'user1' } },
        { id: 'char1', input: mockInput }
      )).rejects.toThrow('Character ownership required');
    });
  });

  describe('rollDice', () => {
    it('should create a dice roll with valid notation', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };
      const mockInput = {
        campaignId: 'campaign1',
        dice: '2d6',
        isPublic: true,
        description: 'Attack roll',
      };
      const mockCharacter = { id: 'char1', playerId: 'user1' };
      const mockDiceRoll = {
        id: 'roll1',
        ...mockInput,
        result: 8,
        individual: [3, 5],
        character: {
          player: { id: 'user1', displayName: 'Test User' },
        },
      };

      getUserFromEvent.mockReturnValue(mockUser);
      validateInput.mockImplementation((schema, input) => input); // Allow input validation to pass
      validateDiceNotation.mockReturnValue({ count: 2, sides: 6, modifier: 0 });
      
      // Mock Math.random to return predictable results
      const originalRandom = Math.random;
      Math.random = jest.fn()
        .mockReturnValueOnce(0.2) // First die: 2 * 6 = 1.2, floor + 1 = 2, but we want 3
        .mockReturnValueOnce(0.7); // Second die: 0.7 * 6 = 4.2, floor + 1 = 5

      // Actually, let's mock it properly
      Math.random = jest.fn()
        .mockReturnValueOnce(0.33) // (0.33 * 6) + 1 = 2.98 + 1 = 3.98, floor = 3
        .mockReturnValueOnce(0.67); // (0.67 * 6) + 1 = 4.02 + 1 = 5.02, floor = 5

      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          character: {
            findFirst: jest.fn().mockResolvedValue(mockCharacter),
          },
          diceRoll: {
            create: jest.fn().mockResolvedValue(mockDiceRoll),
          },
        };
        return callback(mockPrisma);
      });

      const result = await mutations.rollDice(
        { identity: { cognitoIdentityId: 'user1' } },
        { input: mockInput }
      );

      expect(result.dice).toBe('2d6');
      expect(result.roller.id).toBe('user1');
      expect(validateDiceNotation).toHaveBeenCalledWith('2d6');

      // Restore Math.random
      Math.random = originalRandom;
    });

    it('should reject invalid dice notation', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };
      const mockInput = {
        campaignId: 'campaign1',
        dice: 'invalid',
        isPublic: true,
      };

      getUserFromEvent.mockReturnValue(mockUser);
      validateInput.mockImplementation((schema, input) => input); // Allow input validation to pass
      validateDiceNotation.mockImplementation(() => {
        throw new Error('Invalid dice notation');
      });

      await expect(mutations.rollDice(
        { identity: { cognitoIdentityId: 'user1' } },
        { input: mockInput }
      )).rejects.toThrow('Invalid dice notation');
    });
  });

  describe('deleteCampaign', () => {
    it('should delete campaign with gamemaster check', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };

      getUserFromEvent.mockReturnValue(mockUser);
      requireGamemasterAccess.mockResolvedValue(true);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          campaign: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockPrisma);
      });

      const result = await mutations.deleteCampaign(
        { identity: { cognitoIdentityId: 'user1' } },
        { id: 'campaign1' }
      );

      expect(result).toBe(true);
      expect(requireGamemasterAccess).toHaveBeenCalledWith(expect.anything(), mockUser, 'campaign1');
    });

    it('should deny deletion if user is not gamemaster', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };

      getUserFromEvent.mockReturnValue(mockUser);
      requireGamemasterAccess.mockRejectedValue(new Error('Access denied: Gamemaster access required'));

      await expect(mutations.deleteCampaign(
        { identity: { cognitoIdentityId: 'user1' } },
        { id: 'campaign1' }
      )).rejects.toThrow('Gamemaster access required');
    });
  });

  describe('invitePlayerToCampaign', () => {
    it('should invite player to campaign', async () => {
      const mockUser = { id: 'user1', username: 'gamemaster' };
      const mockInvitedUser = { id: 'user2', email: 'player@example.com' };

      getUserFromEvent.mockReturnValue(mockUser);
      requireGamemasterAccess.mockResolvedValue(true);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockInvitedUser),
          },
          campaignMember: {
            findFirst: jest.fn().mockResolvedValue(null), // Not already a member
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockPrisma);
      });

      const result = await mutations.invitePlayerToCampaign(
        { identity: { cognitoIdentityId: 'user1' } },
        { campaignId: 'campaign1', email: 'player@example.com' }
      );

      expect(result).toBe(true);
      expect(requireGamemasterAccess).toHaveBeenCalledWith(expect.anything(), mockUser, 'campaign1');
    });

    it('should reject invitation if user is already a member', async () => {
      const mockUser = { id: 'user1', username: 'gamemaster' };
      const mockInvitedUser = { id: 'user2', email: 'player@example.com' };
      const mockExistingMember = { userId: 'user2', campaignId: 'campaign1' };

      getUserFromEvent.mockReturnValue(mockUser);
      requireGamemasterAccess.mockResolvedValue(true);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockInvitedUser),
          },
          campaignMember: {
            findFirst: jest.fn().mockResolvedValue(mockExistingMember),
          },
        };
        return callback(mockPrisma);
      });

      await expect(mutations.invitePlayerToCampaign(
        { identity: { cognitoIdentityId: 'user1' } },
        { campaignId: 'campaign1', email: 'player@example.com' }
      )).rejects.toThrow('User is already a member of this campaign');
    });
  });
});