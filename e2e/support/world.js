import { World, setWorldConstructor } from "@cucumber/cucumber";
import { devices } from "@playwright/test";

class CustomWorld extends World {
  constructor(options) {
    super(options);

    // Test configuration
    this.config = {
      baseURL: process.env.BASE_URL || "http://localhost:5173",
      apiURL: process.env.API_URL || "http://localhost:8080",
      timeout: 60000,
      headless: process.env.HEADLESS !== "false",
      slowMo: parseInt(process.env.SLOW_MO) || 0,
    };

    // Test data storage
    this.testData = {};
    this.users = {};
    this.characters = {};
    this.sessions = {};

    // Browser instances (set in hooks)
    this.browser = null;
    this.context = null;
    this.page = null;
    this.contextId = null;
    this.scenario = null;
  }

  /**
   * Determine browser type from scenario tags
   */
  getBrowserType(tags) {
    const tagNames = tags.map((tag) => tag.name);

    if (tagNames.includes("@firefox")) return "firefox";
    if (tagNames.includes("@webkit") || tagNames.includes("@safari"))
      return "webkit";

    return "chromium"; // default
  }

  /**
   * Get context options based on scenario tags
   */
  getContextOptions(tags) {
    const tagNames = tags.map((tag) => tag.name);
    let options = {
      baseURL: this.config.baseURL,
      ignoreHTTPSErrors: true,
      acceptDownloads: true,
    };

    // Mobile device emulation
    if (tagNames.includes("@mobile")) {
      if (tagNames.includes("@iphone")) {
        options = { ...options, ...devices["iPhone 12"] };
      } else if (tagNames.includes("@android")) {
        options = { ...options, ...devices["Pixel 5"] };
      } else {
        options = { ...options, ...devices["Pixel 5"] }; // default mobile
      }
    }

    // Tablet emulation
    if (tagNames.includes("@tablet")) {
      options = { ...options, ...devices["iPad Pro"] };
    }

    // Desktop viewport
    if (
      tagNames.includes("@desktop") ||
      (!tagNames.includes("@mobile") && !tagNames.includes("@tablet"))
    ) {
      options.viewport = { width: 1280, height: 720 };
    }

    // High DPI
    if (tagNames.includes("@retina")) {
      options.deviceScaleFactor = 2;
    }

    return options;
  }

  /**
   * Navigate to a page with retry logic
   */
  async navigateTo(url, options = {}) {
    const fullUrl = url.startsWith("http")
      ? url
      : `${this.config.baseURL}${url}`;

    try {
      await this.page.goto(fullUrl, {
        waitUntil: "networkidle",
        timeout: this.config.timeout,
        ...options,
      });
    } catch (error) {
      console.warn(`Navigation to ${fullUrl} failed, retrying...`);
      await this.page.goto(fullUrl, {
        waitUntil: "domcontentloaded",
        timeout: this.config.timeout,
        ...options,
      });
    }
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(urlPattern, method = "POST") {
    return this.page.waitForResponse(
      (response) =>
        response.url().includes(urlPattern) &&
        response.request().method() === method,
    );
  }

  /**
   * Generate test user data
   */
  generateTestUser(overrides = {}) {
    const timestamp = Date.now();
    return {
      email: `test.user.${timestamp}@example.com`,
      password: "TestPass123!",
      username: `testuser${timestamp}`,
      firstName: "Test",
      lastName: "User",
      ...overrides,
    };
  }

  /**
   * Generate test character data
   */
  generateTestCharacter(overrides = {}) {
    const names = ["Marcus", "Elena", "Zara", "Kai", "Nova", "Rex"];
    const randomName = names[Math.floor(Math.random() * names.length)];

    return {
      name: `${randomName} TestChar`,
      age: 25 + Math.floor(Math.random() * 15),
      gender: Math.random() > 0.5 ? "Male" : "Female",
      race: "HUMAN",
      background: "Test character for E2E testing",
      ...overrides,
    };
  }

  /**
   * Store test data for cleanup
   */
  storeTestData(key, value) {
    this.testData[key] = value;
  }

  /**
   * Get stored test data
   */
  getTestData(key) {
    return this.testData[key];
  }

  /**
   * Clear test data
   */
  clearTestData() {
    this.testData = {};
    this.users = {};
    this.characters = {};
    this.sessions = {};
  }

  /**
   * Take screenshot with custom name
   */
  async takeScreenshot(name = "screenshot") {
    const sanitizedName = name.replace(/[^a-z0-9]/gi, "_");
    const screenshot = await this.page.screenshot({
      path: `e2e-results/screenshots/${sanitizedName}_${Date.now()}.png`,
      fullPage: true,
    });
    this.attach(screenshot, "image/png");
    return screenshot;
  }

  /**
   * Wait for element with enhanced options
   */
  async waitForElement(selector, options = {}) {
    return this.page.waitForSelector(selector, {
      timeout: this.config.timeout,
      state: "visible",
      ...options,
    });
  }

  /**
   * Fill form field with validation
   */
  async fillField(selector, value, options = {}) {
    const element = await this.waitForElement(selector);
    await element.clear();
    await element.fill(value, options);

    // Verify the value was set
    const actualValue = await element.inputValue();
    if (actualValue !== value) {
      throw new Error(
        `Failed to set field value. Expected: ${value}, Actual: ${actualValue}`,
      );
    }
  }

  /**
   * Click with wait and verification
   */
  async clickElement(selector, options = {}) {
    const element = await this.waitForElement(selector);
    await element.click(options);

    // Wait for any immediate DOM changes
    await this.page.waitForTimeout(100);
  }
}

setWorldConstructor(CustomWorld);
