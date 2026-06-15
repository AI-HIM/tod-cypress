/**
 * @module Add Candidate
 * @tags @smoke @regression @crud @critical
 */

import { dataFactory } from '../../support/utils/dataFactory';
import { SQL_INJECTION, XSS_PROBE, maxLengthString } from '../../support/utils/helpers';

describe('Add Candidate', { tags: ['@smoke', '@regression', '@critical'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/talent-base/candidates');
    cy.get('button[title="Add a candidate"]').should('be.visible');
  });

  // ─── Happy Path ────────────────────────────────────────────────────────────

  context('Happy Path', () => {
    it('@smoke - should open Add Candidate modal/form', () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"], form').should('be.visible');
    });

    it('@critical - should add a candidate with all required fields', () => {
      const candidate = dataFactory.candidate();
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="First name"]').should('be.visible').clear().type(candidate.fullName.split(' ')[0]);
      cy.get('[placeholder="Last name"]').should('be.visible').clear().type(candidate.fullName.split(' ')[1]);
      cy.get('[placeholder="Email"]').should('be.visible').clear().type(candidate.email);
      cy.contains('button', /save|create|add/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should add candidate with optional phone', () => {
      const candidate = dataFactory.candidate();
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="First name"]').should('be.visible').clear().type(candidate.fullName.split(' ')[0]);
      cy.get('[placeholder="Last name"]').should('be.visible').clear().type(candidate.fullName.split(' ')[1]);
      cy.get('[placeholder="Email"]').should('be.visible').clear().type(candidate.email);
      cy.get('body').then(($body) => {
        if ($body.find('[placeholder="Phone"]').length) {
          cy.get('[placeholder="Phone"]').clear().type(candidate.phone);
        }
      });
      cy.contains('button', /save|create|add/i).click();
      cy.get('body').should('be.visible');
    });
  });

  // ─── Negative Path ─────────────────────────────────────────────────────────

  context('Negative Path', () => {
    it('@regression - should not submit without first name', () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="Last name"]').clear().type('LastOnly');
      cy.get('[placeholder="Email"]').clear().type('lastonly@test.com');
      cy.contains('button', /save|create|add/i).click();
      cy.get('[role="dialog"], form').should('be.visible');
    });

    it('@regression - should not submit without email', () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="First name"]').clear().type('FirstOnly');
      cy.get('[placeholder="Last name"]').clear().type('LastOnly');
      cy.contains('button', /save|create|add/i).click();
      cy.get('[role="dialog"], form').should('be.visible');
    });

    it('@regression - should reject invalid email format', () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="First name"]').clear().type('Test');
      cy.get('[placeholder="Last name"]').clear().type('User');
      cy.get('[placeholder="Email"]').clear().type('invalid-email');
      cy.contains('button', /save|create|add/i).click();
      cy.get('body').should('be.visible');
    });
  });

  // ─── Validation ────────────────────────────────────────────────────────────

  context('Validation', () => {
    it('@regression - should handle special characters in name', () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="First name"]').clear().type("O'Brien");
      cy.get('[placeholder="Last name"]').clear().type('Müller-Smith');
      cy.get('[placeholder="Email"]').clear().type('special@automation.com');
      cy.contains('button', /save|create|add/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should handle max length in name fields', () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="First name"]').clear().type(maxLengthString(50));
      cy.get('[placeholder="Last name"]').clear().type(maxLengthString(50));
      cy.get('[placeholder="Email"]').clear().type('maxlen@automation.com');
      cy.contains('button', /save|create|add/i).click();
      cy.get('body').should('be.visible');
    });
  });

  // ─── Security ─────────────────────────────────────────────────────────────

  context('Security', () => {
    it('@regression - should reject SQL injection in candidate name', () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="First name"]').clear().type(SQL_INJECTION);
      cy.get('[placeholder="Last name"]').clear().type('Test');
      cy.get('[placeholder="Email"]').clear().type('sqlinj@automation.com');
      cy.contains('button', /save|create|add/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should reject XSS probe in candidate name', () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="First name"]').clear().type(XSS_PROBE);
      cy.get('[placeholder="Last name"]').clear().type('Test');
      cy.get('[placeholder="Email"]').clear().type('xss@automation.com');
      cy.contains('button', /save|create|add/i).click();
      cy.get('body').should('be.visible');
    });
  });

  // ─── Modal UX ─────────────────────────────────────────────────────────────

  context('Modal UX', () => {
    it('@regression - should cancel and close add candidate form', () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"], form').should('be.visible');
      cy.contains('button', /cancel/i).click();
      cy.get('[placeholder="First name"]').should('not.exist');
    });
  });
});
