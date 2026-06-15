/**
 * @module Home
 * The AI-assistant home page (/). Asserts the page loads with its greeting and
 * suggestion prompts, and that sidebar navigation actually changes the URL.
 */

import { HomePage } from '../../pages/HomePage';

const homePage = new HomePage();

describe('Home Page', { tags: ['@smoke', '@sanity', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
    homePage.waitUntilReady();
  });

  context('Happy Path', { tags: ['@smoke'] }, () => {
    it('loads the home page with the personalized greeting', { tags: ['@critical'] }, () => {
      homePage.assertHomeLoaded();
    });

    it('shows the AI assistant suggestion prompts', () => {
      homePage.assertSuggestionsVisible();
    });
  });

  context('Navigation', { tags: ['@regression'] }, () => {
    it('navigates to Jobs and changes the URL', () => {
      cy.navigateTo('/jobs');
      cy.location('pathname').should('eq', '/jobs');
    });

    it('navigates to Dashboard and changes the URL', () => {
      cy.navigateTo('/dashboard');
      cy.location('pathname').should('eq', '/dashboard');
    });

    it('navigates to Candidates and changes the URL', () => {
      cy.navigateTo('/talent-base/candidates');
      cy.location('pathname').should('include', '/talent-base/candidates');
    });

    it('navigates to Pipelines and changes the URL', () => {
      cy.navigateTo('/pipelines');
      cy.location('pathname').should('eq', '/pipelines');
    });

    it('navigates to Templates and changes the URL', () => {
      cy.navigateTo('/templates');
      cy.location('pathname').should('eq', '/templates');
    });

    it('navigates to Imports and changes the URL', () => {
      cy.navigateTo('/talent-base/imports');
      cy.location('pathname').should('include', '/talent-base/imports');
    });
  });

  context('Unauthenticated Access', { tags: ['@critical', '@regression'] }, () => {
    it('redirects an unauthenticated visit to /jobs back to /login', () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit('/jobs');
      cy.location('pathname', { timeout: 15000 }).should('include', '/login');
    });
  });
});
