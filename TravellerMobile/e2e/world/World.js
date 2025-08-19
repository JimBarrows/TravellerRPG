const { setWorldConstructor, Before, After } = require('@cucumber/cucumber');
const { device } = require('detox');

class TravellerWorld {
  constructor() {
    this.device = device;
    this.testData = {};
    this.screenshots = [];
  }

  async takeScreenshot(name) {
    const timestamp = new Date().getTime();
    const screenshotPath = `e2e/screenshots/${name}-${timestamp}.png`;
    await this.device.takeScreenshot(screenshotPath);
    this.screenshots.push(screenshotPath);
    return screenshotPath;
  }

  setTestData(key, value) {
    this.testData[key] = value;
  }

  getTestData(key) {
    return this.testData[key];
  }

  async waitForElement(element, timeout = 10000) {
    await waitFor(element).toBeVisible().withTimeout(timeout);
  }

  async scrollUntilVisible(scrollElement, targetElement, direction = 'down', speed = 'fast') {
    await waitFor(targetElement)
      .toBeVisible()
      .whileElement(by.id(scrollElement))
      .scroll(200, direction, NaN, speed);
  }
}

setWorldConstructor(TravellerWorld);

Before(async function() {
  // Setup before each scenario
  await device.reloadReactNative();
});

After(async function(scenario) {
  // Take screenshot if scenario failed
  if (scenario.result.status === 'failed') {
    await this.takeScreenshot(`failed-${scenario.pickle.name.replace(/\s+/g, '-')}`);
  }
  
  // Clean up test data
  this.testData = {};
});