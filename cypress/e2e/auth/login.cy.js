/**
 * @module Auth
 * @tags @smoke @sanity @regression
 */

import { LoginPage } from '../../pages/LoginPage';

const loginPage = new LoginPage();

describe('Authentication - Login', { tags: ['@smoke', '@sanity', '@regression'] }, () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  // ─── Happy Path ────────────────────────────────────────────────────────────

  context('Happy Path', () => {
    it('@smoke - should login successfully with valid credentials', () => {
      loginPage.loginWith(
        Cypress.env('USER_EMAIL'),
        Cypress.env('USER_PASSWORD')
      );
      cy.url().should('not.include', '/login');
      cy.get('body').should('be.visible');
    });

    it('@smoke - should redirect to home after successful login', () => {
      loginPage.loginWith(
        Cypress.env('USER_EMAIL'),
        Cypress.env('USER_PASSWORD')
      );
      cy.url().should('not.include', '/login');
    });

    it('@regression - should persist session across page reload', () => {
      loginPage.loginWith(
        Cypress.env('USER_EMAIL'),
        Cypress.env('USER_PASSWORD')
      );
      cy.url().should('not.include', '/login');
      cy.reload();
      cy.url().should('not.include', '/login');
    });
  });

  // ─── Negative Path ─────────────────────────────────────────────────────────

  context('Negative Path', () => {
    it('@regression - should show error for invalid password', () => {
      cy.fixture('users').then(({ invalid }) => {
        loginPage.loginWith(invalid.email, invalid.password);
        loginPage.assertStillOnLoginPage();
      });
    });

    it('@regression - should show error for non-existent email', () => {
      loginPage.loginWith('doesnotexist@nowhere.com', 'SomePass123');
      loginPage.assertStillOnLoginPage();
    });

    it('@regression - should show error for empty email', () => {
      loginPage.fillPassword(Cypress.env('USER_PASSWORD'));
      loginPage.submit();
      loginPage.assertStillOnLoginPage();
    });

    it('@regression - should show error for empty password', () => {
      loginPage.fillEmail(Cypress.env('USER_EMAIL'));
      loginPage.submit();
      loginPage.assertStillOnLoginPage();
    });

    it('@regression - should show error for both fields empty', () => {
      loginPage.submit();
      loginPage.assertStillOnLoginPage();
    });
  });

  // ─── Validation / Boundary ─────────────────────────────────────────────────

  context('Validation', () => {
    it('@regression - should reject malformed email format', () => {
      loginPage.loginWith('not-an-email', 'Password@123');
      loginPage.assertStillOnLoginPage();
    });

    it('@regression - should reject whitespace-only email', () => {
      loginPage.loginWith('   ', Cypress.env('USER_PASSWORD'));
      loginPage.assertStillOnLoginPage();
    });
  });

  // ─── Security ─────────────────────────────────────────────────────────────

  context('Security', () => {
    it('@regression - should not expose password in plain text', () => {
      cy.get('#password').type('TestPassword', { log: false });
      cy.get('#password').should('have.attr', 'type', 'password');
    });

    it('@regression - should reject SQL injection in email field', () => {
      loginPage.loginWith("' OR '1'='1", 'Password@123');
      loginPage.assertStillOnLoginPage();
    });

    it('@regression - should reject XSS probe in email field', () => {
      loginPage.loginWith("<script>alert('xss')</script>", 'Password@123');
      loginPage.assertStillOnLoginPage();
    });
  });

  // ─── Logout ───────────────────────────────────────────────────────────────

  context('Logout', () => {
    it('@smoke - should logout successfully and redirect to login', () => {
      cy.login();
      cy.visit('/');
      cy.logout();
      cy.url().should('include', '/login');
    });

    it('@regression - should not access protected routes after logout', () => {
      cy.login();
      cy.visit('/');
      cy.logout();
      cy.visit('/jobs');
      cy.url().should('include', '/login');
    });
  });
});
