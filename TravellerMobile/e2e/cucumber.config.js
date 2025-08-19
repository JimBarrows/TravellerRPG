module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      'e2e/support/**/*.js',
      'e2e/step-definitions/**/*.js',
      'e2e/world/**/*.js'
    ],
    format: [
      '@cucumber/pretty-formatter',
      'json:e2e/reports/cucumber-report.json',
      'html:e2e/reports/cucumber-report.html'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    parallel: 1,
    timeout: 120000,
    worldParameters: {
      detoxLaunchTimeout: 120000
    }
  }
};