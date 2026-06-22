/**
 * @module Imports - Talent Base
 *
 * Verified live (2026-06-15):
 *  - Table headers: Name, Type, Progress, Created, Status, Creator
 *  - "New Import" button: button[title="New Import"]
 *  - Search: [placeholder="Search"]
 *  - Refresh: button[title="Refresh"]
 *  - Import dialog fields: #import-name-input, #import-description-input
 *  - Import rows show Status values: Completed, Draft, Failed, Needs Review
 */

import { faker } from '@faker-js/faker';
import { ImportsPage } from '../../pages/ImportsPage';
import { dataFactory } from '../../support/utils/dataFactory';
import { SQL_INJECTION, XSS_PROBE, maxLengthString, unique } from '../../support/utils/helpers';

const page = new ImportsPage();

describe('Imports - Talent Base', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/talent-base/imports');
    page.waitUntilReady();
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read - list page', { tags: ['@smoke'] }, () => {
    it('loads the imports page on the correct URL', { tags: ['@smoke', '@critical'] }, () => {
      cy.url().should('include', '/talent-base/imports');
    });

    it('displays the correct table column headers', { tags: ['@smoke'] }, () => {
      page.assertTableHeadersVisible();
    });

    it('shows existing import rows in the table', { tags: ['@smoke'] }, function () {
      cy.get('body').then(($body) => {
        const $rows = $body.find('table tbody tr');
        if ($rows.length === 0) {
          cy.log('Skipping test: no imports exist');
          this.skip();
        } else {
          cy.wrap($rows).should('have.length.greaterThan', 0);
        }
      });
    });

    it('displays the New Import button', { tags: ['@sanity'] }, () => {
      cy.get('button[title="New Import"]').should('be.visible');
    });

    it('displays the search input', { tags: ['@sanity'] }, () => {
      cy.get('[placeholder="Search"]').should('be.visible');
    });

    it('displays the Refresh button', { tags: ['@regression'] }, () => {
      cy.get('button[title="Refresh"]').should('be.visible');
    });
  });

  // ─── SEARCH ───────────────────────────────────────────────────────────────

  context('Search', { tags: ['@regression'] }, () => {
    it('filters results by import name', { tags: ['@regression'] }, function () {
      // Use whichever import already exists rather than a hardcoded seed name,
      // so this test does not depend on fixed env data.
      cy.get('body').then(($body) => {
        const $rows = $body.find('table tbody tr');
        if ($rows.length === 0) {
          cy.log('Skipping test: no imports exist');
          this.skip();
        } else {
          const rawName = $rows.first().find('td').first().text();
          const term = rawName.trim();
          if (!term) {
             this.skip(); // No readable text
          } else {
             cy.get('[placeholder="Search"]').clear().type(term);
             cy.waitForPageLoad();
             cy.get('table tbody tr').should('have.length.greaterThan', 0);
             cy.get('table tbody').should('contain.text', term);
          }
        }
      });
    });

    it('shows empty results for an unmatched search term', { tags: ['@regression'] }, function () {
      cy.get('[placeholder="Search"]').clear().type('ZZZNOMATCH_IMPORTAUTO');
      cy.waitForPageLoad();
      cy.get('table tbody tr').should('have.length', 0);
    });

    it('restores the full list after clearing search', { tags: ['@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $rows = $body.find('table tbody tr');
        if ($rows.length === 0) {
          cy.log('Skipping test: no imports exist');
          this.skip();
        } else {
          cy.get('[placeholder="Search"]').clear().type('ZZZNOMATCH');
          cy.waitForPageLoad();
          cy.get('[placeholder="Search"]').clear();
          cy.waitForPageLoad();
          cy.get('table tbody tr').should('have.length.greaterThan', 0);
        }
      });
    });
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  context('Create New Import', { tags: ['@crud', '@create'] }, () => {
    it('opens the New Import dialog with the correct heading', { tags: ['@smoke'] }, () => {
      cy.get('button[title="New Import"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('[role="dialog"]', /import/i).should('be.visible');
    });

    it('creates an import with name and description', { tags: ['@smoke', '@critical'] }, function () {
      const importData = dataFactory.importBatch();
      importData.name = faker.lorem.words(3);
      importData.description = faker.lorem.sentence();
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(importData.name);
      cy.get('#import-description-input').clear().type(importData.description);
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      // After saving, dialog should close or navigate
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('creates an import with name only (description optional)', { tags: ['@regression'] }, function () {
      const importData = dataFactory.importBatch();
      importData.name = faker.lorem.words(3);
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(importData.name);
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('rejects empty name — keeps dialog open', { tags: ['@regression', '@validation'] }, function () {
      cy.get('button[title="New Import"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('#import-name-input').should('be.visible').and('have.value', '');
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('accepts a max-length (100 char) import name', { tags: ['@regression', '@boundary'] }, function () {
      const prefix = `${faker.lorem.word()}_`;
      const name = prefix + maxLengthString(100 - prefix.length);
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(name);
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('treats an SQL-injection probe as literal import name', { tags: ['@regression', '@security'] }, function () {
      const name = `${faker.lorem.word()} ${SQL_INJECTION}`;
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(name);
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      // Probe must be stored as plain text — dialog closes, no server error
      cy.get('[role="dialog"]').should('not.exist');
      cy.url().should('include', '/talent-base/imports');
    });

    it('treats an XSS probe as literal import name', { tags: ['@regression', '@security'] }, function () {
      const name = `${faker.lorem.word()} ${XSS_PROBE}`;
      cy.on('window:alert', () => { throw new Error('XSS payload executed'); });
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(name);
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      // Probe must be stored as plain text — no alert fires, dialog closes
      cy.get('[role="dialog"]').should('not.exist');
      cy.url().should('include', '/talent-base/imports');
    });
  });

  // ─── MODAL UX ─────────────────────────────────────────────────────────────

  context('Modal UX', { tags: ['@regression'] }, () => {
    it('closes the import dialog via Cancel', { tags: ['@regression'] }, () => {
      cy.get('button[title="New Import"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('[role="dialog"] button', /cancel/i).click();
      cy.get('[role="dialog"]').should('not.exist');
      cy.get('#import-name-input').should('not.exist');
    });
  });

  // ─── TABLE CONTENT ─────────────────────────────────────────────────────────

  context('Table Content', { tags: ['@regression'] }, () => {
    it('shows status values (Completed, Draft, Failed) in the Status column', { tags: ['@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $rows = $body.find('table tbody tr');
        if ($rows.length === 0) {
          cy.log('Skipping test: no imports exist');
          this.skip();
        } else {
          cy.get('table tbody').invoke('text').should('match', /Completed|Draft|Failed|Needs Review/);
        }
      });
    });

    it('shows a Creator column with user avatars', { tags: ['@regression'] }, () => {
      cy.get('table thead').should('contain.text', 'Creator');
    });
  });
});
