import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor() {
    super('/');
  }

  waitUntilReady() {
    cy.location('pathname', { timeout: 15000 }).should('eq', '/');
    return this;
  }

  /** The home page is the AI assistant; assert it loaded by its greeting + a prompt suggestion. */
  assertHomeLoaded() {
    cy.location('pathname').should('eq', '/');
    // Rotating greeting always addresses the signed-in user "Sowmya".
    cy.contains('Sowmya', { timeout: 15000 }).should('be.visible');
    return this;
  }

  /** Assert at least one of the AI suggestion prompt buttons is present. */
  assertSuggestionsVisible() {
    cy.contains('button', /draft a jd/i, { timeout: 15000 }).should('be.visible');
    return this;
  }

  /** Navigate to a destination by sidebar href and assert the pathname changed. */
  navigateToHref(href) {
    cy.navigateTo(href);
    cy.location('pathname').should('include', href);
    return this;
  }
}
