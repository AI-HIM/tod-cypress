/**
 * @module Auth
 * Login page: happy path, negative, validation, security and logout coverage.
 * Negative tests use the login page directly (no cy.session caching) so a failed
 * attempt is never cached. The valid-login assertion checks the URL leaves /login.
 */

import { LoginPage } from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Authentication - Login', { tags: ['@smoke', '@sanity', '@regression'] }, () => {
  beforeEach(() => {
    cy.visit('/login');
    loginPage.waitUntilReady();
  });

  // ─── Happy Path ────────────────────────────────────────────────────────────

  context('Happy Path', () => {
    it('logs in successfully with valid credentials', { tags: ['@smoke', '@critical'] }, () => {
      loginPage.loginWith(Cypress.env('USER_EMAIL'), Cypress.env('USER_PASSWORD'));
      loginPage.assertLoggedIn();
    });
  });

  // ─── Negative Path ─────────────────────────────────────────────────────────

  context('Negative Path', { tags: ['@regression'] }, () => {
    it('shows an error and stays on /login for an invalid password', () => {
      loginPage.loginWith(Cypress.env('USER_EMAIL'), 'WrongPassword!999');
      loginPage.assertErrorContains(/invalid email or password/i);
      loginPage.assertStillOnLoginPage();
    });

    it('shows an error and stays on /login for a non-existent email', () => {
      loginPage.loginWith('doesnotexist@nowhere.com', 'SomePass123!');
      loginPage.assertErrorContains(/invalid email or password/i);
      loginPage.assertStillOnLoginPage();
    });

    it('blocks submission when email is empty', () => {
      loginPage.fillPassword(Cypress.env('USER_PASSWORD'));
      loginPage.submit();
      loginPage.assertStillOnLoginPage();
    });

    it('blocks submission when password is empty', () => {
      loginPage.fillEmail(Cypress.env('USER_EMAIL'));
      loginPage.submit();
      loginPage.assertStillOnLoginPage();
    });

    it('blocks submission when both fields are empty', () => {
      loginPage.submit();
      loginPage.assertStillOnLoginPage();
    });
  });

  // ─── Validation / Boundary ─────────────────────────────────────────────────

  context('Validation', { tags: ['@regression'] }, () => {
    it('rejects a malformed email format', () => {
      loginPage.loginWith('not-an-email', 'Password@123');
      loginPage.assertStillOnLoginPage();
    });
  });

  // ─── Security ──────────────────────────────────────────────────────────────

  context('Security', { tags: ['@regression', '@security'] }, () => {
    it('masks the password input', () => {
      cy.get('#password').type('TestPassword', { log: false });
      loginPage.assertPasswordMasked();
    });

    it('rejects a SQL injection probe in the email field', () => {
      loginPage.loginWith("' OR '1'='1", 'Password@123');
      loginPage.assertStillOnLoginPage();
    });

    it('rejects an XSS probe in the email field', () => {
      loginPage.loginWith("<script>alert('xss')</script>", 'Password@123');
      loginPage.assertStillOnLoginPage();
    });
  });

  // ─── Protected route access ─────────────────────────────────────────────────

  context('Unauthenticated Access', { tags: ['@critical', '@regression'] }, () => {
    it('redirects an unauthenticated visit to /dashboard back to /login', () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit('/dashboard');
      cy.location('pathname', { timeout: 15000 }).should('include', '/login');
    });
  });

  // ─── Logout ───────────────────────────────────────────────────────────────

  context('Logout', { tags: ['@smoke'] }, () => {
    it('logs out and returns to /login', () => {
      cy.login();
      cy.visit('/');
      cy.logout();
      cy.location('pathname', { timeout: 15000 }).should('include', '/login');
    });
  });
});
