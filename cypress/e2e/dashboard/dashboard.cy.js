/**
 * @module Dashboard
 * @tags @smoke @regression
 */

describe('Dashboard', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
  });

  context('Happy Path', () => {
    it('@smoke - should load dashboard page', () => {
      cy.url().should('include', '/dashboard');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should display dashboard content', () => {
      cy.get('body').should('not.be.empty');
    });

    it('@regression - should render charts or metric widgets', () => {
      cy.get('body').should('be.visible');
      cy.get('canvas, svg, [class*="chart"], [class*="metric"], [class*="stat"]').should('exist');
    });
  });

  context('Navigation', () => {
    it('@regression - should navigate back to jobs from dashboard', () => {
      cy.expandSidebar();
      cy.get('a[href="/jobs"]').click();
      cy.url().should('include', '/jobs');
    });
  });

  context('Unauthenticated', () => {
    it('@critical - should redirect to login when not authenticated', () => {
      cy.clearCookies();
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });
  });
});
