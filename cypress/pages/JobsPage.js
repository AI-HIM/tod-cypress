import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const S = SELECTORS.jobs;

export class JobsPage extends BasePage {
  constructor() {
    super('/jobs');
  }

  waitUntilReady() {
    cy.url().should('include', '/jobs');
    cy.get('body').should('be.visible');
    return this;
  }

  // ─── Business Unit Actions ─────────────────────────────────────────────────

  clickNewBU() {
    cy.get(S.newBuBtn).should('be.visible').click();
    return this;
  }

  searchBU(term) {
    cy.get(S.searchInput).clear().type(term);
    cy.waitForPageLoad();
    return this;
  }

  clearSearch() {
    cy.get(S.searchInput).clear();
    return this;
  }

  fillBUName(name) {
    cy.get(SELECTORS.modals.buNameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillBUDescription(description) {
    cy.get(SELECTORS.modals.buDescriptionInput).should('be.visible').clear().type(description);
    return this;
  }

  submitModal() {
    cy.contains('button', /save|create|submit/i).click();
    return this;
  }

  cancelModal() {
    cy.contains('button', /cancel/i).click();
    return this;
  }

  // ─── Job Actions ───────────────────────────────────────────────────────────

  clickNewJob() {
    cy.get(S.newJobBtn).should('be.visible').click();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  assertBUVisible(name) {
    cy.get('body').should('contain.text', name);
    return this;
  }

  assertBUNotVisible(name) {
    cy.get('body').should('not.contain.text', name);
    return this;
  }

  assertSearchResultsContain(text) {
    cy.get('body').should('contain.text', text);
    return this;
  }

  assertNoResults() {
    cy.get('body').should(
      'contain.text',
      'No results'
    );
    return this;
  }

  assertNewBUModalVisible() {
    cy.get(SELECTORS.modals.dialog).should('be.visible');
    cy.get(SELECTORS.modals.buNameInput).should('be.visible');
    return this;
  }

  assertNewBUModalClosed() {
    cy.get(SELECTORS.modals.buNameInput).should('not.exist');
    return this;
  }
}
