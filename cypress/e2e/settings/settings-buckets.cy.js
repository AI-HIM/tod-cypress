/**
 * @module Settings - Buckets
 *
 * Verified live (2026-06-15):
 *  - Page heading: "Buckets" (h1/h2/h3).
 *  - "Create Bucket" button always present.
 *  - Create Bucket dialog fields: #bucket-name (text), #bucket-description (textarea).
 *  - Dialog submit: button:contains("Create").
 *  - Dialog cancel: button:contains("Cancel").
 *  - Dialog close: [data-slot="dialog-close"].
 *
 * CLEANUP: All create tests delete the bucket they created to prevent
 * shared-environment pollution. The delete button selector follows the
 * standard TOD pattern; if it needs refinement, run:
 *   npx cypress run --spec "cypress/e2e/_discovery/discover-buckets.cy.js"
 */

import { SQL_INJECTION, XSS_PROBE, maxLengthString, unique } from '../../support/utils/helpers';

const DIALOG = '[role="dialog"]';

// ─── Helper: create a bucket via the dialog ─────────────────────────────────
function createBucket(name, description) {
  cy.contains('button', 'Create Bucket').click();
  cy.get(DIALOG).should('be.visible');
  cy.get('#bucket-name').should('be.visible').clear().type(name);
  if (description) cy.get('#bucket-description').clear().type(description);
  cy.contains(`${DIALOG} button`, 'Create').click();
  cy.get(DIALOG).should('not.exist');
  cy.get('body').should('contain.text', name);
}

// ─── Helper: delete a named bucket ──────────────────────────────────────────
// Follows the same delete-button → confirm-dialog pattern used across the app.
// Selectors try common patterns; update after running the buckets discovery probe.
function deleteBucket(name) {
  cy.contains(name)
    .closest('li, article, tr, [data-slot="card"], div')
    .find('button[title="Delete"], button[title="Delete bucket"], button[aria-label="Delete"]')
    .first()
    .click({ force: true });
  cy.get(DIALOG, { timeout: 10000 }).should('be.visible');
  cy.contains(`${DIALOG} button`, /delete|confirm/i).last().click();
  cy.get(DIALOG).should('not.exist');
  cy.get('body').should('not.contain.text', name);
}

describe('Settings - Buckets', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/buckets');
    cy.contains('h1, h2, h3', 'Buckets', { timeout: 15000 }).should('be.visible');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read', { tags: ['@smoke'] }, () => {
    it('loads the Buckets page with the correct heading', { tags: ['@smoke', '@critical'] }, () => {
      cy.url().should('include', '/settings/buckets');
      cy.contains('h1, h2, h3', 'Buckets').should('be.visible');
    });

    it('shows the Create Bucket button', { tags: ['@smoke'] }, () => {
      cy.contains('button', 'Create Bucket').should('be.visible');
    });
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  context('Create Bucket', { tags: ['@crud', '@create'] }, () => {
    it('opens the Create Bucket dialog with correct fields', { tags: ['@smoke'] }, () => {
      cy.contains('button', 'Create Bucket').click();
      cy.get(DIALOG).should('be.visible');
      cy.contains(DIALOG, 'Create Bucket').should('be.visible');
      cy.get('#bucket-name').should('be.visible');
    });

    it('creates a bucket with a valid name, then deletes it', { tags: ['@smoke', '@critical'] }, () => {
      const name = unique('BKT');
      createBucket(name);
      deleteBucket(name);
    });

    it('creates a bucket with name and description, then deletes it', { tags: ['@regression'] }, () => {
      const name = unique('BKT');
      createBucket(name, 'Created by automated test');
      deleteBucket(name);
    });

    it('rejects an empty bucket name and keeps the dialog open', { tags: ['@regression', '@validation'] }, () => {
      cy.contains('button', 'Create Bucket').click();
      cy.get('#bucket-name').should('be.visible').and('have.value', '');
      cy.contains(`${DIALOG} button`, 'Create').click();
      cy.get(DIALOG).should('be.visible');
      // Cancel to close dialog cleanly
      cy.contains(`${DIALOG} button`, 'Cancel').click();
      cy.get(DIALOG).should('not.exist');
    });

    it('accepts special characters in bucket name, then deletes', { tags: ['@regression'] }, () => {
      const name = `${unique('BKT')} & Co. #1`;
      createBucket(name);
      deleteBucket(name);
    });

    it('treats an SQL-injection probe as literal bucket name, then deletes', { tags: ['@regression', '@security'] }, () => {
      const name = `${unique('BKT')} ${SQL_INJECTION}`;
      createBucket(name);
      cy.url().should('include', '/settings/buckets');
      deleteBucket(name);
    });

    it('treats an XSS probe as literal bucket name, then deletes', { tags: ['@regression', '@security'] }, () => {
      const name = `${unique('BKT')} ${XSS_PROBE}`;
      cy.on('window:alert', () => { throw new Error('XSS payload executed'); });
      createBucket(name);
      cy.url().should('include', '/settings/buckets');
      deleteBucket(name);
    });

    it('accepts a max-length (100 char) bucket name, then deletes', { tags: ['@regression', '@boundary'] }, () => {
      const name = `${unique('BKT')}_${maxLengthString(100 - 12)}`;
      createBucket(name);
      cy.url().should('include', '/settings/buckets');
      deleteBucket(name);
    });
  });

  // ─── MODAL UX ─────────────────────────────────────────────────────────────

  context('Modal UX', { tags: ['@regression'] }, () => {
    it('closes the Create Bucket dialog via Cancel', { tags: ['@regression'] }, () => {
      cy.contains('button', 'Create Bucket').click();
      cy.get(DIALOG).should('be.visible');
      cy.contains(`${DIALOG} button`, 'Cancel').click();
      cy.get(DIALOG).should('not.exist');
    });

    it('closes the Create Bucket dialog via the × button', { tags: ['@regression'] }, () => {
      cy.contains('button', 'Create Bucket').click();
      cy.get(DIALOG).should('be.visible');
      cy.get('[data-slot="dialog-close"]').click();
      cy.get(DIALOG).should('not.exist');
    });
  });
});
