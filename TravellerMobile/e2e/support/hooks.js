const { BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { device } = require('detox');
const fs = require('fs');
const path = require('path');

BeforeAll(async () => {
  console.log('Starting Detox E2E tests...');

  // Create directories for test artifacts
  const dirs = ['e2e/screenshots', 'e2e/reports'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Initialize Detox
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: 'YES',
      location: 'inuse',
    },
  });
});

AfterAll(async () => {
  console.log('Cleaning up Detox E2E tests...');
  await device.terminateApp();
});
