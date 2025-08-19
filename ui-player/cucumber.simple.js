export default {
  paths: ['features/simple.feature'],
  import: ['src/test/minimal-setup.js', 'src/test/steps/simple.steps.js'],
  format: ['progress'],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  publishQuiet: true
};