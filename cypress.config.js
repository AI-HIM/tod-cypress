const { defineConfig } = require('cypress');
const { beforeRunHook, afterRunHook } = require('cypress-mochawesome-reporter/lib');
require('dotenv').config({ path: `.env.${process.env.TEST_ENV || 'dev'}` });

const ENV_URLS = {
  local: 'http://localhost:3000',
  dev: 'https://todapp-dev.tynybay.com',
  qa: process.env.QA_BASE_URL || 'https://todapp-qa.tynybay.com',
  staging: process.env.STAGING_BASE_URL || 'https://todapp-staging.tynybay.com',
  uat: process.env.UAT_BASE_URL || 'https://todapp-uat.tynybay.com',
};

const testEnv = process.env.TEST_ENV || 'dev';

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || ENV_URLS[testEnv] || ENV_URLS.dev,
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',

    viewportWidth: 1440,
    viewportHeight: 900,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    execTimeout: 60000,

    retries: {
      runMode: 2,
      openMode: 0,
    },

    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/reports/screenshots',
    videosFolder: 'cypress/reports/videos',
    video: true,

    experimentalWebKitSupport: true,

    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      charts: true,
      reportPageTitle: 'TOD Automation — Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
      reportDir: 'cypress/reports/html',
      overwrite: false,
      html: true,
      json: true,
      jsonDir: 'cypress/reports/json',
    },

    env: {
      TEST_ENV: testEnv,
      BASE_URL: process.env.BASE_URL || ENV_URLS[testEnv] || ENV_URLS.dev,
      USER_EMAIL: process.env.USER_EMAIL || 'sowmyasagar.k@gmail.com',
      USER_PASSWORD: process.env.USER_PASSWORD || 'Password@123',
      INVALID_EMAIL: 'invalid@test.com',
      INVALID_PASSWORD: 'WrongPassword123',
      grepFilterSpecs: true,
      grepOmitFiltered: true,
    },

    setupNodeEvents(on, config) {
      require('@cypress/grep/src/plugin')(config);
      require('cypress-mochawesome-reporter/plugin')(on);

      on('before:run', async (details) => {
        await beforeRunHook(details);
      });

      on('after:run', async () => {
        await afterRunHook();
      });

      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(tableData) {
          console.table(tableData);
          return null;
        },
      });

      config.env.TEST_ENV = testEnv;
      config.baseUrl = process.env.BASE_URL || ENV_URLS[testEnv] || ENV_URLS.dev;
      return config;
    },
  },
});
