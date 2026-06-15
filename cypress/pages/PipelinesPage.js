import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const M = SELECTORS.modals;

export class PipelinesPage extends BasePage {
  constructor() {
    super('/pipelines');
  }

  waitUntilReady() {
    cy.url().should('include', '/pipelines');
    cy.get('body').should('be.visible');
    return this;
  }

  clickNewPipeline() {
    cy.contains('button', /new pipeline/i).click();
    return this;
  }

  fillName(name) {
    cy.get(M.pipelineNameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillDescription(description) {
    cy.get(M.pipelineDescriptionInput).clear().type(description);
    return this;
  }

  submit() {
    cy.contains('button', /save|create|submit/i).click();
    return this;
  }

  cancel() {
    cy.contains('button', /cancel/i).click();
    return this;
  }

  search(term) {
    cy.get('[placeholder*="Search"]').clear().type(term);
    cy.waitForPageLoad();
    return this;
  }

  assertPipelineVisible(name) {
    cy.get('body').should('contain.text', name);
    return this;
  }

  assertPipelineNotVisible(name) {
    cy.get('body').should('not.contain.text', name);
    return this;
  }

  assertModalVisible() {
    cy.get(M.dialog).should('be.visible');
    cy.get(M.pipelineNameInput).should('be.visible');
    return this;
  }

  assertModalClosed() {
    cy.get(M.pipelineNameInput).should('not.exist');
    return this;
  }

  clickPipeline(name) {
    cy.contains(name).click();
    return this;
  }
}
