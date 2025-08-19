import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// Setup steps
Given('I am logged in as a verified user', async function () {
  // Create and login with verified user
  const testUser = this.generateTestUser();
  
  // Quick registration and verification via API
  const registrationResponse = await this.page.request.post(`${this.config.apiURL}/auth/register`, {
    data: {
      email: testUser.email,
      password: testUser.password,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      username: testUser.username
    }
  });
  
  const registrationData = await registrationResponse.json();
  
  await this.page.request.post(`${this.config.apiURL}/auth/verify`, {
    data: { token: registrationData.verificationToken }
  });
  
  // Login via UI
  await this.navigateTo('/login');
  await this.fillField('[data-testid="login-email"]', testUser.email);
  await this.fillField('[data-testid="login-password"]', testUser.password);
  
  const loginPromise = this.waitForAPIResponse('auth/login', 'POST');
  await this.clickElement('[data-testid="login-button"]');
  
  const loginResponse = await loginPromise;
  const loginData = await loginResponse.json();
  
  this.storeTestData('currentUser', testUser);
  this.storeTestData('authToken', loginData.token);
});

Given('I am on the character creation page', async function () {
  await this.navigateTo('/characters/create');
  await this.waitForElement('[data-testid="character-creation-page"]');
});

// Wizard steps
Given('I start the character creation wizard', async function () {
  await this.waitForElement('[data-testid="character-creation-wizard"]');
  await this.waitForElement('[data-testid="wizard-start-button"]');
  await this.clickElement('[data-testid="wizard-start-button"]');
});

Given('I start the character creation wizard on mobile', async function () {
  await this.waitForElement('[data-testid="character-creation-wizard"]');
  
  // Ensure mobile layout is active
  const viewport = this.page.viewportSize();
  expect(viewport.width).toBeLessThan(768);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="wizard-start-button"]')?.scrollIntoView());
  await this.clickElement('[data-testid="wizard-start-button"]');
});

// Basic Information Step
When('I complete the basic information step', async function () {
  await this.waitForElement('[data-testid="basic-info-step"]');
  
  const characterData = this.generateTestCharacter();
  this.storeTestData('currentCharacter', characterData);
  
  await this.fillField('[data-testid="character-name-input"]', characterData.name);
  await this.fillField('[data-testid="character-age-input"]', characterData.age.toString());
  
  // Select gender
  await this.clickElement('[data-testid="gender-select"]');
  await this.clickElement(`[data-testid="gender-option-${characterData.gender.toLowerCase()}"]`);
  
  // Select race
  await this.clickElement('[data-testid="race-select"]');
  await this.clickElement(`[data-testid="race-option-${characterData.race.toLowerCase()}"]`);
  
  await this.fillField('[data-testid="background-textarea"]', characterData.background);
  
  await this.clickElement('[data-testid="next-step-button"]');
});

When('I complete the basic information step on mobile', async function () {
  await this.waitForElement('[data-testid="basic-info-step"]');
  
  const characterData = this.generateTestCharacter();
  this.storeTestData('currentCharacter', characterData);
  
  // Mobile-specific form completion with scrolling
  await this.page.evaluate(() => document.querySelector('[data-testid="character-name-input"]')?.scrollIntoView());
  await this.fillField('[data-testid="character-name-input"]', characterData.name);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="character-age-input"]')?.scrollIntoView());
  await this.fillField('[data-testid="character-age-input"]', characterData.age.toString());
  
  await this.page.evaluate(() => document.querySelector('[data-testid="gender-select"]')?.scrollIntoView());
  await this.clickElement('[data-testid="gender-select"]');
  await this.clickElement(`[data-testid="gender-option-${characterData.gender.toLowerCase()}"]`);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="race-select"]')?.scrollIntoView());
  await this.clickElement('[data-testid="race-select"]');
  await this.clickElement(`[data-testid="race-option-${characterData.race.toLowerCase()}"]`);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="background-textarea"]')?.scrollIntoView());
  await this.fillField('[data-testid="background-textarea"]', characterData.background);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="next-step-button"]')?.scrollIntoView());
  await this.clickElement('[data-testid="next-step-button"]');
});

// Characteristics Step
When('I roll characteristics', async function () {
  await this.waitForElement('[data-testid="characteristics-step"]');
  
  const rollPromise = this.waitForAPIResponse('characters/roll-characteristics', 'POST');
  await this.clickElement('[data-testid="roll-characteristics-button"]');
  
  const response = await rollPromise;
  expect(response.status()).toBe(200);
  
  // Wait for characteristics to be displayed
  await this.waitForElement('[data-testid="characteristic-strength"]');
  await this.waitForElement('[data-testid="characteristic-dexterity"]');
  await this.waitForElement('[data-testid="characteristic-endurance"]');
  await this.waitForElement('[data-testid="characteristic-intelligence"]');
  await this.waitForElement('[data-testid="characteristic-education"]');
  await this.waitForElement('[data-testid="characteristic-social"]');
  
  await this.clickElement('[data-testid="next-step-button"]');
});

When('I roll characteristics on mobile', async function () {
  await this.waitForElement('[data-testid="characteristics-step"]');
  
  await this.page.evaluate(() => document.querySelector('[data-testid="roll-characteristics-button"]')?.scrollIntoView());
  
  const rollPromise = this.waitForAPIResponse('characters/roll-characteristics', 'POST');
  await this.clickElement('[data-testid="roll-characteristics-button"]');
  
  const response = await rollPromise;
  expect(response.status()).toBe(200);
  
  // Wait for characteristics to be displayed
  await this.waitForElement('[data-testid="characteristic-strength"]');
  
  await this.page.evaluate(() => document.querySelector('[data-testid="next-step-button"]')?.scrollIntoView());
  await this.clickElement('[data-testid="next-step-button"]');
});

// Homeworld Step
When('I select a homeworld', async function () {
  await this.waitForElement('[data-testid="homeworld-step"]');
  
  // Wait for homeworld options to load
  await this.waitForElement('[data-testid="homeworld-list"]');
  
  // Select first available homeworld
  await this.clickElement('[data-testid="homeworld-option"]:first-of-type');
  
  const selectionPromise = this.waitForAPIResponse('characters/select-homeworld', 'POST');
  await this.clickElement('[data-testid="confirm-homeworld-button"]');
  
  const response = await selectionPromise;
  expect(response.status()).toBe(200);
  
  await this.clickElement('[data-testid="next-step-button"]');
});

When('I select a homeworld on mobile', async function () {
  await this.waitForElement('[data-testid="homeworld-step"]');
  
  await this.waitForElement('[data-testid="homeworld-list"]');
  
  // Mobile homeworld selection
  await this.page.evaluate(() => document.querySelector('[data-testid="homeworld-option"]:first-of-type')?.scrollIntoView());
  await this.clickElement('[data-testid="homeworld-option"]:first-of-type');
  
  await this.page.evaluate(() => document.querySelector('[data-testid="confirm-homeworld-button"]')?.scrollIntoView());
  
  const selectionPromise = this.waitForAPIResponse('characters/select-homeworld', 'POST');
  await this.clickElement('[data-testid="confirm-homeworld-button"]');
  
  const response = await selectionPromise;
  expect(response.status()).toBe(200);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="next-step-button"]')?.scrollIntoView());
  await this.clickElement('[data-testid="next-step-button"]');
});

// Career Step
When('I choose a career path', async function () {
  await this.waitForElement('[data-testid="career-step"]');
  
  // Wait for career options to load
  await this.waitForElement('[data-testid="career-list"]');
  
  // Select first available career
  await this.clickElement('[data-testid="career-option"]:first-of-type');
  
  const careerPromise = this.waitForAPIResponse('characters/select-career', 'POST');
  await this.clickElement('[data-testid="confirm-career-button"]');
  
  const response = await careerPromise;
  expect(response.status()).toBe(200);
  
  await this.clickElement('[data-testid="next-step-button"]');
});

When('I choose a career path on mobile', async function () {
  await this.waitForElement('[data-testid="career-step"]');
  
  await this.waitForElement('[data-testid="career-list"]');
  
  await this.page.evaluate(() => document.querySelector('[data-testid="career-option"]:first-of-type')?.scrollIntoView());
  await this.clickElement('[data-testid="career-option"]:first-of-type');
  
  await this.page.evaluate(() => document.querySelector('[data-testid="confirm-career-button"]')?.scrollIntoView());
  
  const careerPromise = this.waitForAPIResponse('characters/select-career', 'POST');
  await this.clickElement('[data-testid="confirm-career-button"]');
  
  const response = await careerPromise;
  expect(response.status()).toBe(200);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="next-step-button"]')?.scrollIntoView());
  await this.clickElement('[data-testid="next-step-button"]');
});

// Career Terms Step
When('I complete career terms', async function () {
  await this.waitForElement('[data-testid="career-terms-step"]');
  
  // Complete one or more career terms
  let termCount = 0;
  const maxTerms = 3;
  
  while (termCount < maxTerms) {
    // Check if we can continue with career terms
    const continueButton = await this.page.locator('[data-testid="continue-career-button"]').first();
    
    if (await continueButton.isVisible()) {
      const termPromise = this.waitForAPIResponse('characters/complete-career-term', 'POST');
      await continueButton.click();
      
      const response = await termPromise;
      expect(response.status()).toBe(200);
      
      termCount++;
      
      // Wait for term results
      await this.waitForElement('[data-testid="term-results"]');
      
      // Check if we want to continue or muster out
      const musterOutButton = await this.page.locator('[data-testid="muster-out-button"]');
      
      if (await musterOutButton.isVisible() && termCount >= 2) {
        await musterOutButton.click();
        break;
      }
    } else {
      break;
    }
  }
  
  await this.clickElement('[data-testid="next-step-button"]');
});

When('I complete career terms on mobile', async function () {
  await this.waitForElement('[data-testid="career-terms-step"]');
  
  let termCount = 0;
  const maxTerms = 3;
  
  while (termCount < maxTerms) {
    const continueButton = await this.page.locator('[data-testid="continue-career-button"]').first();
    
    if (await continueButton.isVisible()) {
      await this.page.evaluate(() => document.querySelector('[data-testid="continue-career-button"]')?.scrollIntoView());
      
      const termPromise = this.waitForAPIResponse('characters/complete-career-term', 'POST');
      await continueButton.click();
      
      const response = await termPromise;
      expect(response.status()).toBe(200);
      
      termCount++;
      
      await this.waitForElement('[data-testid="term-results"]');
      
      const musterOutButton = await this.page.locator('[data-testid="muster-out-button"]');
      
      if (await musterOutButton.isVisible() && termCount >= 2) {
        await this.page.evaluate(() => document.querySelector('[data-testid="muster-out-button"]')?.scrollIntoView());
        await musterOutButton.click();
        break;
      }
    } else {
      break;
    }
  }
  
  await this.page.evaluate(() => document.querySelector('[data-testid="next-step-button"]')?.scrollIntoView());
  await this.clickElement('[data-testid="next-step-button"]');
});

// Skills Step
When('I select skills', async function () {
  await this.waitForElement('[data-testid="skills-step"]');
  
  // Select available skills
  const skillOptions = await this.page.locator('[data-testid^="skill-option-"]');
  const skillCount = await skillOptions.count();
  
  // Select first few available skills
  const maxSkills = Math.min(skillCount, 5);
  
  for (let i = 0; i < maxSkills; i++) {
    await skillOptions.nth(i).click();
  }
  
  const skillPromise = this.waitForAPIResponse('characters/add-skills', 'POST');
  await this.clickElement('[data-testid="confirm-skills-button"]');
  
  const response = await skillPromise;
  expect(response.status()).toBe(200);
  
  await this.clickElement('[data-testid="next-step-button"]');
});

When('I select skills on mobile', async function () {
  await this.waitForElement('[data-testid="skills-step"]');
  
  const skillOptions = await this.page.locator('[data-testid^="skill-option-"]');
  const skillCount = await skillOptions.count();
  const maxSkills = Math.min(skillCount, 5);
  
  for (let i = 0; i < maxSkills; i++) {
    await skillOptions.nth(i).scrollIntoViewIfNeeded();
    await skillOptions.nth(i).click();
  }
  
  await this.page.evaluate(() => document.querySelector('[data-testid="confirm-skills-button"]')?.scrollIntoView());
  
  const skillPromise = this.waitForAPIResponse('characters/add-skills', 'POST');
  await this.clickElement('[data-testid="confirm-skills-button"]');
  
  const response = await skillPromise;
  expect(response.status()).toBe(200);
  
  await this.page.evaluate(() => document.querySelector('[data-testid="next-step-button"]')?.scrollIntoView());
  await this.clickElement('[data-testid="next-step-button"]');
});

// Equipment Step
When('I choose equipment', async function () {
  await this.waitForElement('[data-testid="equipment-step"]');
  
  // Select equipment from mustering out benefits
  const equipmentOptions = await this.page.locator('[data-testid^="equipment-option-"]');
  const equipmentCount = await equipmentOptions.count();
  
  if (equipmentCount > 0) {
    // Select some equipment
    const maxEquipment = Math.min(equipmentCount, 3);
    
    for (let i = 0; i < maxEquipment; i++) {
      await equipmentOptions.nth(i).click();
    }
    
    const equipmentPromise = this.waitForAPIResponse('characters/add-equipment', 'POST');
    await this.clickElement('[data-testid="confirm-equipment-button"]');
    
    const response = await equipmentPromise;
    expect(response.status()).toBe(200);
  }
  
  await this.clickElement('[data-testid="next-step-button"]');
});

When('I choose equipment on mobile', async function () {
  await this.waitForElement('[data-testid="equipment-step"]');
  
  const equipmentOptions = await this.page.locator('[data-testid^="equipment-option-"]');
  const equipmentCount = await equipmentOptions.count();
  
  if (equipmentCount > 0) {
    const maxEquipment = Math.min(equipmentCount, 3);
    
    for (let i = 0; i < maxEquipment; i++) {
      await equipmentOptions.nth(i).scrollIntoViewIfNeeded();
      await equipmentOptions.nth(i).click();
    }
    
    await this.page.evaluate(() => document.querySelector('[data-testid="confirm-equipment-button"]')?.scrollIntoView());
    
    const equipmentPromise = this.waitForAPIResponse('characters/add-equipment', 'POST');
    await this.clickElement('[data-testid="confirm-equipment-button"]');
    
    const response = await equipmentPromise;
    expect(response.status()).toBe(200);
  }
  
  await this.page.evaluate(() => document.querySelector('[data-testid="next-step-button"]')?.scrollIntoView());
  await this.clickElement('[data-testid="next-step-button"]');
});

// Portrait Step
When('I add a portrait', async function () {
  await this.waitForElement('[data-testid="portrait-step"]');
  
  // Skip portrait for now (optional step)
  await this.clickElement('[data-testid="skip-portrait-button"]');
});

When('I add a portrait on mobile', async function () {
  await this.waitForElement('[data-testid="portrait-step"]');
  
  await this.page.evaluate(() => document.querySelector('[data-testid="skip-portrait-button"]')?.scrollIntoView());
  await this.clickElement('[data-testid="skip-portrait-button"]');
});

// Review Step
When('I review and confirm the character', async function () {
  await this.waitForElement('[data-testid="review-step"]');
  
  // Verify character data is displayed
  await this.waitForElement('[data-testid="character-summary"]');
  
  // Confirm character creation
  const createPromise = this.waitForAPIResponse('characters', 'POST');
  await this.clickElement('[data-testid="create-character-button"]');
  
  const response = await createPromise;
  expect(response.status()).toBe(201);
  
  const characterData = await response.json();
  this.storeTestData('createdCharacter', characterData);
});

When('I review and confirm the character on mobile', async function () {
  await this.waitForElement('[data-testid="review-step"]');
  
  await this.waitForElement('[data-testid="character-summary"]');
  
  await this.page.evaluate(() => document.querySelector('[data-testid="create-character-button"]')?.scrollIntoView());
  
  const createPromise = this.waitForAPIResponse('characters', 'POST');
  await this.clickElement('[data-testid="create-character-button"]');
  
  const response = await createPromise;
  expect(response.status()).toBe(201);
  
  const characterData = await response.json();
  this.storeTestData('createdCharacter', characterData);
});

// Success validation
Then('my character should be created successfully', async function () {
  await this.waitForElement('[data-testid="character-creation-success"]');
  
  const createdCharacter = this.getTestData('createdCharacter');
  expect(createdCharacter).toBeTruthy();
  expect(createdCharacter.id).toBeTruthy();
});

Then('my character should be created successfully on mobile', async function () {
  await this.waitForElement('[data-testid="character-creation-success"]');
  
  const createdCharacter = this.getTestData('createdCharacter');
  expect(createdCharacter).toBeTruthy();
  expect(createdCharacter.id).toBeTruthy();
});

Then('the character should be saved to the database', async function () {
  const createdCharacter = this.getTestData('createdCharacter');
  const token = this.getTestData('authToken');
  
  // Verify character exists in database
  const response = await this.page.request.get(`${this.config.apiURL}/characters/${createdCharacter.id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  expect(response.status()).toBe(200);
  
  const characterData = await response.json();
  expect(characterData.id).toBe(createdCharacter.id);
});

Then('I should see the character in my character list', async function () {
  await this.navigateTo('/characters');
  await this.waitForElement('[data-testid="character-list"]');
  
  const createdCharacter = this.getTestData('createdCharacter');
  const characterElement = await this.waitForElement(`[data-testid="character-${createdCharacter.id}"]`);
  
  expect(characterElement).toBeTruthy();
});

Then('I should see the character in my character list on mobile', async function () {
  await this.navigateTo('/characters');
  await this.waitForElement('[data-testid="character-list"]');
  
  const createdCharacter = this.getTestData('createdCharacter');
  const characterElement = await this.waitForElement(`[data-testid="character-${createdCharacter.id}"]`);
  
  expect(characterElement).toBeTruthy();
});

// API character creation
Given('I have valid character creation data', async function () {
  const characterData = this.generateTestCharacter();
  
  this.storeTestData('characterCreationData', {
    name: characterData.name,
    age: characterData.age,
    gender: characterData.gender,
    race: characterData.race,
    background: characterData.background
  });
});

When('I make a character creation request to the API', async function () {
  const characterData = this.getTestData('characterCreationData');
  const token = this.getTestData('authToken');
  
  const response = await this.page.request.post(`${this.config.apiURL}/characters`, {
    data: characterData,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  this.storeTestData('apiCharacterResponse', response);
});

Then('the API should return the created character', async function () {
  const response = this.getTestData('apiCharacterResponse');
  expect(response.status()).toBe(201);
  
  const characterData = await response.json();
  expect(characterData).toHaveProperty('id');
  expect(characterData).toHaveProperty('name');
  
  this.storeTestData('apiCreatedCharacter', characterData);
});

Then('the character should be persisted in the database', async function () {
  const character = this.getTestData('apiCreatedCharacter');
  const token = this.getTestData('authToken');
  
  const response = await this.page.request.get(`${this.config.apiURL}/characters/${character.id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  expect(response.status()).toBe(200);
  
  const persistedCharacter = await response.json();
  expect(persistedCharacter.id).toBe(character.id);
  expect(persistedCharacter.name).toBe(character.name);
});

Then('the character should have all required fields', async function () {
  const character = this.getTestData('apiCreatedCharacter');
  
  expect(character).toHaveProperty('id');
  expect(character).toHaveProperty('name');
  expect(character).toHaveProperty('age');
  expect(character).toHaveProperty('race');
  expect(character).toHaveProperty('characteristics');
  expect(character.characteristics).toHaveLength(6); // STR, DEX, END, INT, EDU, SOC
});