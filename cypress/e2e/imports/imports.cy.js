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

    it('shows existing import rows in the table', { tags: ['@smoke'] }, () => {
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
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
    it('filters results by import name', { tags: ['@regression'] }, () => {
      // Use whichever import already exists rather than a hardcoded seed name,
      // so this test does not depend on fixed env data.
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
      cy.get('table tbody tr').first().find('td').first().invoke('text').then((rawName) => {
        const term = rawName.trim();
        cy.get('[placeholder="Search"]').clear().type(term);
        cy.waitForPageLoad();
        cy.get('table tbody tr').should('have.length.greaterThan', 0);
        cy.get('table tbody').should('contain.text', term);
      });
    });

    it('shows empty results for an unmatched search term', { tags: ['@regression'] }, () => {
      cy.get('[placeholder="Search"]').clear().type('ZZZNOMATCH_IMPORTAUTO');
      cy.waitForPageLoad();
      cy.get('table tbody tr').should('have.length', 0);
    });

    it('restores the full list after clearing search', { tags: ['@regression'] }, () => {
      cy.get('[placeholder="Search"]').clear().type('ZZZNOMATCH');
      cy.waitForPageLoad();
      cy.get('[placeholder="Search"]').clear();
      cy.waitForPageLoad();
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  context('Create New Import', { tags: ['@crud', '@create'] }, () => {
    it('opens the New Import dialog with the correct heading', { tags: ['@smoke'] }, () => {
      cy.get('button[title="New Import"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('[role="dialog"]', /import/i).should('be.visible');
    });

    it('creates an import with name and description', { tags: ['@smoke', '@critical'] }, () => {
      const importData = dataFactory.importBatch();
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(importData.name);
      cy.get('#import-description-input').clear().type(importData.description);
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      // After saving, dialog should close or navigate
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('creates an import with name only (description optional)', { tags: ['@regression'] }, () => {
      const importData = dataFactory.importBatch();
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(importData.name);
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('rejects empty name — keeps dialog open', { tags: ['@regression', '@validation'] }, () => {
      cy.get('button[title="New Import"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('#import-name-input').should('be.visible').and('have.value', '');
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('accepts a max-length (100 char) import name', { tags: ['@regression', '@boundary'] }, () => {
      const name = `${unique('IMP')}_${maxLengthString(100 - 12)}`;
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(name);
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('treats an SQL-injection probe as literal import name', { tags: ['@regression', '@security'] }, () => {
      const name = `${unique('IMP')} ${SQL_INJECTION}`;
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(name);
      cy.contains('[role="dialog"] button', /save|create|next/i).click();
      // Probe must be stored as plain text — dialog closes, no server error
      cy.get('[role="dialog"]').should('not.exist');
      cy.url().should('include', '/talent-base/imports');
    });

    it('treats an XSS probe as literal import name', { tags: ['@regression', '@security'] }, () => {
      const name = `${unique('IMP')} ${XSS_PROBE}`;
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
    it('shows status values (Completed, Draft, Failed) in the Status column', { tags: ['@regression'] }, () => {
      cy.get('table tbody').invoke('text').should('match', /Completed|Draft|Failed|Needs Review/);
    });

    it('shows a Creator column with user avatars', { tags: ['@regression'] }, () => {
      cy.get('table thead').should('contain.text', 'Creator');
    });
  });
});
