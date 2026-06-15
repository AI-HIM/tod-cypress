import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const S = SELECTORS.login;

export class LoginPage extends BasePage {
  constructor() {
    super('/login');
  }

  waitUntilReady() {
    cy.get(S.emailInput).should('be.visible');
    return this;
  }

  fillEmail(email) {
    cy.get(S.emailInput).clear().type(email);
    return this;
  }

  fillPassword(password) {
    cy.get(S.passwordInput).clear().type(password, { log: false });
    return this;
  }

  submit() {
    cy.get(S.submitButton).click();
    return this;
  }

  loginWith(email, password) {
    this.fillEmail(email);
    this.fillPassword(password);
    this.submit();
    return this;
  }

  assertErrorVisible() {
    cy.get(S.errorMessage, { timeout: 8000 }).should('be.visible');
    return this;
  }

  assertErrorContains(text) {
    cy.get(S.errorMessage, { timeout: 8000 }).should('contain.text', text);
    return this;
  }

  assertStillOnLoginPage() {
    cy.url().should('include', '/login');
    return this;
  }
}
