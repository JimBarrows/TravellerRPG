/**
 * GraphQL Mutation Resolvers
 * Implements all mutation operations for the Traveller RPG API
 */

const { withDatabase } = require('./database');
const { getUserFromEvent, requireCampaignAccess, requireGamemasterAccess, requireCharacterOwnership } = require('./auth');
const { 
  validateInput, 
  updateUserProfileSchema,
  createCampaignSchema,
  updateCampaignSchema,
  createCharacterSchema,
  updateCharacterSchema,
  createSessionSchema,
  updateSessionSchema,
  rollDiceSchema,
  validateDiceNotation 
} = require('./validation');

/**
 * Mutation: updateUserProfile
 */
async function updateUserProfile(event, args) {
  const user = getUserFromEvent(event);
  const input = validateInput(updateUserProfileSchema, args.input);
  
  return await withDatabase(async (prisma) => {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: input,
    });

    return updatedUser;
  });
}

/**
 * Mutation: createCampaign
 */
async function createCampaign(event, args) {
  const user = getUserFromEvent(event);
  const input = validateInput(createCampaignSchema, args.input);
  
  return await withDatabase(async (prisma) => {
    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: input.name,
        description: input.description,
        gamemasterId: user.id,
        maxPlayers: input.settings?.maxPlayers || 6,
        isPublic: input.settings?.isPublic || false,
        allowedBooks: input.settings?.allowedBooks || ['Core Rulebook'],
        houseRules: input.settings?.houseRules || {},
        isActive: true,
      },
    });

    // Add gamemaster as campaign member
    await prisma.campaignMember.create({
      data: {
        campaignId: campaign.id,
        userId: user.id,
        role: 'GAMEMASTER',
      },
    });

    // Return campaign with gamemaster info
    const fullCampaign = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: {
        gamemaster: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    return {
      ...fullCampaign,
      players: [fullCampaign.gamemaster],
      settings: {
        houseRules: fullCampaign.houseRules,
        allowedBooks: fullCampaign.allowedBooks,
        maxPlayers: fullCampaign.maxPlayers,
        isPublic: fullCampaign.isPublic,
      },
    };
  });
}

/**
 * Mutation: updateCampaign
 */
async function updateCampaign(event, args) {
  const user = getUserFromEvent(event);
  const input = validateInput(updateCampaignSchema, args.input);
  
  return await withDatabase(async (prisma) => {
    // Check if user is gamemaster
    await requireGamemasterAccess(prisma, user, args.id);

    const updateData = {
      name: input.name,
      description: input.description,
    };

    if (input.settings) {
      updateData.maxPlayers = input.settings.maxPlayers;
      updateData.isPublic = input.settings.isPublic;
      updateData.allowedBooks = input.settings.allowedBooks;
      updateData.houseRules = input.settings.houseRules;
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: args.id },
      data: updateData,
      include: {
        gamemaster: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    return {
      ...updatedCampaign,
      players: updatedCampaign.members.map(m => m.user),
      settings: {
        houseRules: updatedCampaign.houseRules,
        allowedBooks: updatedCampaign.allowedBooks,
        maxPlayers: updatedCampaign.maxPlayers,
        isPublic: updatedCampaign.isPublic,
      },
    };
  });
}

/**
 * Mutation: deleteCampaign
 */
async function deleteCampaign(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Check if user is gamemaster
    await requireGamemasterAccess(prisma, user, args.id);

    // Delete campaign and all related data (cascade delete)
    await prisma.campaign.delete({
      where: { id: args.id },
    });

    return true;
  });
}

/**
 * Mutation: invitePlayerToCampaign
 */
async function invitePlayerToCampaign(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Check if user is gamemaster
    await requireGamemasterAccess(prisma, user, args.campaignId);

    // Find user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email: args.email },
    });

    if (!invitedUser) {
      throw new Error('User not found with this email address');
    }

    // Check if user is already a member
    const existingMember = await prisma.campaignMember.findFirst({
      where: {
        campaignId: args.campaignId,
        userId: invitedUser.id,
      },
    });

    if (existingMember) {
      throw new Error('User is already a member of this campaign');
    }

    // Add user to campaign
    await prisma.campaignMember.create({
      data: {
        campaignId: args.campaignId,
        userId: invitedUser.id,
        role: 'PLAYER',
      },
    });

    return true;
  });
}

/**
 * Mutation: createCharacter
 */
async function createCharacter(event, args) {
  const user = getUserFromEvent(event);
  const input = validateInput(createCharacterSchema, args.input);
  
  return await withDatabase(async (prisma) => {
    // Check if user has access to campaign
    await requireCampaignAccess(prisma, user, input.campaignId);

    // Create character
    const character = await prisma.character.create({
      data: {
        name: input.name,
        playerId: user.id,
        campaignId: input.campaignId,
        credits: 0,
        homeworld: 'Unknown',
        age: 18,
        status: 'ACTIVE',
      },
    });

    // Create characteristics
    await prisma.characteristics.create({
      data: {
        characterId: character.id,
        ...input.characteristics,
      },
    });

    // Return character with all data
    const fullCharacter = await prisma.character.findUnique({
      where: { id: character.id },
      include: {
        player: {
          select: {
            id: true,
            displayName: true,
          },
        },
        campaign: true,
        characteristics: true,
        skills: true,
        equipment: true,
        lifeEvents: true,
      },
    });

    return {
      ...fullCharacter,
      history: fullCharacter.lifeEvents,
    };
  });
}

/**
 * Mutation: updateCharacter
 */
async function updateCharacter(event, args) {
  const user = getUserFromEvent(event);
  const input = validateInput(updateCharacterSchema, args.input);
  
  return await withDatabase(async (prisma) => {
    // Check if user owns this character
    await requireCharacterOwnership(prisma, user, args.id);

    // Update character basic info
    const updateData = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.credits !== undefined) updateData.credits = input.credits;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.portrait !== undefined) updateData.portrait = input.portrait;

    if (Object.keys(updateData).length > 0) {
      await prisma.character.update({
        where: { id: args.id },
        data: updateData,
      });
    }

    // Update characteristics
    if (input.characteristics) {
      await prisma.characteristics.upsert({
        where: { characterId: args.id },
        update: input.characteristics,
        create: {
          characterId: args.id,
          ...input.characteristics,
        },
      });
    }

    // Update skills (replace all)
    if (input.skills) {
      await prisma.characterSkill.deleteMany({
        where: { characterId: args.id },
      });

      for (const skill of input.skills) {
        await prisma.characterSkill.create({
          data: {
            characterId: args.id,
            name: skill.name,
            level: skill.level,
            specialization: skill.specialization,
          },
        });
      }
    }

    // Update equipment (replace all)
    if (input.equipment) {
      await prisma.characterEquipment.deleteMany({
        where: { characterId: args.id },
      });

      for (const item of input.equipment) {
        await prisma.characterEquipment.create({
          data: {
            characterId: args.id,
            ...item,
          },
        });
      }
    }

    // Return updated character
    const updatedCharacter = await prisma.character.findUnique({
      where: { id: args.id },
      include: {
        player: {
          select: {
            id: true,
            displayName: true,
          },
        },
        campaign: true,
        characteristics: true,
        skills: true,
        equipment: true,
        lifeEvents: true,
      },
    });

    return {
      ...updatedCharacter,
      history: updatedCharacter.lifeEvents,
    };
  });
}

/**
 * Mutation: deleteCharacter
 */
async function deleteCharacter(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Check if user owns this character
    await requireCharacterOwnership(prisma, user, args.id);

    // Delete character (cascade delete for related data)
    await prisma.character.delete({
      where: { id: args.id },
    });

    return true;
  });
}

/**
 * Mutation: createSession
 */
async function createSession(event, args) {
  const user = getUserFromEvent(event);
  const input = validateInput(createSessionSchema, args.input);
  
  return await withDatabase(async (prisma) => {
    // Check if user is gamemaster
    await requireGamemasterAccess(prisma, user, input.campaignId);

    const session = await prisma.session.create({
      data: {
        campaignId: input.campaignId,
        name: input.name,
        date: input.scheduledFor ? new Date(input.scheduledFor) : new Date(),
        gamemasterId: user.id,
        duration: input.duration,
        status: 'SCHEDULED',
      },
      include: {
        gamemaster: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return session;
  });
}

/**
 * Mutation: updateSession
 */
async function updateSession(event, args) {
  const user = getUserFromEvent(event);
  const input = validateInput(updateSessionSchema, args.input);
  
  return await withDatabase(async (prisma) => {
    // Check if user is gamemaster of the session's campaign
    const session = await prisma.session.findUnique({
      where: { id: args.id },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    await requireGamemasterAccess(prisma, user, session.campaignId);

    const updateData = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.scheduledFor !== undefined) updateData.date = new Date(input.scheduledFor);
    if (input.duration !== undefined) updateData.duration = input.duration;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.status !== undefined) updateData.status = input.status;

    const updatedSession = await prisma.session.update({
      where: { id: args.id },
      data: updateData,
      include: {
        gamemaster: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return updatedSession;
  });
}

/**
 * Mutation: rollDice
 */
async function rollDice(event, args) {
  const user = getUserFromEvent(event);
  const input = validateInput(rollDiceSchema, args.input);
  
  return await withDatabase(async (prisma) => {
    // Check if user has access to campaign
    await requireCampaignAccess(prisma, user, input.campaignId);

    // Validate dice notation and calculate result
    const { count, sides, modifier } = validateDiceNotation(input.dice);
    
    // Roll the dice
    const rolls = [];
    let total = 0;
    
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    const finalResult = total + modifier;

    // Get user's active character in this campaign (if any)
    const character = await prisma.character.findFirst({
      where: {
        playerId: user.id,
        campaignId: input.campaignId,
        status: 'ACTIVE',
      },
    });

    // Save dice roll
    const diceRoll = await prisma.diceRoll.create({
      data: {
        campaignId: input.campaignId,
        characterId: character?.id,
        dice: input.dice,
        result: finalResult,
        individual: rolls,
        modifiers: input.modifiers || [],
        isPublic: input.isPublic,
        description: input.description,
        timestamp: new Date(),
      },
      include: {
        character: {
          include: {
            player: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    return {
      ...diceRoll,
      roller: diceRoll.character?.player || { id: user.id, displayName: user.username || 'Unknown' },
    };
  });
}

module.exports = {
  updateUserProfile,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  invitePlayerToCampaign,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  createSession,
  updateSession,
  rollDice,
};