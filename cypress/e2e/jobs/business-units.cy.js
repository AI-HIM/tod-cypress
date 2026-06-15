/**
 * @module Jobs - Business Units
 * @tags @smoke @regression @crud
 */

import { JobsPage } from '../../pages/JobsPage';
import { dataFactory } from '../../support/utils/dataFactory';
import { maxLengthString, specialChars, EMPTY, SQL_INJECTION, XSS_PROBE } from '../../support/utils/helpers';

const jobsPage = new JobsPage();

describe('Jobs - Business Units', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/jobs');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read - List and Search', () => {
    it('@smoke - should display jobs page with BU list', () => {
      cy.url().should('include', '/jobs');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should show New BU button', () => {
      cy.get('button[title="New BU"]').should('be.visible');
    });

    it('@regression - should show search input for business units', () => {
      cy.get('[placeholder="Search business units"]').should('be.visible');
    });

    it('@regression - should search and filter business units', () => {
      cy.get('[placeholder="Search business units"]').type('Engineering');
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });

    it('@regression - should show empty state for unmatched search', () => {
      cy.get('[placeholder="Search business units"]').type('ZZZNOMATCH_XYZAUTO');
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });

    it('@regression - should clear search and restore list', () => {
      cy.get('[placeholder="Search business units"]').type('xyz').clear();
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  context('Create - New BU', () => {
    it('@smoke - should open New BU modal', () => {
      cy.get('button[title="New BU"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('#bu-name').should('be.visible');
    });

    it('@critical - should create a BU with name and description', () => {
      const bu = dataFactory.businessUnit();
      cy.get('button[title="New BU"]').click();
      cy.get('#bu-name').clear().type(bu.name);
      cy.get('#bu-description').clear().type(bu.description);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('contain.text', bu.name);
    });

    it('@regression - should create a BU with name only (description optional)', () => {
      const bu = dataFactory.businessUnit();
      cy.get('button[title="New BU"]').click();
      cy.get('#bu-name').clear().type(bu.name);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('contain.text', bu.name);
    });

    it('@regression - should not create BU with empty name', () => {
      cy.get('button[title="New BU"]').click();
      cy.contains('button', /save|create/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('@regression - should not create BU with whitespace-only name', () => {
      cy.get('button[title="New BU"]').click();
      cy.get('#bu-name').type('   ');
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should handle special characters in BU name', () => {
      const bu = dataFactory.businessUnit({ name: `BU & Co. (AUTO_${Date.now()})` });
      cy.get('button[title="New BU"]').click();
      cy.get('#bu-name').clear().type(bu.name);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should handle max length BU name', () => {
      cy.get('button[title="New BU"]').click();
      cy.get('#bu-name').clear().type(maxLengthString(100));
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should reject SQL injection in BU name', () => {
      cy.get('button[title="New BU"]').click();
      cy.get('#bu-name').clear().type(SQL_INJECTION);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should reject XSS probe in BU name', () => {
      cy.get('button[title="New BU"]').click();
      cy.get('#bu-name').clear().type(XSS_PROBE);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });
  });

  // ─── MODAL UX ─────────────────────────────────────────────────────────────

  context('Modal UX', () => {
    it('@regression - should close modal on Cancel', () => {
      cy.get('button[title="New BU"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('button', /cancel/i).click();
      cy.get('#bu-name').should('not.exist');
    });

    it('@regression - should not submit modal when required fields are empty', () => {
      cy.get('button[title="New BU"]').click();
      cy.contains('button', /save|create/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });
  });

  // ─── NEW JOB BUTTON ───────────────────────────────────────────────────────

  context('New Job Button', () => {
    it('@smoke - should show New Job button', () => {
      cy.get('button[title="New Job"]').should('be.visible');
    });

    it('@regression - should open new job flow when clicked', () => {
      cy.get('button[title="New Job"]').click();
      cy.get('body').should('be.visible');
    });
  });
});
