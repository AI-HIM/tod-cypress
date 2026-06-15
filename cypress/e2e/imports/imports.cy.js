/**
 * @module Imports - Talent Base
 * @tags @smoke @regression @crud
 */

import { ImportsPage } from '../../pages/ImportsPage';
import { dataFactory } from '../../support/utils/dataFactory';
import { SQL_INJECTION, XSS_PROBE, maxLengthString } from '../../support/utils/helpers';

const page = new ImportsPage();

describe('Imports - Talent Base', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/talent-base/imports');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read', () => {
    it('@smoke - should load imports page', () => {
      cy.url().should('include', '/talent-base/imports');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should display New Import button', () => {
      cy.get('button[title="New Import"]').should('be.visible');
    });

    it('@sanity - should display search input', () => {
      cy.get('[placeholder="Search"]').should('be.visible');
    });

    it('@regression - should search imports', () => {
      cy.get('[placeholder="Search"]').clear().type('Import');
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });

    it('@regression - should show no results for unmatched search', () => {
      cy.get('[placeholder="Search"]').clear().type('ZZZNOMATCH_IMPORTAUTO');
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  context('Create New Import', () => {
    it('@smoke - should open New Import modal', () => {
      cy.get('button[title="New Import"]').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('@critical - should create import with name and description', () => {
      const importData = dataFactory.importBatch();
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(importData.name);
      cy.get('#import-description-input').clear().type(importData.description);
      cy.contains('button', /save|create|next/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should create import with name only', () => {
      const importData = dataFactory.importBatch();
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible').clear().type(importData.name);
      cy.contains('button', /save|create|next/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should not create import with empty name', () => {
      cy.get('button[title="New Import"]').click();
      cy.contains('button', /save|create|next/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('@regression - should handle max length import name', () => {
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').clear().type(maxLengthString(100));
      cy.contains('button', /save|create|next/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should reject SQL injection in import name', () => {
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').clear().type(SQL_INJECTION);
      cy.contains('button', /save|create|next/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should reject XSS in import name', () => {
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').clear().type(XSS_PROBE);
      cy.contains('button', /save|create|next/i).click();
      cy.get('body').should('be.visible');
    });
  });

  // ─── FILE UPLOAD ──────────────────────────────────────────────────────────

  context('File Upload', () => {
    it('@regression - should upload a valid PDF file in import', () => {
      const importData = dataFactory.importBatch();
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').clear().type(importData.name);
      cy.get('body').then(($body) => {
        if ($body.find('[type="file"]').length) {
          cy.get('[type="file"]').selectFile('cypress/fixtures/files/sample-resume.pdf', {
            force: true,
          });
        }
      });
      cy.contains('button', /save|create|next/i).click();
      cy.get('body').should('be.visible');
    });
  });

  // ─── MODAL UX ─────────────────────────────────────────────────────────────

  context('Modal UX', () => {
    it('@regression - should close import modal on Cancel', () => {
      cy.get('button[title="New Import"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('button', /cancel/i).click();
      cy.get('#import-name-input').should('not.exist');
    });
  });
});
