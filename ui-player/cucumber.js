export default {
  paths: ['../features/**/*.feature'],
  import: ['../features/**/*.js'],
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