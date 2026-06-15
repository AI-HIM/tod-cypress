import { SELECTORS } from '../../support/utils/helpers';

const S = SELECTORS.table;

export class Table {
  assertContains(text) {
    cy.get('body').should('contain.text', text);
    return this;
  }

  assertRowExists(text) {
    cy.get(S.rows).should('contain.text', text);
    return this;
  }

  assertHeaders(headers) {
    headers.forEach((header) => {
      cy.get(S.headers).should('contain.text', header);
    });
    return this;
  }

  assertEmpty() {
    cy.get(S.rows).should('not.exist');
    return this;
  }

  clickRow(text) {
    cy.get(S.rows).contains(text).closest('tr').click();
    return this;
  }

  clickRowAction(rowText, actionText) {
    cy.get(S.rows)
      .contains(rowText)
      .closest('tr')
      .within(() => {
        cy.contains(actionText).click();
      });
    return this;
  }

  sortByColumn(header) {
    cy.get(S.headers).contains(header).click();
    cy.waitForPageLoad();
    return this;
  }

  assertRowCount(count) {
    cy.get(S.rows).should('have.length', count);
    return this;
  }

  assertRowCountAtLeast(count) {
    cy.get(S.rows).should('have.length.gte', count);
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
