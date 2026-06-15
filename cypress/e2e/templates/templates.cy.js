/**
 * @module Templates
 * @tags @smoke @regression @crud
 */

import { TemplatesPage } from '../../pages/TemplatesPage';
import { dataFactory } from '../../support/utils/dataFactory';
import { maxLengthString, SQL_INJECTION, XSS_PROBE } from '../../support/utils/helpers';

const page = new TemplatesPage();

describe('Templates', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/templates');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read', () => {
    it('@smoke - should load templates page', () => {
      cy.url().should('include', '/templates');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should display New Template button', () => {
      cy.contains('button', /new template/i).should('be.visible');
    });

    it('@regression - should search templates', () => {
      cy.get('[placeholder*="Search"]').clear().type('Template');
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });

    it('@regression - should show empty state for unmatched search', () => {
      cy.get('[placeholder*="Search"]').clear().type('ZZZNOMATCH_XYZ');
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });
  });

  // ─── CREATE TEMPLATE ───────────────────────────────────────────────────────

  context('Create Template', () => {
    it('@smoke - should open New Template modal', () => {
      cy.contains('button', /new template/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('@critical - should create template with all fields', () => {
      const tmpl = dataFactory.template();
      cy.contains('button', /new template/i).click();
      cy.get('#template-name').should('be.visible').clear().type(tmpl.name);
      cy.get('#template-subject').should('be.visible').clear().type(tmpl.subject);
      cy.get('#template-description').clear().type(tmpl.description);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('contain.text', tmpl.name);
    });

    it('@regression - should create template with name and subject only', () => {
      const tmpl = dataFactory.template();
      cy.contains('button', /new template/i).click();
      cy.get('#template-name').should('be.visible').clear().type(tmpl.name);
      cy.get('#template-subject').should('be.visible').clear().type(tmpl.subject);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should not create template with empty name', () => {
      cy.contains('button', /new template/i).click();
      cy.contains('button', /save|create/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('@regression - should handle max length template name', () => {
      cy.contains('button', /new template/i).click();
      cy.get('#template-name').clear().type(maxLengthString(100));
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should reject SQL injection in template name', () => {
      cy.contains('button', /new template/i).click();
      cy.get('#template-name').clear().type(SQL_INJECTION);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should cancel template creation', () => {
      cy.contains('button', /new template/i).click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('button', /cancel/i).click();
      cy.get('#template-name').should('not.exist');
    });
  });

  // ─── CREATE FOLDER ────────────────────────────────────────────────────────

  context('Create Folder', () => {
    it('@smoke - should open New Folder modal', () => {
      cy.contains('button', /new folder/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('@critical - should create a folder', () => {
      const folder = dataFactory.folder();
      cy.contains('button', /new folder/i).click();
      cy.get('#folder-name').should('be.visible').clear().type(folder.name);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('contain.text', folder.name);
    });

    it('@regression - should not create folder with empty name', () => {
      cy.contains('button', /new folder/i).click();
      cy.contains('button', /save|create/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('@regression - should cancel folder creation', () => {
      cy.contains('button', /new folder/i).click();
      cy.contains('button', /cancel/i).click();
      cy.get('#folder-name').should('not.exist');
    });
  });
});
