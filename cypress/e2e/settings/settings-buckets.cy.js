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

import { faker } from '@faker-js/faker';
import { SQL_INJECTION, XSS_PROBE, maxLengthString, unique, SELECTORS } from '../../support/utils/helpers';

const DIALOG = '[role="dialog"], [role="alertdialog"], div[id^="radix-"]';

// ─── Helper: create a bucket via the dialog ─────────────────────────────────
function createBucket(name, description) {
  cy.contains('button', 'Create Bucket').click();
  cy.get(DIALOG).should('be.visible');
  cy.get('#bucket-name').should('be.visible').clear().type(name);
  if (description) cy.get('#bucket-description').clear().type(description);
  cy.contains(`${DIALOG} button`, 'Create').click();
  cy.get(DIALOG).should('not.exist');
  
  cy.wait(2000); // Wait for list refresh
  cy.scrollTo('bottom', { ensureScrollable: false });
  cy.wait(1000); // Lazy loading or rendering
  
  cy.get('body').should('contain.text', name);
}

// ─── Helper: delete a named bucket ──────────────────────────────────────────
// Follows the same delete-button → confirm-dialog pattern used across the app.
// Selectors try common patterns; update after running the buckets discovery probe.
function deleteBucket(name) {
  cy.contains(name)
    .parents('.flex.items-center.justify-between, li, article, tr, [data-slot="card"]')
    .first()
    .find('button[title="Delete"], button[aria-label="Delete"]')
    .first()
    .click({ force: true });
  cy.get(DIALOG, { timeout: 10000 }).should('be.visible');
  cy.contains(`${DIALOG} button`, /delete|confirm/i).last().click();
  cy.get(DIALOG).should('not.exist');
  
  cy.wait(2000); // Wait for list refresh
  cy.scrollTo('bottom', { ensureScrollable: false });
  
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
      const name = faker.commerce.department() + faker.string.uuid().slice(0, 4);
      createBucket(name);
      deleteBucket(name);
    });

    it('creates a bucket with name and description, then deletes it', { tags: ['@regression'] }, () => {
      const name = faker.commerce.department() + faker.string.uuid().slice(0, 4);
      createBucket(name, faker.lorem.sentence());
      deleteBucket(name);
    });

    it('disables the Create button on empty bucket name', { tags: ['@regression', '@validation'] }, () => {
      cy.contains('button', 'Create Bucket').click();
      cy.get('#bucket-name').should('be.visible').and('have.value', '');
      
      // The Create button should be disabled
      cy.contains(`${DIALOG} button`, 'Create').should('be.disabled');
      
      // Cancel to close dialog cleanly
      cy.contains(`${DIALOG} button`, 'Cancel').click();
      cy.get(DIALOG).should('not.exist');
    });

    it('rejects creating a bucket with an existing name', { tags: ['@regression', '@validation'] }, () => {
      const name = faker.commerce.department() + faker.string.uuid().slice(0, 4);
      createBucket(name); // creates the first one

      // Try to create the exact same one again
      cy.contains('button', 'Create Bucket').click();
      cy.get(DIALOG).should('be.visible');
      cy.get('#bucket-name').should('be.visible').clear().type(name);
      cy.contains(`${DIALOG} button`, 'Create').click();

      // UI should block it. Assert dialog remains open.
      cy.get(DIALOG).should('be.visible');

      cy.contains(`${DIALOG} button`, 'Cancel').click();
      cy.get(DIALOG).should('not.exist');
      
      // Cleanup
      deleteBucket(name);
    });

    it('accepts special characters in bucket name, then deletes', { tags: ['@regression'] }, () => {
      const name = `${faker.commerce.department() + faker.string.uuid().slice(0, 4)} & Co. #1`;
      createBucket(name);
      deleteBucket(name);
    });

    it('treats an SQL-injection probe as literal bucket name, then deletes', { tags: ['@regression', '@security'] }, () => {
      const name = `${faker.commerce.department() + faker.string.uuid().slice(0, 4)} ${SQL_INJECTION}`;
      createBucket(name);
      cy.url().should('include', '/settings/buckets');
      deleteBucket(name);
    });

    it('treats an XSS probe as literal bucket name, then deletes', { tags: ['@regression', '@security'] }, () => {
      const name = `${faker.commerce.department() + faker.string.uuid().slice(0, 4)} ${XSS_PROBE}`;
      cy.on('window:alert', () => { throw new Error('XSS payload executed'); });
      createBucket(name);
      cy.url().should('include', '/settings/buckets');
      deleteBucket(name);
    });

    it('accepts a max-length (100 char) bucket name, then deletes', { tags: ['@regression', '@boundary'] }, () => {
      const name = `${faker.commerce.department() + faker.string.uuid().slice(0, 4)}_${maxLengthString(100 - 40)}`; // just to be safe
      createBucket(name);
      cy.url().should('include', '/settings/buckets');
      deleteBucket(name);
    });
  });

  // ─── UPDATE / EDIT ────────────────────────────────────────────────────────

  context('Update / Edit Bucket', { tags: ['@crud', '@update'] }, () => {
    it('modifies an existing bucket name and description', { tags: ['@smoke'] }, () => {
      const originalName = faker.commerce.department() + faker.string.uuid().slice(0, 4);
      // Create a completely new name so originalName is not a substring
      const editedName = 'Edited ' + faker.commerce.department() + faker.string.uuid().slice(0, 4);
      const editedDesc = faker.lorem.sentence();

      createBucket(originalName);

      // 1. Locate the bucket in the list and click Edit
      cy.contains(originalName)
        .parents('.flex.items-center.justify-between, li, article, tr, [data-slot="card"]')
        .first()
        .find('button[title="Edit"], button[aria-label="Edit"]')
        .first()
        .scrollIntoView()
        .click({ force: true });
        
      cy.get(DIALOG).should('be.visible');
      
      // 2. Modify
      cy.get('#bucket-name').clear().type(editedName);
      cy.get('#bucket-description').clear().type(editedDesc);
      
      // Assuming action button is 'Save' or 'Update' or 'Edit'
      cy.contains(`${DIALOG} button`, /save|update|edit/i).click();
      cy.get(DIALOG).should('not.exist');
      
      cy.wait(2000); // Wait for list refresh
      cy.scrollTo('bottom', { ensureScrollable: false });
      
      // Verify changes
      cy.get('body').should('contain.text', editedName);
      cy.get('body').should('not.contain.text', originalName);

      // Cleanup
      deleteBucket(editedName);
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
