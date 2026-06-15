import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const S = SELECTORS.jobs;
const M = SELECTORS.modal;
const T = SELECTORS.toast;

/**
 * Page object for the /jobs page (Business Units list + New BU dialog + row "More" menu).
 *
 * Verified live (2026-06-15) against todapp-dev:
 *  - Create success toast text: `Business Unit "<name>" created`
 *  - BU card link: a[aria-label="Open <name>"]
 *  - Empty name → dialog stays open, inline error "Name is required", no toast
 *  - Row "More" (Radix dropdown) menu items: Edit, Assign vendors, Assign managers, Delete BU
 *  - "Delete BU" opens a confirm [role="dialog"] titled `Delete BU "<name>"?` whose
 *    confirm button is also labelled "Delete BU"; confirming toasts `... deleted` and
 *    removes the card.
 */
export class JobsPage extends BasePage {
  constructor() {
    super('/jobs');
  }

  waitUntilReady() {
    cy.url().should('include', '/jobs');
    cy.contains('h1, h2', S.heading).should('be.visible');
    return this;
  }

  // ─── Locators ───────────────────────────────────────────────────────────────

  buCardFor(name) {
    return cy.get(`a[aria-label="Open ${name}"]`);
  }

  // ─── Business Unit – list / search ──────────────────────────────────────────

  searchBU(term) {
    cy.get(S.searchInput).clear().type(term);
    cy.waitForPageLoad();
    return this;
  }

  clearSearch() {
    cy.get(S.searchInput).clear();
    cy.waitForPageLoad();
    return this;
  }

  // ─── Business Unit – create ─────────────────────────────────────────────────

  openNewBU() {
    cy.get(S.newBuBtn).should('be.visible').click();
    cy.get(M.dialog).should('be.visible');
    cy.contains(M.title, /new business unit/i).should('be.visible');
    return this;
  }

  fillBUName(name) {
    cy.get(S.buNameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillBUDescription(description) {
    cy.get(S.buDescriptionInput).should('be.visible').clear().type(description);
    return this;
  }

  /** Click the dialog's "Create BU" submit button. */
  submitCreate() {
    cy.contains(`${M.dialog} button`, /^Create BU$/).click();
    return this;
  }

  cancelDialog() {
    cy.contains(`${M.dialog} button`, /^Cancel$/).click();
    return this;
  }

  closeDialog() {
    cy.get(M.closeBtn).click();
    return this;
  }

  /** Full create flow: open dialog, fill, submit. */
  createBU(name, description) {
    this.openNewBU();
    this.fillBUName(name);
    if (description) this.fillBUDescription(description);
    this.submitCreate();
    return this;
  }

  // ─── Business Unit – delete (row "More" menu → confirm dialog) ───────────────

  /**
   * Delete a BU by searching for its unique name, opening the (single) row's
   * "More" menu, choosing "Delete BU", and confirming in the dialog.
   */
  deleteBU(name) {
    this.searchBU(name);
    this.buCardFor(name).should('exist');
    cy.get(S.rowMoreBtn).first().click();
    cy.contains(SELECTORS.sidebar.menuItem, /^Delete BU$/).should('be.visible').click();
    cy.get(M.dialog).should('be.visible');
    cy.contains(M.title, new RegExp(`Delete BU`, 'i')).should('be.visible');
    cy.contains(`${M.dialog} button`, /^Delete BU$/).click();
    return this;
  }

  // ─── Job ────────────────────────────────────────────────────────────────────

  clickNewJob() {
    cy.get(S.newJobBtn).should('be.visible').click();
    return this;
  }

  // ─── Assertions ─────────────────────────────────────────────────────────────

  assertCreateSuccess(name) {
    cy.contains(T.success, `Business Unit "${name}" created`, { timeout: 15000 }).should(
      'be.visible'
    );
    return this;
  }

  assertDeleteSuccess(name) {
    cy.contains(T.success, `Business Unit "${name}" deleted`, { timeout: 15000 }).should(
      'be.visible'
    );
    return this;
  }

  assertBUExists(name) {
    this.buCardFor(name).should('exist');
    return this;
  }

  assertBUNotExists(name) {
    this.buCardFor(name).should('not.exist');
    return this;
  }

  assertInlineRequiredError() {
    cy.get(M.dialog).should('be.visible').and('contain.text', 'Name is required');
    return this;
  }

  assertDialogOpen() {
    cy.get(M.dialog).should('be.visible');
    return this;
  }

  assertDialogClosed() {
    cy.get(S.buNameInput).should('not.exist');
    return this;
  }

  assertNoSuccessToast() {
    cy.get('[data-sonner-toast][data-type="success"]').should('not.exist');
    return this;
  }
}
