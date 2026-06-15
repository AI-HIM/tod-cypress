import './commands';
import 'cypress-mochawesome-reporter/register';
import '@cypress/grep';

Cypress.on('uncaught:exception', (err) => {
  // Next.js throws NEXT_REDIRECT internally for server-side redirects — not an app error.
  if (err.message.includes('NEXT_REDIRECT')) return false;

  // Other SPA-level noise that is not a test failure
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
