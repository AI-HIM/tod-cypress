import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

export class HomePage extends BasePage {
  constructor() {
    super('/');
  }

  waitUntilReady() {
    cy.url().should('not.include', '/login');
    cy.get('body').should('be.visible');
    return this;
  }

  assertPageLoaded() {
    cy.url().should('not.include', '/login');
    cy.get('body').should('be.visible');
    return this;
  }

  assertSidebarVisible() {
    cy.get('nav, aside').should('be.visible');
    return this;
  }

  navigateToJobs() {
    return this.navigateTo(SELECTORS.sidebar.jobsLink.replace('a[href="', '').replace('"]', ''));
  }

  navigateToCandidates() {
    return this.navigateTo('/talent-base/candidates');
  }
}
