const config = {
  // Feature files paths
  paths: ["e2e/features/**/*.feature"],

  // Step definitions paths
  import: ["e2e/support/setup.js", "e2e/step-definitions/**/*.js"],

  // Formatters
  format: [
    "progress",
    "json:e2e-results/cucumber-report.json",
    "html:e2e-results/cucumber-report.html",
    "@cucumber/pretty-formatter",
  ],

  // Format options
  formatOptions: {
    snippetInterface: "async-await",
    snippetSyntax: "javascript",
  },

  // Parallel execution
  parallel: process.env.CI ? 1 : 2,

  // Retry failed scenarios
  retry: process.env.CI ? 2 : 0,

  // Tags for filtering tests
  tags: process.env.TAGS || "@smoke or @regression",

  // World parameters
  worldParameters: {
    browsers: ["chromium", "firefox", "webkit"],
    headless: process.env.HEADLESS !== "false",
    baseURL: process.env.BASE_URL || "http://localhost:5173",
    apiURL: process.env.API_URL || "http://localhost:8080",
    slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
    timeout: 60000,
    video: process.env.VIDEO === "true",
    trace: process.env.TRACE === "true",
  },

  // Publish to cucumber reports
  publishQuiet: true,

  // Require modules
  requireModule: ["@babel/register"],
};

export default config;
