import { setWorldConstructor } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';

class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testData = {};
  }

  async openBrowser() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async closeBrowser() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(CustomWorld);