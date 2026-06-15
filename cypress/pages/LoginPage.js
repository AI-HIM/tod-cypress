import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const S = SELECTORS.login;

export class LoginPage extends BasePage {
  constructor() {
    super('/login');
  }

  waitUntilReady() {
    cy.get(S.emailInput).should('be.visible');
    cy.get(S.passwordInput).should('be.visible');
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

  /** Click the Log in button. Matched by text so it works regardless of attrs. */
  submit() {
    cy.contains('button', /^log\s?in$/i).click();
    return this;
  }

  loginWith(email, password) {
    this.fillEmail(email);
    this.fillPassword(password);
    this.submit();
    return this;
  }

  /**
   * Assert the auth error is visible (shown for bad credentials).
   * The TOD login form does NOT use role="alert"; it renders the message in a
   * destructive-styled banner div with the exact text "Invalid email or password".
   */
  assertErrorVisible() {
    cy.contains(/invalid email or password/i, { timeout: 10000 }).should('be.visible');
    return this;
  }

  assertErrorContains(text) {
    cy.contains(text, { timeout: 10000 }).should('be.visible');
    return this;
  }

  /** Deterministically assert we did NOT navigate away from /login. */
  assertStillOnLoginPage() {
    cy.location('pathname', { timeout: 10000 }).should('include', '/login');
    return this;
  }

  /** Assert login succeeded — URL has left /login. */
  assertLoggedIn() {
    cy.location('pathname', { timeout: 15000 }).should('not.include', '/login');
    return this;
  }

  assertPasswordMasked() {
    cy.get(S.passwordInput).should('have.attr', 'type', 'password');
    return this;
  }
}
