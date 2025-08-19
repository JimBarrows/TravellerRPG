export default {
  paths: ['features/auth/**/*.feature'],
  import: ['src/test/enhanced-setup.js', 'src/test/steps/auth-business-logic.steps.js'],
  format: [
    'progress',
    'json:test-results/cucumber-report.json',
    'html:test-results/cucumber-report.html'
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  publishQuiet: true
};