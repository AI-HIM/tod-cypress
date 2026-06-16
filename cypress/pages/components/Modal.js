import { SELECTORS } from '../../support/utils/helpers';

const M = SELECTORS.modal;

export class Modal {
  waitForVisible(headingText) {
    if (headingText) {
      cy.contains(M.dialog, headingText, { timeout: 10000 }).should('be.visible');
    } else {
      cy.get(M.dialog, { timeout: 10000 }).should('be.visible');
    }
    return this;
  }

  assertClosed() {
    cy.get(M.dialog).should('not.exist');
    return this;
  }

  submit() {
    cy.contains('button', /save|create|submit|confirm/i).click();
    return this;
  }

  cancel() {
    // Prefer the explicit Cancel button; fall back to the Radix close trigger (×).
    // Both are always present in TOD dialogs — no conditional needed.
    cy.get('[role="dialog"]').within(() => {
      cy.get('button:contains("Cancel"), [data-slot="dialog-close"]').first().click({ force: true });
    });
    cy.get('[role="dialog"]').should('not.exist');
    return this;
  }

  assertValidationError(message) {
    cy.contains(message, { timeout: 5000 }).should('be.visible');
    return this;
  }

  assertFieldRequired(selector) {
    cy.get(selector).then(($el) => {
      expect($el[0].validity.valid).to.be.false;
    });
    return this;
  }
}
