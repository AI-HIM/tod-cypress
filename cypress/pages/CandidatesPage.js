import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const S = SELECTORS.candidates;
const M = SELECTORS.modal;

/**
 * Page object for the Candidates (Talent Base) module.
 *
 * LIST page (/talent-base/candidates):
 *  - No heading text — identified by URL and table headers.
 *  - Table headers: Candidate Name, Email, Phone, Title, Location, Experience, Added
 *  - Search: [placeholder="Search"]
 *  - Filters: No filters / Created Date popover buttons
 *  - Row checkboxes: input[type="checkbox"][aria-label^="Select "]
 *  - Pagination: [aria-label="Previous/Next page"]
 *
 * ADD CANDIDATE dialog — resume-upload flow (verified live):
 *  - The modal has NO first name / last name / email / phone text fields.
 *  - Fields: input[type="file"] (resume), Search jobs input, Search buckets input.
 *  - Buttons: Cancel, "Add Candidate".
 */
export class CandidatesPage extends BasePage {
  constructor() {
    super('/talent-base/candidates');
  }

  waitUntilReady() {
    cy.url().should('include', '/talent-base/candidates');
    cy.get('table thead', { timeout: 15000 }).should('be.visible');
    return this;
  }

  // ─── List ─────────────────────────────────────────────────────────────────────

  assertTableHeadersVisible() {
    S.tableHeaders.forEach((header) => {
      cy.get('table thead').should('contain.text', header);
    });
    return this;
  }

  assertHasCandidates() {
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    return this;
  }

  // ─── Search ──────────────────────────────────────────────────────────────────

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

  // ─── Add Candidate dialog ─────────────────────────────────────────────────────

  openAddCandidate() {
    cy.get(S.addCandidateBtn).should('be.visible').click();
    cy.get(M.dialog).should('be.visible');
    cy.contains(M.dialog, 'Add Candidate').should('be.visible');
    return this;
  }

  uploadResume(fixturePath) {
    cy.get(S.resumeInput).selectFile(`cypress/fixtures/${fixturePath}`, { force: true });
    return this;
  }

  searchJob(term) {
    cy.get(S.searchJobsInput).should('be.visible').clear().type(term);
    return this;
  }

  searchBucket(term) {
    cy.get(S.searchBucketsInput).should('be.visible').clear().type(term);
    return this;
  }

  submitAddCandidate() {
    cy.contains('[role="dialog"] button', /add candidate/i).click();
    return this;
  }

  cancelAddCandidate() {
    cy.get(S.cancelBtn).should('be.visible').click();
    cy.get(M.dialog).should('not.exist');
    return this;
  }

  assertAddCandidateDialogVisible() {
    cy.get(M.dialog).should('be.visible');
    cy.contains(M.dialog, 'Add Candidate').should('be.visible');
    cy.get(S.resumeInput).should('exist');
    return this;
  }

  assertDialogClosed() {
    cy.get(M.dialog).should('not.exist');
    return this;
  }

  // ─── Candidate actions ────────────────────────────────────────────────────────

  clickCandidate(nameText) {
    cy.get('table tbody tr').contains(nameText).click();
    return this;
  }

  selectFirstCandidate() {
    cy.get(S.rowCheckbox).first().check();
    return this;
  }

  // ─── Pagination ──────────────────────────────────────────────────────────────

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

  hasPagination() {
    return cy.get('body').then(($body) => $body.find(SELECTORS.pagination.nextBtn).length > 0);
  }
}
