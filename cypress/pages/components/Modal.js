import { SELECTORS } from '../../support/utils/helpers';

const M = SELECTORS.modals;

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
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Cancel")').length) {
        cy.contains('button', 'Cancel').click();
      } else {
        cy.get('[aria-label="Close"], [aria-label="Dismiss"], button[title="Close"]')
          .first()
          .click();
      }
    });
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
