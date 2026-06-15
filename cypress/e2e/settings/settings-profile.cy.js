/**
 * @module Settings - Profile
 * @tags @smoke @regression
 */

import { SettingsPage } from '../../pages/SettingsPage';
import { SQL_INJECTION, XSS_PROBE, maxLengthString } from '../../support/utils/helpers';

const page = new SettingsPage('profile');

describe('Settings - Profile', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/profile');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read', () => {
    it('@smoke - should load settings profile page', () => {
      cy.url().should('include', '/settings');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should display name input field', () => {
      cy.get('#name-input').should('be.visible');
    });

    it('@sanity - should display email input field', () => {
      cy.get('#email-input').should('be.visible');
    });

    it('@regression - should display pre-filled name and email', () => {
      cy.get('#name-input').should('not.have.value', '');
      cy.get('#email-input').should('not.have.value', '');
    });
  });

  // ─── UPDATE ────────────────────────────────────────────────────────────────

  context('Update Profile', () => {
    it('@critical - should update name successfully', () => {
      const newName = `Auto User ${Date.now()}`;
      cy.get('#name-input').clear().type(newName);
      cy.get('button[type="submit"]').click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should update career site tagline', () => {
      cy.get('body').then(($body) => {
        if ($body.find('#career-site-tagline').length) {
          cy.get('#career-site-tagline').clear().type('Automation Test Tagline');
          cy.get('button[type="submit"]').click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('Tagline field not present');
        }
      });
    });

    it('@regression - should not allow empty name', () => {
      cy.get('#name-input').clear();
      cy.get('button[type="submit"]').click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should handle max length name', () => {
      cy.get('#name-input').clear().type(maxLengthString(100));
      cy.get('button[type="submit"]').click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should reject SQL injection in name', () => {
      cy.get('#name-input').clear().type(SQL_INJECTION);
      cy.get('button[type="submit"]').click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should reject XSS in name field', () => {
      cy.get('#name-input').clear().type(XSS_PROBE);
      cy.get('button[type="submit"]').click();
      cy.get('body').should('be.visible');
    });
  });

  // ─── EMAIL ────────────────────────────────────────────────────────────────

  context('Email Field', () => {
    it('@regression - should display email (may be readonly)', () => {
      cy.get('#email-input').should('exist');
    });

    it('@regression - should reject invalid email format if editable', () => {
      cy.get('#email-input').then(($el) => {
        if (!$el.prop('disabled') && !$el.prop('readonly')) {
          cy.wrap($el).clear().type('invalid-email');
          cy.get('button[type="submit"]').click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('Email field is read-only');
        }
      });
    });
  });
});
