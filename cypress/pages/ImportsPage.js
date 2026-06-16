import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const S = SELECTORS.imports;
const M = SELECTORS.modal;

export class ImportsPage extends BasePage {
  constructor() {
    super('/talent-base/imports');
  }

  waitUntilReady() {
    cy.url().should('include', '/talent-base/imports');
    cy.get('table thead', { timeout: 15000 }).should('be.visible');
    return this;
  }

  assertTableHeadersVisible() {
    S.tableHeaders.forEach((header) => {
      cy.get('table thead').should('contain.text', header);
    });
    return this;
  }

  search(term) {
    cy.get(S.searchInput).clear().type(term);
    cy.waitForPageLoad();
    return this;
  }

  clearSearch() {
    cy.get(S.searchInput).clear();
    cy.waitForPageLoad();
    return this;
  }

  clickNewImport() {
    cy.get(S.newImportBtn).should('be.visible').click();
    cy.get(M.dialog).should('be.visible');
    return this;
  }

  fillName(name) {
    cy.get(S.importNameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillDescription(description) {
    cy.get(S.importDescriptionInput).clear().type(description);
    return this;
  }

  uploadFile(fixturePath) {
    cy.get('[type="file"]').selectFile(`cypress/fixtures/${fixturePath}`, { force: true });
    return this;
  }

  submit() {
    cy.contains(`${M.dialog} button`, /save|create|next|import/i).click();
    return this;
  }

  cancel() {
    cy.contains(`${M.dialog} button`, /cancel/i).click();
    return this;
  }

  assertImportVisible(name) {
    cy.get('table tbody').should('contain.text', name);
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
