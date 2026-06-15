import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const S = SELECTORS.candidates;

export class CandidatesPage extends BasePage {
  constructor() {
    super('/talent-base/candidates');
  }

  waitUntilReady() {
    cy.url().should('include', '/talent-base/candidates');
    cy.get('body').should('be.visible');
    return this;
  }

  search(term) {
    cy.get(S.searchInput).clear().type(term);
    cy.waitForPageLoad();
    return this;
  }

  clearSearch() {
    cy.get(S.searchInput).clear();
    return this;
  }

  clickAddCandidate() {
    cy.get(S.addCandidateBtn).should('be.visible').click();
    return this;
  }

  fillFirstName(name) {
    cy.get(S.firstNameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillLastName(name) {
    cy.get(S.lastNameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillEmail(email) {
    cy.get(S.emailInput).should('be.visible').clear().type(email);
    return this;
  }

  fillPhone(phone) {
    cy.get(S.phoneInput).should('be.visible').clear().type(phone);
    return this;
  }

  submitCandidateForm() {
    cy.contains('button', /save|create|add/i).click();
    return this;
  }

  cancelForm() {
    cy.contains('button', /cancel/i).click();
    return this;
  }

  clickCandidate(name) {
    cy.contains(name).click();
    return this;
  }

  assertCandidateVisible(name) {
    cy.get('body').should('contain.text', name);
    return this;
  }

  assertCandidateNotVisible(name) {
    cy.get('body').should('not.contain.text', name);
    return this;
  }

  assertAddCandidateModalVisible() {
    cy.get(SELECTORS.modals.dialog).should('be.visible');
    return this;
  }

  goToNextPage() {
    cy.get(SELECTORS.pagination.nextBtn).should('be.visible').click();
    cy.waitForPageLoad();
    return this;
  }

  goToPreviousPage() {
    cy.get(SELECTORS.pagination.prevBtn).should('be.visible').click();
    cy.waitForPageLoad();
    return this;
  }
}
