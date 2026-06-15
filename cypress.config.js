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

// Credentials are read from the environment only — never hardcoded.
// Locally they come from .env.<TEST_ENV> (gitignored); in CI they come from
// the CYPRESS_USER_EMAIL / CYPRESS_USER_PASSWORD secrets, which Cypress also
// merges into Cypress.env() automatically.
const userEmail = process.env.USER_EMAIL || process.env.CYPRESS_USER_EMAIL;
const userPassword = process.env.USER_PASSWORD || process.env.CYPRESS_USER_PASSWORD;

module.exports = defineConfig({
  projectId: 'irc68t',
  e2e: {
    baseUrl: process.env.BASE_URL || ENV_URLS[testEnv] || ENV_URLS.dev,
    specPattern: 'cypress/e2e/**/*.cy.js',
    excludeSpecPattern: ['cypress/e2e/_discovery/**'],
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
      USER_EMAIL: userEmail,
      USER_PASSWORD: userPassword,
      INVALID_EMAIL: 'invalid@test.com',
      INVALID_PASSWORD: 'WrongPassword123',
      grepFilterSpecs: true,
      grepOmitFiltered: true,
    },

    setupNodeEvents(on, config) {
      // Fail fast with a clear message instead of silently logging in with a
      // wrong/empty credential and producing a confusing downstream failure.
      if (!userEmail || !userPassword) {
        throw new Error(
          'Missing TOD credentials. Set USER_EMAIL and USER_PASSWORD in ' +
            `.env.${testEnv} (local) or the CYPRESS_USER_EMAIL / CYPRESS_USER_PASSWORD ` +
            'secrets (CI). See .env.example.'
        );
      }

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
