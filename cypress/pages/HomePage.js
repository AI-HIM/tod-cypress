import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor() {
    super('/');
  }

  waitUntilReady() {
    cy.location('pathname', { timeout: 15000 }).should('eq', '/');
    return this;
  }

  /**
   * Assert the AI assistant home page loaded.
   * The heading format is "Hey <Name>, what's up?" — match only the static
   * "what's up?" suffix so this works for any logged-in user.
   */
  assertHomeLoaded() {
    cy.location('pathname').should('eq', '/');
    cy.contains(/what['']s up\??/i, { timeout: 15000 }).should('be.visible');
    return this;
  }

  /** Assert at least one AI suggestion prompt button is visible. */
  assertSuggestionsVisible() {
    // Suggestion buttons are rendered as <button> elements.
    // Assert at least one prompt button is present without depending on exact text.
    cy.get('button', { timeout: 15000 })
      .filter(':visible')
      .should('have.length.greaterThan', 0);
    return this;
  }

  navigateToHref(href) {
    cy.navigateTo(href);
    cy.location('pathname').should('include', href);
    return this;
  }
}
