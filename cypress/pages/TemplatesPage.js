import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const S = SELECTORS.templates;
const TF = SELECTORS.templateForm;
const FF = SELECTORS.folderForm;
const M = SELECTORS.modal;

/**
 * Page object for the Templates module.
 *
 * LIST page (/templates):
 *  - Heading "Message Templates"
 *  - "New Template" → a[href="/templates/new"] (link, NOT a modal)
 *  - "New Folder"   → a[href="/templates/folders/new"] (link, NOT a modal)
 *  - Folder cards have button[title="Delete folder"]
 *
 * CREATE TEMPLATE page (/templates/new) — full-page form:
 *  - #template-name (required)
 *  - #template-description (optional)
 *  - #template-subject (email subject)
 *  - textarea for message body
 *  - "Save Template" button — plain <button data-slot="button">, NO
 *    type="submit" attribute; must be selected by visible text.
 *
 * CREATE FOLDER page (/templates/folders/new) — full-page form:
 *  - #folder-name (required)
 *  - #folder-description (optional)
 *  - "Create Folder" button — same caveat, no type="submit" attribute.
 *
 * No individual template ever has a delete affordance in this app (confirmed
 * live: zero buttons on its list-page card, and its detail/edit page exposes
 * only a Save button). Only folders are deletable.
 */
export class TemplatesPage extends BasePage {
  constructor() {
    super('/templates');
  }

  waitUntilReady() {
    cy.url().should('include', '/templates');
    cy.contains('h1, h2', S.heading).should('be.visible');
    return this;
  }

  // ─── List page ───────────────────────────────────────────────────────────────

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

  assertTemplateVisible(name) {
    cy.get('body').should('contain.text', name);
    return this;
  }

  assertTemplateNotVisible(name) {
    cy.get('body').should('not.contain.text', name);
    return this;
  }

  assertFolderVisible(name) {
    cy.get('body').should('contain.text', name);
    return this;
  }

  assertFolderNotVisible(name) {
    cy.get('body').should('not.contain.text', name);
    return this;
  }

  // ─── Delete Folder ────────────────────────────────────────────────────────────

  /**
   * Delete a folder by its visible name.
   *
   * Folder cards use plain Tailwind utility classes with no semantic hook
   * (no class containing the literal word "folder"), so walking up from the
   * name text via .closest() lands on whichever ancestor div matches first —
   * which is too narrow to also contain the delete button as a descendant.
   * Instead, search by the (unique) name to isolate exactly one folder card,
   * then click its single button[title="Delete folder"] directly.
   */
  deleteFolder(name) {
    this.search(name);
    cy.contains(name).should('be.visible');
    cy.get(S.deleteFolderBtn).should('have.length', 1).click();

    // Folder deletion always shows a confirmation dialog (same UX as BU/Pipeline deletion).
    cy.get(M.dialog, { timeout: 10000 }).should('be.visible');
    cy.contains(`${M.dialog} button`, /delete|confirm/i).last().click();
    cy.get(M.dialog).should('not.exist');
    return this;
  }

  // ─── Create Template (full-page form at /templates/new) ──────────────────────

  clickNewTemplate() {
    cy.get(S.newTemplateLink).should('be.visible').click();
    cy.url().should('include', '/templates/new');
    return this;
  }

  fillTemplateName(name) {
    cy.get(TF.nameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillTemplateDescription(description) {
    cy.get(TF.descriptionInput).clear().type(description);
    return this;
  }

  fillTemplateSubject(subject) {
    cy.get(TF.subjectInput).should('be.visible').clear().type(subject);
    return this;
  }

  fillTemplateBody(body) {
    cy.get(TF.bodyTextarea).clear().type(body);
    return this;
  }

  saveTemplate() {
    cy.get(TF.saveBtn).should('be.visible').click();
    return this;
  }

  /** Full create flow: visit /templates/new, fill required fields, submit. */
  createTemplate(name, subject, description) {
    cy.visit('/templates/new');
    this.fillTemplateName(name);
    if (subject) this.fillTemplateSubject(subject);
    if (description) this.fillTemplateDescription(description);
    this.saveTemplate();
    // After save, the app redirects back to /templates
    cy.url().should('include', '/templates');
    cy.url().should('not.include', '/new');
    return this;
  }

  // ─── Create Folder (full-page form at /templates/folders/new) ────────────────

  clickNewFolder() {
    cy.get(S.newFolderLink).should('be.visible').click();
    cy.url().should('include', '/templates/folders/new');
    return this;
  }

  fillFolderName(name) {
    cy.get(FF.nameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillFolderDescription(description) {
    cy.get(FF.descriptionInput).clear().type(description);
    return this;
  }

  saveFolder() {
    cy.get(FF.saveBtn).should('be.visible').click();
    return this;
  }

  /** Full create flow: visit /templates/folders/new, fill name, submit. */
  createFolder(name, description) {
    cy.visit('/templates/folders/new');
    this.fillFolderName(name);
    if (description) this.fillFolderDescription(description);
    this.saveFolder();
    // After save, the app redirects back to /templates
    cy.url().should('include', '/templates');
    cy.url().should('not.include', '/new');
    return this;
  }

  // ─── Validation ───────────────────────────────────────────────────────────────

  assertTemplateFormStaysOpen() {
    cy.url().should('include', '/templates/new');
    return this;
  }

  assertFolderFormStaysOpen() {
    cy.url().should('include', '/templates/folders/new');
    return this;
  }
}
