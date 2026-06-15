import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const M = SELECTORS.modals;

export class TemplatesPage extends BasePage {
  constructor() {
    super('/templates');
  }

  waitUntilReady() {
    cy.url().should('include', '/templates');
    cy.get('body').should('be.visible');
    return this;
  }

  clickNewTemplate() {
    cy.contains('button', /new template/i).click();
    return this;
  }

  clickNewFolder() {
    cy.contains('button', /new folder/i).click();
    return this;
  }

  fillTemplateName(name) {
    cy.get(M.templateNameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillTemplateSubject(subject) {
    cy.get(M.templateSubjectInput).should('be.visible').clear().type(subject);
    return this;
  }

  fillTemplateDescription(description) {
    cy.get(M.templateDescriptionInput).clear().type(description);
    return this;
  }

  fillFolderName(name) {
    cy.get(M.folderNameInput).should('be.visible').clear().type(name);
    return this;
  }

  search(term) {
    cy.get('[placeholder*="Search"]').clear().type(term);
    cy.waitForPageLoad();
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

  assertTemplateVisible(name) {
    cy.get('body').should('contain.text', name);
    return this;
  }

  assertTemplateNotVisible(name) {
    cy.get('body').should('not.contain.text', name);
    return this;
  }

  assertModalVisible() {
    cy.get(M.dialog).should('be.visible');
    return this;
  }

  assertModalClosed() {
    cy.get(M.dialog).should('not.exist');
    return this;
  }
}
