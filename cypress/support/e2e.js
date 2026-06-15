import './commands';
import 'cypress-mochawesome-reporter/register';
import '@cypress/grep';

Cypress.on('uncaught:exception', (err) => {
  // SPA-level errors that are not test failures
  if (
    err.message.includes('ResizeObserver') ||
    err.message.includes('ChunkLoadError') ||
    err.message.includes('Loading chunk') ||
    err.message.includes('Hydration') ||
    err.message.includes('Non-Error promise rejection')
  ) {
    return false;
  }
  return true;
});

beforeEach(function () {
  cy.task('log', `▶ Starting: ${this.currentTest.fullTitle()}`);
});

afterEach(function () {
  const state = this.currentTest.state;
  const title = this.currentTest.fullTitle();

  if (state === 'failed') {
    cy.task('log', `✗ FAILED: ${title}`);
  } else {
    cy.task('log', `✓ PASSED: ${title}`);
  }
});
