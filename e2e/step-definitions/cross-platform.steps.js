import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

// Cross-platform setup
Given("the application is running on multiple platforms", async function () {
  // Verify web platform availability
  await this.navigateTo("/");
  await this.waitForElement("body", { state: "visible" });

  // Store platform information
  const userAgent = await this.page.evaluate(() => navigator.userAgent);
  const viewport = this.page.viewportSize();

  this.storeTestData("platformInfo", {
    userAgent,
    viewport,
    platform: this.getBrowserType(this.scenario.pickle.tags),
    isMobile: viewport.width < 768,
  });

  console.log("Platform info:", this.getTestData("platformInfo"));
});

Given(
  "I am logged in with the same account on all platforms",
  async function () {
    // Create a test user if not exists
    let testUser = this.getTestData("crossPlatformUser");

    if (!testUser) {
      testUser = this.generateTestUser({
        email: "cross.platform.user@test.com",
        username: "crossplatformuser",
      });

      // Register and verify user
      const registrationResponse = await this.page.request.post(
        `${this.config.apiURL}/auth/register`,
        {
          data: {
            email: testUser.email,
            password: testUser.password,
            firstName: testUser.firstName,
            lastName: testUser.lastName,
            username: testUser.username,
          },
        },
      );

      const registrationData = await registrationResponse.json();

      await this.page.request.post(`${this.config.apiURL}/auth/verify`, {
        data: { token: registrationData.verificationToken },
      });

      this.storeTestData("crossPlatformUser", testUser);
    }

    // Login on current platform
    await this.navigateTo("/login");
    await this.fillField('[data-testid="login-email"]', testUser.email);
    await this.fillField('[data-testid="login-password"]', testUser.password);

    const loginPromise = this.waitForAPIResponse("auth/login", "POST");
    await this.clickElement('[data-testid="login-button"]');

    const loginResponse = await loginPromise;
    const loginData = await loginResponse.json();

    this.storeTestData("authToken", loginData.token);
    this.storeTestData("sessionActive", true);
  },
);

// Character synchronization
Given("I create a character on desktop web", async function () {
  // Ensure we're testing desktop behavior
  const platformInfo = this.getTestData("platformInfo");
  if (platformInfo.isMobile) {
    // Switch context for desktop testing
    await this.context.setViewportSize({ width: 1280, height: 720 });
  }

  // Navigate to character creation
  await this.navigateTo("/characters/create");
  await this.waitForElement('[data-testid="character-creation-wizard"]');

  // Create character through wizard
  const characterData = this.generateTestCharacter({
    name: "Cross-Platform Test Character",
  });

  // Basic info step
  await this.waitForElement('[data-testid="basic-info-step"]');
  await this.fillField(
    '[data-testid="character-name-input"]',
    characterData.name,
  );
  await this.fillField(
    '[data-testid="character-age-input"]',
    characterData.age.toString(),
  );
  await this.clickElement('[data-testid="gender-select"]');
  await this.clickElement(
    `[data-testid="gender-option-${characterData.gender.toLowerCase()}"]`,
  );
  await this.clickElement('[data-testid="race-select"]');
  await this.clickElement('[data-testid="race-option-human"]');
  await this.clickElement('[data-testid="next-step-button"]');

  // Quick completion of remaining steps
  await this.waitForElement('[data-testid="characteristics-step"]');
  await this.clickElement('[data-testid="roll-characteristics-button"]');
  await this.waitForElement('[data-testid="characteristic-strength"]');
  await this.clickElement('[data-testid="next-step-button"]');

  // Skip optional steps and create character
  await this.waitForElement('[data-testid="homeworld-step"]');
  await this.clickElement('[data-testid="skip-homeworld-button"]');

  await this.waitForElement('[data-testid="career-step"]');
  await this.clickElement('[data-testid="skip-career-button"]');

  await this.waitForElement('[data-testid="review-step"]');

  const createPromise = this.waitForAPIResponse("characters", "POST");
  await this.clickElement('[data-testid="create-character-button"]');

  const response = await createPromise;
  const createdCharacter = await response.json();

  this.storeTestData("crossPlatformCharacter", createdCharacter);

  console.log("Created character on desktop:", createdCharacter.name);
});

Given("the character is saved successfully", async function () {
  const character = this.getTestData("crossPlatformCharacter");
  expect(character).toBeTruthy();
  expect(character.id).toBeTruthy();

  // Verify character exists via API
  const token = this.getTestData("authToken");
  const response = await this.page.request.get(
    `${this.config.apiURL}/characters/${character.id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  expect(response.status()).toBe(200);
});

When("I access the mobile web platform", async function () {
  // Switch to mobile viewport
  await this.context.setViewportSize({ width: 375, height: 812 }); // iPhone 12 size

  // Update platform info
  const platformInfo = this.getTestData("platformInfo");
  platformInfo.viewport = { width: 375, height: 812 };
  platformInfo.isMobile = true;
  this.storeTestData("platformInfo", platformInfo);

  // Navigate to character list to verify mobile interface
  await this.navigateTo("/characters");
  await this.waitForElement('[data-testid="character-list"]');

  console.log("Switched to mobile platform");
});

Then("the character should appear in my character list", async function () {
  await this.waitForElement('[data-testid="character-list"]');

  const character = this.getTestData("crossPlatformCharacter");
  const characterElement = await this.waitForElement(
    `[data-testid="character-${character.id}"]`,
  );

  expect(characterElement).toBeTruthy();

  // Verify character name is displayed
  const characterName = await this.page.textContent(
    `[data-testid="character-${character.id}"] [data-testid="character-name"]`,
  );
  expect(characterName).toContain(character.name);
});

Then("all character details should be identical", async function () {
  const originalCharacter = this.getTestData("crossPlatformCharacter");

  // Click on character to view details
  await this.clickElement(`[data-testid="character-${originalCharacter.id}"]`);
  await this.waitForElement('[data-testid="character-sheet"]');

  // Verify character details match
  const displayedName = await this.page.textContent(
    '[data-testid="character-name-display"]',
  );
  expect(displayedName).toBe(originalCharacter.name);

  const displayedAge = await this.page.textContent(
    '[data-testid="character-age-display"]',
  );
  expect(displayedAge).toContain(originalCharacter.age.toString());

  // Verify characteristics are present
  const characteristics = await this.page.locator(
    '[data-testid^="characteristic-"]',
  );
  const characteristicCount = await characteristics.count();
  expect(characteristicCount).toBe(6); // STR, DEX, END, INT, EDU, SOC
});

When("I edit the character on mobile", async function () {
  // Ensure we're on character sheet
  await this.waitForElement('[data-testid="character-sheet"]');

  // Enter edit mode (mobile-specific interaction)
  await this.page.evaluate(() =>
    document
      .querySelector('[data-testid="edit-character-button"]')
      ?.scrollIntoView(),
  );
  await this.clickElement('[data-testid="edit-character-button"]');

  // Edit character name
  const originalCharacter = this.getTestData("crossPlatformCharacter");
  const updatedName = `${originalCharacter.name} - Mobile Edit`;

  await this.page.evaluate(() =>
    document
      .querySelector('[data-testid="edit-character-name"]')
      ?.scrollIntoView(),
  );
  await this.fillField('[data-testid="edit-character-name"]', updatedName);

  // Save changes
  await this.page.evaluate(() =>
    document
      .querySelector('[data-testid="save-character-button"]')
      ?.scrollIntoView(),
  );

  const savePromise = this.waitForAPIResponse("characters", "PUT");
  await this.clickElement('[data-testid="save-character-button"]');

  const saveResponse = await savePromise;
  expect(saveResponse.status()).toBe(200);

  // Store updated character data
  const updatedCharacter = { ...originalCharacter, name: updatedName };
  this.storeTestData("crossPlatformCharacter", updatedCharacter);

  console.log("Character edited on mobile:", updatedName);
});

Then(
  "the changes should sync to desktop within {int} seconds",
  async function (maxSeconds) {
    const startTime = Date.now();
    const updatedCharacter = this.getTestData("crossPlatformCharacter");

    // Switch back to desktop viewport
    await this.context.setViewportSize({ width: 1280, height: 720 });

    // Navigate to character list to verify sync
    await this.navigateTo("/characters");
    await this.waitForElement('[data-testid="character-list"]');

    // Wait for updated name to appear with timeout
    let syncCompleted = false;

    while (!syncCompleted && Date.now() - startTime < maxSeconds * 1000) {
      await this.page.reload();
      await this.waitForElement('[data-testid="character-list"]');

      try {
        const characterName = await this.page.textContent(
          `[data-testid="character-${updatedCharacter.id}"] [data-testid="character-name"]`,
          { timeout: 2000 },
        );

        if (characterName && characterName.includes("Mobile Edit")) {
          syncCompleted = true;
          break;
        }
      } catch (error) {
        // Continue waiting
      }

      await this.page.waitForTimeout(1000);
    }

    expect(syncCompleted).toBe(true);

    const syncTime = (Date.now() - startTime) / 1000;
    console.log(`Sync completed in ${syncTime} seconds`);

    expect(syncTime).toBeLessThanOrEqual(maxSeconds);
  },
);

// Campaign synchronization
Given("I join a campaign on desktop", async function () {
  // Switch to desktop viewport
  await this.context.setViewportSize({ width: 1280, height: 720 });

  const testUser = this.getTestData("crossPlatformUser");
  const character = this.getTestData("crossPlatformCharacter");

  // Create a test campaign first (as GM)
  const campaignData = {
    name: "Cross-Platform Test Campaign",
    description: "Campaign for testing cross-platform sync",
    maxPlayers: 4,
    isPublic: false,
  };

  const createCampaignResponse = await this.page.request.post(
    `${this.config.apiURL}/campaigns`,
    {
      data: campaignData,
      headers: {
        Authorization: `Bearer ${this.getTestData("authToken")}`,
        "Content-Type": "application/json",
      },
    },
  );

  const campaign = await createCampaignResponse.json();
  this.storeTestData("testCampaign", campaign);

  // Navigate to campaigns page and join
  await this.navigateTo("/campaigns");
  await this.waitForElement('[data-testid="campaigns-list"]');

  // Join the campaign with our character
  await this.clickElement(`[data-testid="campaign-${campaign.id}"]`);
  await this.waitForElement('[data-testid="campaign-details"]');

  await this.clickElement('[data-testid="join-campaign-button"]');
  await this.waitForElement('[data-testid="character-selection"]');

  await this.clickElement(`[data-testid="select-character-${character.id}"]`);

  const joinPromise = this.waitForAPIResponse("campaigns/join", "POST");
  await this.clickElement('[data-testid="confirm-join-button"]');

  const joinResponse = await joinPromise;
  expect(joinResponse.status()).toBe(200);

  console.log("Joined campaign on desktop:", campaign.name);
});

When("I access the same campaign on mobile", async function () {
  // Switch to mobile viewport
  await this.context.setViewportSize({ width: 375, height: 812 });

  // Navigate to campaigns
  await this.navigateTo("/campaigns");
  await this.waitForElement('[data-testid="campaigns-list"]');

  // Access the test campaign
  const campaign = this.getTestData("testCampaign");

  // Mobile-specific navigation
  await this.page.evaluate((campaignId) => {
    document
      .querySelector(`[data-testid="campaign-${campaignId}"]`)
      ?.scrollIntoView();
  }, campaign.id);

  await this.clickElement(`[data-testid="campaign-${campaign.id}"]`);
  await this.waitForElement('[data-testid="campaign-details"]');
});

Then("all campaign information should be synchronized", async function () {
  const campaign = this.getTestData("testCampaign");

  // Verify campaign details are displayed correctly
  const campaignName = await this.page.textContent(
    '[data-testid="campaign-name"]',
  );
  expect(campaignName).toBe(campaign.name);

  const campaignDescription = await this.page.textContent(
    '[data-testid="campaign-description"]',
  );
  expect(campaignDescription).toBe(campaign.description);
});

Then("my participation status should be consistent", async function () {
  // Check that I'm listed as a participant
  await this.waitForElement('[data-testid="campaign-participants"]');

  const testUser = this.getTestData("crossPlatformUser");
  const participantElement = await this.waitForElement(
    `[data-testid="participant-${testUser.username}"]`,
  );

  expect(participantElement).toBeTruthy();

  // Verify I can access campaign features
  const joinButtonVisible = await this.page
    .locator('[data-testid="join-campaign-button"]')
    .isVisible()
    .catch(() => false);
  expect(joinButtonVisible).toBe(false); // Should not be visible since already joined

  const leaveButtonVisible = await this.page
    .locator('[data-testid="leave-campaign-button"]')
    .isVisible()
    .catch(() => false);
  expect(leaveButtonVisible).toBe(true); // Should be visible for participants
});

// Real-time synchronization
When("another player makes changes that affect me", async function () {
  // Simulate another player's action via API
  const campaign = this.getTestData("testCampaign");
  const testUser = this.getTestData("crossPlatformUser");

  // Create another user and have them join the campaign
  const otherUser = this.generateTestUser({
    email: "other.player@test.com",
    username: "otherplayer",
  });

  // Register other user
  const registrationResponse = await this.page.request.post(
    `${this.config.apiURL}/auth/register`,
    {
      data: {
        email: otherUser.email,
        password: otherUser.password,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        username: otherUser.username,
      },
    },
  );

  const registrationData = await registrationResponse.json();

  await this.page.request.post(`${this.config.apiURL}/auth/verify`, {
    data: { token: registrationData.verificationToken },
  });

  // Login as other user
  const loginResponse = await this.page.request.post(
    `${this.config.apiURL}/auth/login`,
    {
      data: {
        email: otherUser.email,
        password: otherUser.password,
      },
    },
  );

  const loginData = await loginResponse.json();

  // Other player sends a message to the campaign
  const messageResponse = await this.page.request.post(
    `${this.config.apiURL}/campaigns/${campaign.id}/messages`,
    {
      data: {
        message: "Hello from another player!",
        type: "CHAT",
      },
      headers: {
        Authorization: `Bearer ${loginData.token}`,
        "Content-Type": "application/json",
      },
    },
  );

  expect(messageResponse.status()).toBe(201);

  this.storeTestData("otherPlayerMessage", "Hello from another player!");

  console.log("Other player sent message to campaign");
});

Given("I'm simultaneously viewing on mobile", async function () {
  // Ensure mobile viewport is active
  await this.context.setViewportSize({ width: 375, height: 812 });

  // Navigate to campaign chat/activity area
  const campaign = this.getTestData("testCampaign");
  await this.navigateTo(`/campaigns/${campaign.id}/session`);
  await this.waitForElement('[data-testid="campaign-session"]');

  console.log("Viewing campaign session on mobile");
});

Then("both platforms should receive updates immediately", async function () {
  const expectedMessage = this.getTestData("otherPlayerMessage");

  // Wait for real-time update (message should appear)
  await this.waitForElement('[data-testid="campaign-messages"]');

  // Check for the message with a reasonable timeout
  const messageElement = await this.page.waitForSelector(
    `[data-testid="message"]:has-text("${expectedMessage}")`,
    { timeout: 10000 },
  );

  expect(messageElement).toBeTruthy();

  console.log("Real-time update received on mobile");
});

Then("the state should be consistent across devices", async function () {
  // Verify that both platforms show the same state
  const campaign = this.getTestData("testCampaign");

  // Check participant count
  const participantElements = await this.page.locator(
    '[data-testid^="participant-"]',
  );
  const participantCount = await participantElements.count();

  expect(participantCount).toBeGreaterThan(1); // Should include original user + other player

  // Verify message history is consistent
  const messageElements = await this.page.locator('[data-testid="message"]');
  const messageCount = await messageElements.count();

  expect(messageCount).toBeGreaterThan(0);

  console.log("State consistency verified across platforms");
});
