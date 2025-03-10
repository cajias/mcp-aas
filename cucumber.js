module.exports = {
  default: {
    paths: ['./e2e/features/**/*.feature'],
    require: [
      './e2e/step_definitions/**/*.js',
      './e2e/support/**/*.js'
    ],
    format: [
      'progress',
      'html:cucumber-report.html'
    ],
    // Increase timeouts
    timeout: 120000 // 2 minutes
  }
};