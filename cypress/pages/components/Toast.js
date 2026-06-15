import { SELECTORS } from '../../support/utils/helpers';

const T = SELECTORS.toast;

export class Toast {
  assertSuccess(text) {
    if (text) {
      cy.contains(T.success, text, { timeout: 10000 }).should('be.visible');
    } else {
      cy.get(T.success, { timeout: 10000 }).should('be.visible');
    }
    return this;
  }

  assertError(text) {
    if (text) {
      cy.contains(T.error, text, { timeout: 10000 }).should('be.visible');
    } else {
      cy.get(T.error, { timeout: 10000 }).should('be.visible');
    }
    return this;
  }

  assertAny(text) {
    if (text) {
      cy.contains(T.any, text, { timeout: 10000 }).should('be.visible');
    } else {
      cy.get(T.any, { timeout: 10000 }).should('be.visible');
    }
    return this;
  }
}
