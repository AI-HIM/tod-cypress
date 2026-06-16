/**
 * @module Pipelines
 *
 * Verified live (2026-06-16):
 *  - "New Pipeline" is an anchor link a[href="/pipelines/new"] — NOT a modal button.
 *  - Creation page at /pipelines/new has #pipeline-name (text) and
 *    #pipeline-description (textarea). The save button is a plain
 *    <button data-slot="button"> with NO type="submit" attribute — select it
 *    by its visible text "Save Pipeline", never button[type="submit"].
 *  - After save, the app redirects to /pipelines where the new card appears as
 *    a[aria-label="Open <name>"].
 *  - Delete: button[title="Delete pipeline"] per card → confirm dialog,
 *    rendered as role="alertdialog" (not a plain role="dialog").
 *  - There is NO search input on the /pipelines list page.
 */

import { PipelinesPage } from '../../pages/PipelinesPage';
import { dataFactory } from '../../support/utils/dataFactory';
import { unique, maxLengthString, SQL_INJECTION, XSS_PROBE, SELECTORS } from '../../support/utils/helpers';

const CONFIRM_DIALOG = SELECTORS.modal.confirmDialog;

const page = new PipelinesPage();

describe('Pipelines', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/pipelines');
    page.waitUntilReady();
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read - list page', { tags: ['@smoke'] }, () => {
    it('loads the pipelines page with heading and New Pipeline link', { tags: ['@smoke', '@critical'] }, () => {
      cy.contains('h1, h2', 'Pipelines').should('be.visible');
      cy.get('a[href="/pipelines/new"]').should('be.visible');
    });

    it('displays at least one existing pipeline card', { tags: ['@smoke'] }, () => {
      cy.get('a[aria-label^="Open "]').should('have.length.greaterThan', 0);
    });

    it('shows a delete control for each pipeline card', { tags: ['@regression'] }, () => {
      cy.get('button[title="Delete pipeline"]').should('have.length.greaterThan', 0);
    });

    it('clicking a pipeline card navigates to its detail page', { tags: ['@regression'] }, () => {
      cy.get('a[aria-label^="Open "]').first().click();
      cy.url().should('match', /\/pipelines\/[0-9a-f-]{36}$/);
    });
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  context('Create - New Pipeline (full-page form)', { tags: ['@crud', '@create'] }, () => {
    it('navigates to the create form via the New Pipeline link', { tags: ['@smoke'] }, () => {
      page.clickNewPipeline();
      cy.contains('h1, h2', 'New Pipeline').should('be.visible');
      cy.get('#pipeline-name').should('be.visible');
    });

    it('creates a pipeline with name and description, then deletes it', { tags: ['@smoke', '@critical'] }, () => {
      const pipeline = dataFactory.pipeline();
      page.createPipeline(pipeline.name, pipeline.description);
      page.assertPipelineExists(pipeline.name);

      page.deletePipeline(pipeline.name);
      page.assertPipelineNotExists(pipeline.name);
    });

    it('creates a pipeline with name only (description optional), then deletes it', { tags: ['@regression'] }, () => {
      const name = unique('PIP');
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });

    it('stores special characters literally in the pipeline name, then deletes it', { tags: ['@regression'] }, () => {
      const name = `${unique('PIP')} & Co. #1`;
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });

    it('treats an SQL-injection probe as literal text, then deletes it', { tags: ['@regression', '@security'] }, () => {
      const name = `${unique('PIP')} ${SQL_INJECTION}`;
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });

    it('treats an XSS probe as literal text (no script execution), then deletes it', { tags: ['@regression', '@security'] }, () => {
      const name = `${unique('PIP')} ${XSS_PROBE}`;
      cy.on('window:alert', () => { throw new Error('XSS payload executed'); });
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });

    it('accepts a max-length (100 char) name, then deletes it', { tags: ['@regression', '@boundary'] }, () => {
      const name = `${unique('PIP')}_${maxLengthString(100 - 12)}`;
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });
  });

  // ─── VALIDATION ────────────────────────────────────────────────────────────

  context('Validation - create form', { tags: ['@validation', '@negative'] }, () => {
    it('stays on the create page when name is empty', { tags: ['@regression'] }, () => {
      cy.visit('/pipelines/new');
      cy.contains('h1, h2', 'New Pipeline').should('be.visible');
      cy.get('#pipeline-name').should('be.visible').and('have.value', '');
      cy.contains('button', 'Save Pipeline').click();
      // Without a name the form should not redirect
      cy.url().should('include', '/pipelines/new');
    });
  });

  // ─── DELETE ────────────────────────────────────────────────────────────────

  context('Delete - confirm dialog', { tags: ['@crud', '@delete'] }, () => {
    it('removes a pipeline after confirming the delete dialog', { tags: ['@critical'] }, () => {
      const name = unique('PIP');
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });

    it('keeps the pipeline when the delete dialog is cancelled, then cleans up', { tags: ['@regression'] }, () => {
      const name = unique('PIP');
      page.createPipeline(name);
      page.assertPipelineExists(name);

      // Open the delete dialog and cancel
      // scrollIntoView() first — the list container scrolls and can clip the card.
      page.pipelineCardFor(name)
        .scrollIntoView()
        .parent()
        .find('button[title="Delete pipeline"]')
        .should('be.visible')
        .click();
      // Renders as role="alertdialog", not a plain dialog (confirmed live).
      cy.get(CONFIRM_DIALOG).should('be.visible').contains('button', /cancel/i).click();

      // Pipeline should still exist
      cy.get(CONFIRM_DIALOG).should('not.exist');
      page.assertPipelineExists(name);

      // Cleanup
      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });
  });
});
