import { BasePage } from './BasePage';

export class MergeRequestsPage extends BasePage {
  constructor() {
    super('/talent-base/merge-requests');
  }

  waitUntilReady() {
    cy.url().should('include', '/talent-base/merge-requests');
    cy.get('body').should('be.visible');
    return this;
  }

  search(term) {
    cy.get('[placeholder*="Search"]').clear().type(term);
    cy.waitForPageLoad();
    return this;
  }

  clickMergeRequest(text) {
    cy.contains(text).click();
    return this;
  }

  assertMergeRequestVisible(text) {
    cy.get('body').should('contain.text', text);
    return this;
  }

  assertNoMergeRequests() {
    cy.get('body').should('contain.text', 'No');
    return this;
  }

  approveRequest() {
    cy.contains('button', /approve/i).click();
    return this;
  }

  rejectRequest() {
    cy.contains('button', /reject|decline/i).click();
    return this;
  }
}
