// Test data utilities for BDD scenarios

class TestDataManager {
  constructor() {
    this.userData = {
      validUser: {
        username: 'john.doe@example.com',
        password: 'SecurePass123!',
        displayName: 'John Doe',
      },
      newUser: {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'NewPass123!',
        confirmPassword: 'NewPass123!',
      },
      invalidUser: {
        username: 'wrong@example.com',
        password: 'WrongPassword',
      },
    };

    this.characterData = {
      basicCharacter: {
        name: 'Marcus Vale',
        age: '32',
        gender: 'Male',
        homeworld: 'Terra',
      },
      characteristics: {
        STR: 8,
        DEX: 12,
        END: 10,
        INT: 11,
        EDU: 9,
        SOC: 7,
      },
      career: {
        name: 'Navy',
        terms: 3,
        rank: 'Lieutenant',
      },
    };

    this.gameData = {
      campaigns: [
        {
          name: 'Spinward Marches Campaign',
          description: 'Exploration of the Spinward Marches',
          players: 4,
        },
      ],
      tradeRoutes: [
        {
          commodity: 'Electronics',
          profit: '40%',
          origin: 'Regina',
          destination: 'Lanth',
        },
      ],
    };

    this.notifications = {
      campaignInvite: {
        title: 'Campaign Invitation',
        body: "You're invited to join Spinward Marches Campaign",
        type: 'campaign_invite',
      },
      sessionReminder: {
        title: 'Game Session Tomorrow',
        body: 'Spinward Marches at 7:00 PM',
        type: 'session_reminder',
      },
      characterUpdate: {
        title: 'Character Updated',
        body: 'Marcus Vale gained 2 XP',
        type: 'character_update',
      },
    };
  }

  getUser(userType) {
    return this.userData[userType] || null;
  }

  getCharacter(characterType) {
    return this.characterData[characterType] || null;
  }

  getNotification(notificationType) {
    return this.notifications[notificationType] || null;
  }

  generateRandomCharacter() {
    const names = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery'];
    const surnames = ['Smith', 'Johnson', 'Brown', 'Wilson', 'Davis', 'Miller'];
    const homeworlds = [
      'Terra',
      'Regina',
      'Lanth',
      'Aramis',
      'Rhylanor',
      'Efate',
    ];

    return {
      name: `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`,
      age: (Math.floor(Math.random() * 30) + 18).toString(),
      homeworld: homeworlds[Math.floor(Math.random() * homeworlds.length)],
    };
  }

  generateCharacteristics() {
    return {
      STR: Math.floor(Math.random() * 6) + 6,
      DEX: Math.floor(Math.random() * 6) + 6,
      END: Math.floor(Math.random() * 6) + 6,
      INT: Math.floor(Math.random() * 6) + 6,
      EDU: Math.floor(Math.random() * 6) + 6,
      SOC: Math.floor(Math.random() * 6) + 6,
    };
  }

  getDiceConfiguration(diceString) {
    const configurations = {
      '1d6': { dice: 1, sides: 6, modifier: 0 },
      '2d6': { dice: 2, sides: 6, modifier: 0 },
      '2d6+2': { dice: 2, sides: 6, modifier: 2 },
      '3d6': { dice: 3, sides: 6, modifier: 0 },
      '1d100': { dice: 1, sides: 100, modifier: 0 },
    };

    return configurations[diceString] || null;
  }

  getEquipmentByCategory(category) {
    const equipment = {
      weapons: [
        { name: 'Laser Rifle', cost: 3500, weight: 4 },
        { name: 'Laser Pistol', cost: 2000, weight: 1.5 },
        { name: 'Shotgun', cost: 150, weight: 3 },
      ],
      armor: [
        { name: 'Cloth Armor', cost: 250, weight: 2 },
        { name: 'Reflec Armor', cost: 1500, weight: 1 },
        { name: 'Combat Armor', cost: 20000, weight: 8 },
      ],
      gear: [
        { name: 'Communicator', cost: 150, weight: 0.5 },
        { name: 'Hand Computer', cost: 1000, weight: 0.5 },
        { name: 'Survival Kit', cost: 200, weight: 2 },
      ],
    };

    return equipment[category.toLowerCase()] || [];
  }
}

module.exports = new TestDataManager();
