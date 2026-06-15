import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor() {
    super('/dashboard');
  }

  waitUntilReady() {
    cy.url().should('include', '/dashboard');
    cy.get('body').should('be.visible');
    return this;
  }

  assertMetricVisible(label) {
    cy.get('body').should('contain.text', label);
    return this;
  }

  assertChartsRendered() {
    cy.get('canvas, svg, [class*="chart"]', { timeout: 10000 }).should('exist');
    return this;
  }

  assertPageHeading() {
    cy.get('body').should('contain.text', 'Dashboard');
    return this;
  }
}
