const reporter = require('cucumber-html-reporter');
const fs = require('fs');
const path = require('path');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const options = {
  theme: 'bootstrap',
  jsonFile: 'e2e/reports/cucumber-report.json',
  output: 'e2e/reports/cucumber-report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    'App Version': require('../../package.json').version,
    'Test Environment': process.env.NODE_ENV || 'development',
    Platform: process.platform,
    Executed: new Date().toISOString(),
  },
};

try {
  reporter.generate(options);
  console.log('✅ Cucumber HTML report generated successfully!');
  console.log(`📊 Report location: ${path.resolve(options.output)}`);
} catch (error) {
  console.error('❌ Error generating report:', error.message);
  process.exit(1);
}
