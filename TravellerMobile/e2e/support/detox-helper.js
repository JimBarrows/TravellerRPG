const { element, by, waitFor, expect } = require('detox');

class DetoxHelper {
  // Element interaction helpers
  static async tapElement(elementId) {
    const el = element(by.id(elementId));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await el.tap();
  }

  static async tapElementByText(text) {
    const el = element(by.text(text));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await el.tap();
  }

  static async typeText(elementId, text) {
    const el = element(by.id(elementId));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await el.typeText(text);
  }

  static async clearAndType(elementId, text) {
    const el = element(by.id(elementId));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await el.clearText();
    await el.typeText(text);
  }

  // Gesture helpers
  static async swipeLeft(elementId) {
    const el = element(by.id(elementId));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await el.swipe('left');
  }

  static async swipeRight(elementId) {
    const el = element(by.id(elementId));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await el.swipe('right');
  }

  static async swipeUp(elementId) {
    const el = element(by.id(elementId));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await el.swipe('up');
  }

  static async swipeDown(elementId) {
    const el = element(by.id(elementId));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await el.swipe('down');
  }

  static async longPress(elementId, duration = 1000) {
    const el = element(by.id(elementId));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await el.longPress(duration);
  }

  // Scroll helpers
  static async scrollToElement(
    scrollElementId,
    targetElementId,
    direction = 'down',
  ) {
    const scrollElement = element(by.id(scrollElementId));
    const targetElement = element(by.id(targetElementId));

    await waitFor(targetElement)
      .toBeVisible()
      .whileElement(scrollElement)
      .scroll(200, direction);
  }

  static async scrollToText(scrollElementId, text, direction = 'down') {
    const scrollElement = element(by.id(scrollElementId));
    const targetElement = element(by.text(text));

    await waitFor(targetElement)
      .toBeVisible()
      .whileElement(scrollElement)
      .scroll(200, direction);
  }

  // Assertion helpers
  static async expectElementVisible(elementId) {
    const el = element(by.id(elementId));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await expect(el).toBeVisible();
  }

  static async expectElementNotVisible(elementId) {
    const el = element(by.id(elementId));
    await expect(el).not.toBeVisible();
  }

  static async expectTextVisible(text) {
    const el = element(by.text(text));
    await waitFor(el).toBeVisible().withTimeout(10000);
    await expect(el).toBeVisible();
  }

  static async expectTextNotVisible(text) {
    const el = element(by.text(text));
    await expect(el).not.toBeVisible();
  }

  // Wait helpers
  static async waitForElement(elementId, timeout = 10000) {
    const el = element(by.id(elementId));
    await waitFor(el).toBeVisible().withTimeout(timeout);
  }

  static async waitForText(text, timeout = 10000) {
    const el = element(by.text(text));
    await waitFor(el).toBeVisible().withTimeout(timeout);
  }

  static async waitForElementToDisappear(elementId, timeout = 10000) {
    const el = element(by.id(elementId));
    await waitFor(el).not.toBeVisible().withTimeout(timeout);
  }

  // Device helpers
  static async shake() {
    await device.shake();
  }

  static async reloadReactNative() {
    await device.reloadReactNative();
  }

  static async enableSynchronization() {
    await device.enableSynchronization();
  }

  static async disableSynchronization() {
    await device.disableSynchronization();
  }

  static async sendToHome() {
    await device.sendToHome();
  }

  static async launchApp() {
    await device.launchApp({ newInstance: true });
  }

  static async terminateApp() {
    await device.terminateApp();
  }
}

module.exports = DetoxHelper;
