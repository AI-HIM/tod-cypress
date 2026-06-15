/**
 * @module Home
 * @tags @smoke @sanity @regression
 */

describe('Home Page', { tags: ['@smoke', '@sanity', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  context('Happy Path', () => {
    it('@smoke - should load home page after login', () => {
      cy.url().should('not.include', '/login');
      cy.get('body').should('be.visible');
    });

    it('@smoke - should display sidebar navigation', () => {
      cy.get('nav, aside').should('exist');
    });

    it('@sanity - should expand sidebar and show nav links', () => {
      cy.expandSidebar();
      cy.get('a[href="/jobs"]').should('exist');
    });
  });

  context('Navigation', () => {
    it('@regression - should navigate to Jobs via sidebar', () => {
      cy.expandSidebar();
      cy.get('a[href="/jobs"]').click();
      cy.url().should('include', '/jobs');
    });

    it('@regression - should navigate to Dashboard via sidebar', () => {
      cy.expandSidebar();
      cy.get('a[href="/dashboard"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('@regression - should navigate to Candidates via sidebar', () => {
      cy.expandSidebar();
      cy.get('a[href="/talent-base/candidates"]').click();
      cy.url().should('include', '/talent-base/candidates');
    });

    it('@regression - should navigate to Pipelines via sidebar', () => {
      cy.expandSidebar();
      cy.get('a[href="/pipelines"]').click();
      cy.url().should('include', '/pipelines');
    });

    it('@regression - should navigate to Templates via sidebar', () => {
      cy.expandSidebar();
      cy.get('a[href="/templates"]').click();
      cy.url().should('include', '/templates');
    });

    it('@regression - should navigate to Imports via sidebar', () => {
      cy.expandSidebar();
      cy.get('a[href="/talent-base/imports"]').click();
      cy.url().should('include', '/talent-base/imports');
    });

    it('@regression - should navigate to Settings via sidebar', () => {
      cy.expandSidebar();
      cy.get('a[href="/settings/profile"]').click();
      cy.url().should('include', '/settings');
    });
  });

  context('Unauthenticated Access', () => {
    it('@critical - should redirect unauthenticated user to login', () => {
      cy.clearCookies();
      cy.visit('/jobs');
      cy.url().should('include', '/login');
    });
  });
});
