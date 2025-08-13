/**
 * Unit tests for GraphQL query resolvers
 */

const queries = require('../queries');
const { withDatabase } = require('../database');

// Mock the database module
jest.mock('../database', () => ({
  withDatabase: jest.fn(),
}));

// Mock the auth module
jest.mock('../auth', () => ({
  getUserFromEvent: jest.fn(),
  requireCampaignAccess: jest.fn(),
}));

const { getUserFromEvent, requireCampaignAccess } = require('../auth');

describe('GraphQL Query Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };
      const mockDbUser = {
        id: 'user1',
        email: 'test@example.com',
        displayName: 'Test User',
        subscriptionTier: 'FREE',
      };

      getUserFromEvent.mockReturnValue(mockUser);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockDbUser),
          },
        };
        return callback(mockPrisma);
      });

      const result = await queries.getCurrentUser({ identity: { cognitoIdentityId: 'user1' } });

      expect(result).toEqual(mockDbUser);
      expect(getUserFromEvent).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };

      getUserFromEvent.mockReturnValue(mockUser);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(mockPrisma);
      });

      await expect(queries.getCurrentUser({ identity: { cognitoIdentityId: 'user1' } }))
        .rejects.toThrow('User not found');
    });
  });

  describe('getCampaign', () => {
    it('should return campaign data with access check', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };
      const mockCampaign = {
        id: 'campaign1',
        name: 'Test Campaign',
        gamemaster: { id: 'gm1', displayName: 'GM User' },
        members: [
          { user: { id: 'user1', displayName: 'Player 1' } },
          { user: { id: 'user2', displayName: 'Player 2' } },
        ],
        characters: [],
        sessions: [],
        houseRules: {},
        allowedBooks: ['Core'],
        maxPlayers: 6,
        isPublic: false,
      };

      getUserFromEvent.mockReturnValue(mockUser);
      requireCampaignAccess.mockResolvedValue(true);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          campaign: {
            findUnique: jest.fn().mockResolvedValue(mockCampaign),
          },
        };
        return callback(mockPrisma);
      });

      const result = await queries.getCampaign(
        { identity: { cognitoIdentityId: 'user1' } },
        { id: 'campaign1' }
      );

      expect(result.name).toBe('Test Campaign');
      expect(result.players).toHaveLength(2);
      expect(requireCampaignAccess).toHaveBeenCalledWith(expect.anything(), mockUser, 'campaign1');
    });

    it('should throw error if campaign not found', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };

      getUserFromEvent.mockReturnValue(mockUser);
      requireCampaignAccess.mockResolvedValue(true);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          campaign: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        };
        return callback(mockPrisma);
      });

      await expect(queries.getCampaign(
        { identity: { cognitoIdentityId: 'user1' } },
        { id: 'campaign1' }
      )).rejects.toThrow('Campaign not found');
    });
  });

  describe('listCampaigns', () => {
    it('should return list of public campaigns', async () => {
      const mockCampaigns = [
        {
          id: 'campaign1',
          name: 'Public Campaign',
          isPublic: true,
          gamemaster: { id: 'gm1', displayName: 'GM User' },
          _count: { members: 3, characters: 2 },
        },
        {
          id: 'campaign2',
          name: 'Another Public Campaign',
          isPublic: true,
          gamemaster: { id: 'gm2', displayName: 'GM User 2' },
          _count: { members: 5, characters: 4 },
        },
      ];

      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          campaign: {
            findMany: jest.fn().mockResolvedValue(mockCampaigns),
          },
        };
        return callback(mockPrisma);
      });

      const result = await queries.listCampaigns({}, {});

      expect(result).toHaveLength(2);
      expect(result[0].memberCount).toBe(3);
      expect(result[0].characterCount).toBe(2);
    });

    it('should filter campaigns by name', async () => {
      const mockCampaigns = [
        {
          id: 'campaign1',
          name: 'Space Campaign',
          isPublic: true,
          gamemaster: { id: 'gm1', displayName: 'GM User' },
          _count: { members: 3, characters: 2 },
        },
      ];

      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          campaign: {
            findMany: jest.fn().mockImplementation(({ where }) => {
              expect(where.name.contains).toBe('Space');
              return Promise.resolve(mockCampaigns);
            }),
          },
        };
        return callback(mockPrisma);
      });

      const result = await queries.listCampaigns({}, { filter: { name: 'Space' } });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Space Campaign');
    });
  });

  describe('getCharacter', () => {
    it('should return character data with access check', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };
      const mockCharacter = {
        id: 'char1',
        name: 'Test Character',
        campaignId: 'campaign1',
        player: { id: 'user1', displayName: 'Player 1' },
        campaign: { id: 'campaign1', name: 'Test Campaign' },
        characteristics: { strength: 8, dexterity: 9 },
        skills: [],
        equipment: [],
        lifeEvents: [],
      };

      getUserFromEvent.mockReturnValue(mockUser);
      requireCampaignAccess.mockResolvedValue(true);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          character: {
            findUnique: jest.fn().mockResolvedValue(mockCharacter),
          },
        };
        return callback(mockPrisma);
      });

      const result = await queries.getCharacter(
        { identity: { cognitoIdentityId: 'user1' } },
        { id: 'char1' }
      );

      expect(result.name).toBe('Test Character');
      expect(result.history).toEqual([]);
      expect(requireCampaignAccess).toHaveBeenCalledWith(expect.anything(), mockUser, 'campaign1');
    });
  });

  describe('listDiceRolls', () => {
    it('should return dice rolls for campaign with access check', async () => {
      const mockUser = { id: 'user1', username: 'testuser' };
      const mockDiceRolls = [
        {
          id: 'roll1',
          dice: '2d6',
          result: 8,
          isPublic: true,
          character: {
            player: { id: 'user1', displayName: 'Player 1' },
          },
        },
        {
          id: 'roll2',
          dice: '1d20',
          result: 15,
          isPublic: false,
          character: {
            player: { id: 'user2', displayName: 'Player 2' },
          },
        },
      ];

      getUserFromEvent.mockReturnValue(mockUser);
      requireCampaignAccess.mockResolvedValue(true);
      withDatabase.mockImplementation(async (callback) => {
        const mockPrisma = {
          character: {
            findMany: jest.fn().mockResolvedValue([{ id: 'char1' }]),
          },
          diceRoll: {
            findMany: jest.fn().mockResolvedValue(mockDiceRolls),
          },
        };
        return callback(mockPrisma);
      });

      const result = await queries.listDiceRolls(
        { identity: { cognitoIdentityId: 'user1' } },
        { campaignId: 'campaign1' }
      );

      expect(result).toHaveLength(2);
      expect(result[0].roller.displayName).toBe('Player 1');
      expect(requireCampaignAccess).toHaveBeenCalledWith(expect.anything(), mockUser, 'campaign1');
    });
  });
});