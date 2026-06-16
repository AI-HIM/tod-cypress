import { BasePage } from './BasePage';
import { SELECTORS, cardByOpenLabel } from '../support/utils/helpers';

const S = SELECTORS.pipelines;
const F = SELECTORS.pipelineForm;
const M = SELECTORS.modal;

/**
 * Page object for the Pipelines module.
 *
 * LIST page (/pipelines):
 *  - Heading "Pipelines"
 *  - "New Pipeline" is an anchor link to /pipelines/new, NOT a modal button.
 *  - Pipeline cards: a[aria-label="Open <name>"]
 *  - Per-card delete: button[title="Delete pipeline"]
 *
 * CREATE page (/pipelines/new) — full-page form (not a modal):
 *  - #pipeline-name (text input)
 *  - #pipeline-description (textarea, optional)
 *  - "Save Pipeline" button — plain <button data-slot="button">, NO
 *    type="submit" attribute; must be selected by visible text.
 *  - Saving requires at least one stage (via "Add Stage"), and every stage
 *    requires a name — otherwise Save rejects with a toast ("Please add at
 *    least one stage" / "Please name stage N") and stays on /pipelines/new.
 *  - On success, redirects to the new pipeline's OWN detail page
 *    (/pipelines/<uuid>), NOT back to the /pipelines list.
 *
 * DELETE flow:
 *  - button[title="Delete pipeline"] on the card opens a confirm dialog
 *    rendered with role="alertdialog" (confirmed live 2026-06-16), not a
 *    plain role="dialog" like the create/edit modals elsewhere in the app —
 *    use SELECTORS.modal.confirmDialog, which matches both.
 *  - Confirm button text verified live.
 */
export class PipelinesPage extends BasePage {
  constructor() {
    super('/pipelines');
  }

  waitUntilReady() {
    cy.url().should('include', '/pipelines');
    cy.contains('h1, h2', S.heading).should('be.visible');
    return this;
  }

  // ─── List page ───────────────────────────────────────────────────────────────

  pipelineCardFor(name) {
    return cardByOpenLabel(name);
  }

  assertPipelineExists(name) {
    this.pipelineCardFor(name).should('exist');
    return this;
  }

  assertPipelineNotExists(name) {
    this.pipelineCardFor(name).should('not.exist');
    return this;
  }

  // ─── Create (full-page form at /pipelines/new) ────────────────────────────────

  /** Navigate to the create form by clicking the "New Pipeline" link. */
  clickNewPipeline() {
    cy.get(S.newPipelineLink).should('be.visible').click();
    cy.url().should('include', '/pipelines/new');
    return this;
  }

  fillName(name) {
    cy.get(F.nameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillDescription(description) {
    cy.get(F.descriptionInput).should('be.visible').clear().type(description);
    return this;
  }

  /** Add a stage and give it a name (both required before the pipeline can be saved). */
  addStage(stageName) {
    cy.get(F.addStageBtn).should('be.visible').click();
    cy.get(F.stageNameInput).last().should('be.visible').clear().type(stageName);
    return this;
  }

  savePipeline() {
    cy.get(F.saveBtn).should('be.visible').click();
    return this;
  }

  /** Full create flow: navigate to /pipelines/new, fill, add a required stage, submit. */
  createPipeline(name, description) {
    cy.visit('/pipelines/new');
    this.fillName(name);
    if (description) this.fillDescription(description);
    this.addStage(`${name} Stage 1`);
    this.savePipeline();
    // On success, the app redirects to the new pipeline's own detail page.
    cy.url().should('match', /\/pipelines\/[0-9a-f-]{36}$/);
    // Return to the list page so callers can assert card visibility / delete it.
    cy.visit('/pipelines');
    return this;
  }

  /** Assert creation success — pipeline card appears on list. */
  assertCreateSuccess(name) {
    this.pipelineCardFor(name).should('exist');
    return this;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────

  /**
   * Delete a pipeline by finding its card and clicking the per-card delete button.
   * Confirms in the dialog that appears.
   */
  deletePipeline(name) {
    // The list container scrolls (overflow-auto) and can hold many cards, so the
    // target card's delete button is often clipped until scrolled into view —
    // confirmed live: .should('be.visible') alone fails with a "clipped by an
    // overflow ancestor" error because it doesn't trigger a scroll.
    this.pipelineCardFor(name)
      .should('exist')
      .scrollIntoView()
      .parent()
      .find(S.deleteBtn)
      .should('be.visible')
      .click();

    // Confirm dialog — renders as role="alertdialog", not a plain dialog
    // (confirmed live 2026-06-16); M.confirmDialog matches both.
    cy.get(M.confirmDialog).should('be.visible');
    cy.get(M.confirmDialog).find('button').filter(':contains("Delete")').last().click();
    return this;
  }

  assertDeleteSuccess(name) {
    this.pipelineCardFor(name).should('not.exist');
    return this;
  }

  // ─── Validation (on /pipelines/new) ──────────────────────────────────────────

  assertNameRequired() {
    // After submitting with no name the form should stay on /pipelines/new
    // OR show an inline validation message.
    cy.url().should('include', '/pipelines/new');
    return this;
  }

  assertFormStaysOpen() {
    cy.url().should('include', '/pipelines/new');
    return this;
  }
}
