import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, firefox, webkit } from '@playwright/test';
import { WorldParameters } from './world.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set default timeout for Cucumber steps
setDefaultTimeout(60000);

// Global browser instances
const browsers = new Map();
const contexts = new Map();

BeforeAll(async function() {
  console.log('🚀 Starting E2E test suite...');
  
  // Initialize browsers based on configuration
  const browserTypes = ['chromium', 'firefox', 'webkit'];
  
  for (const browserType of browserTypes) {
    let browser;
    
    switch (browserType) {
      case 'chromium':
        browser = await chromium.launch({
          headless: process.env.HEADLESS !== 'false',
          slowMo: parseInt(process.env.SLOW_MO) || 0,
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        });
        break;
      case 'firefox':
        browser = await firefox.launch({
          headless: process.env.HEADLESS !== 'false',
          slowMo: parseInt(process.env.SLOW_MO) || 0
        });
        break;
      case 'webkit':
        browser = await webkit.launch({
          headless: process.env.HEADLESS !== 'false',
          slowMo: parseInt(process.env.SLOW_MO) || 0
        });
        break;
    }
    
    browsers.set(browserType, browser);
  }
  
  console.log(`✅ Initialized ${browsers.size} browser instances`);
});

Before(async function(scenario) {
  console.log(`🏁 Starting scenario: ${scenario.pickle.name}`);
  
  // Determine browser type from tags or use default
  const browserType = this.getBrowserType(scenario.pickle.tags);
  const browser = browsers.get(browserType);
  
  if (!browser) {
    throw new Error(`Browser ${browserType} not initialized`);
  }
  
  // Create context with appropriate device settings
  const contextOptions = this.getContextOptions(scenario.pickle.tags);
  const context = await browser.newContext(contextOptions);
  
  // Enable tracing if requested
  if (process.env.TRACE === 'true') {
    await context.tracing.start({ screenshots: true, snapshots: true });
  }
  
  // Create page
  const page = await context.newPage();
  
  // Store context and page for cleanup
  const contextId = `${browserType}-${scenario.pickle.id}`;
  contexts.set(contextId, { context, page, tracing: process.env.TRACE === 'true' });
  
  // Attach to world
  this.browser = browser;
  this.context = context;
  this.page = page;
  this.contextId = contextId;
  this.scenario = scenario;
});

After(async function(scenario) {
  const { context, page, tracing } = contexts.get(this.contextId) || {};
  
  if (context && page) {
    // Take screenshot on failure
    if (scenario.result.status === 'FAILED') {
      const screenshot = await page.screenshot({
        path: `e2e-results/screenshots/${scenario.pickle.name.replace(/[^a-z0-9]/gi, '_')}.png`,
        fullPage: true
      });
      this.attach(screenshot, 'image/png');
    }
    
    // Stop tracing if enabled
    if (tracing) {
      await context.tracing.stop({
        path: `e2e-results/traces/${scenario.pickle.name.replace(/[^a-z0-9]/gi, '_')}.zip`
      });
    }
    
    // Close context and page
    await context.close();
    contexts.delete(this.contextId);
  }
  
  console.log(`🏁 Completed scenario: ${scenario.pickle.name} (${scenario.result.status})`);
});

AfterAll(async function() {
  console.log('🧹 Cleaning up browser instances...');
  
  // Close all remaining contexts
  for (const { context } of contexts.values()) {
    await context.close();
  }
  contexts.clear();
  
  // Close all browsers
  for (const browser of browsers.values()) {
    await browser.close();
  }
  browsers.clear();
  
  console.log('✅ E2E test suite completed');
});