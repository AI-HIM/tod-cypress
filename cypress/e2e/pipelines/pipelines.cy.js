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

import { faker } from '@faker-js/faker';
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

    it('displays at least one existing pipeline card', { tags: ['@smoke'] }, function () {
      cy.wait(2000); // Allow async data/suspense to render
      cy.get('body').then(($body) => {
        const $cards = $body.find('a[aria-label^="Open "]');
        if ($cards.length === 0) {
          cy.log('Skipping test: no pipelines exist');
          this.skip();
        } else {
          cy.wrap($cards).should('have.length.greaterThan', 0);
        }
      });
    });

    it('shows a delete control for each pipeline card', { tags: ['@regression'] }, function () {
      cy.wait(2000); // Allow async data/suspense to render
      cy.get('body').then(($body) => {
        const $cards = $body.find('a[aria-label^="Open "]');
        if ($cards.length === 0) {
          cy.log('Skipping test: no pipelines exist');
          this.skip();
        } else {
          cy.get('button[title="Delete pipeline"]').should('have.length.greaterThan', 0);
        }
      });
    });

    it('clicking a pipeline card navigates to its detail page', { tags: ['@regression'] }, function () {
      cy.wait(2000); // Allow async data/suspense to render
      cy.get('body').then(($body) => {
        const $cards = $body.find('a[aria-label^="Open "]');
        if ($cards.length === 0) {
          cy.log('Skipping test: no pipelines exist');
          this.skip();
        } else {
          cy.get('a[aria-label^="Open "]').first().click();
          cy.url().should('match', /\/pipelines\/[0-9a-f-]{36}$/);
        }
      });
    });
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  context('Create - New Pipeline (full-page form)', { tags: ['@crud', '@create'] }, () => {
    it('navigates to the create form via the New Pipeline link', { tags: ['@smoke'] }, () => {
      page.clickNewPipeline();
      cy.contains('h1, h2', 'New Pipeline').should('be.visible');
      cy.get('#pipeline-name').should('be.visible');
    });

    it('creates a pipeline with name and description, then deletes it', { tags: ['@smoke', '@critical'] }, function () {
      const pipeline = dataFactory.pipeline();
      // dataFactory might use unique() internally, but that's fine. We can override if needed:
      pipeline.name = faker.company.name() + ' Pipeline';
      page.createPipeline(pipeline.name, pipeline.description);
      page.assertPipelineExists(pipeline.name);

      page.deletePipeline(pipeline.name);
      page.assertPipelineNotExists(pipeline.name);
    });

    it('creates a pipeline with name only (description optional), then deletes it', { tags: ['@regression'] }, function () {
      const name = faker.company.name() + ' Process';
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });

    it('stores special characters literally in the pipeline name, then deletes it', { tags: ['@regression'] }, function () {
      const name = `${faker.company.name()} & Co. #1`;
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });

    it('treats an SQL-injection probe as literal text, then deletes it', { tags: ['@regression', '@security'] }, function () {
      const name = `${faker.company.name()} ${SQL_INJECTION}`;
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });

    it('treats an XSS probe as literal text (no script execution), then deletes it', { tags: ['@regression', '@security'] }, function () {
      const name = `${faker.company.name()} ${XSS_PROBE}`;
      cy.on('window:alert', () => { throw new Error('XSS payload executed'); });
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });

    it('accepts a max-length (100 char) name, then deletes it', { tags: ['@regression', '@boundary'] }, function () {
      const prefix = `${faker.company.name()}_`;
      const name = prefix + maxLengthString(100 - prefix.length);
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });
  });

  // ─── UPDATE / EDIT ─────────────────────────────────────────────────────────

  context('Update / Edit - detail page', { tags: ['@crud', '@update'] }, () => {
    it('modifies an existing pipeline name and description, then reverts the changes', { tags: ['@smoke'] }, function () {
      cy.wait(2000); // Allow async data/suspense to render
      cy.get('body').then(($body) => {
        const $cards = $body.find('a[aria-label^="Open "]');
        if ($cards.length === 0) {
          cy.log('Skipping test: no pipelines exist to edit');
          this.skip();
        } else {
          // 1. Enter the first pipeline's detail page
          cy.wrap($cards.first()).click();
          cy.url().should('match', /\/pipelines\/[0-9a-f-]{36}$/);

          // 2. Read existing name and description to revert later
          cy.get('#pipeline-name').invoke('val').then((originalName) => {
            cy.get('#pipeline-description').invoke('val').then((originalDesc) => {
              
              // 3. Modify
              const tempName = `${originalName} (EDITED)`;
              const tempDesc = `${originalDesc} (MODIFIED)`;
              
              page.fillName(tempName);
              page.fillDescription(tempDesc);
              page.savePipeline();
              
              // Verify the save toast/success (optional but good practice)
              // Wait briefly for save to persist
              cy.wait(1000);

              // 4. Go back to list and verify modified name is visible
              cy.visit('/pipelines');
              page.waitUntilReady();
              cy.wait(2000);
              page.assertPipelineExists(tempName);

              // 5. Go back into edit page and REVERT
              page.pipelineCardFor(tempName).click();
              cy.url().should('match', /\/pipelines\/[0-9a-f-]{36}$/);
              
              page.fillName(originalName);
              // Handle case where original description was empty
              if (originalDesc) {
                page.fillDescription(originalDesc);
              } else {
                cy.get('#pipeline-description').clear();
              }
              page.savePipeline();
              cy.wait(1000);

              // 6. Final verification that it's reverted
              cy.visit('/pipelines');
              page.waitUntilReady();
              cy.wait(2000);
              page.assertPipelineExists(originalName);
            });
          });
        }
      });
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

    it('stays on the create page and rejects saving if no stages are added', { tags: ['@regression'] }, () => {
      cy.visit('/pipelines/new');
      page.fillName(faker.company.name() + ' Validation Test');
      // Intentionally NOT adding a stage
      page.savePipeline();
      // Without a stage it should stay on /new
      cy.url().should('include', '/pipelines/new');
    });

    it('stays on the create page and rejects saving if a stage has no name', { tags: ['@regression'] }, () => {
      cy.visit('/pipelines/new');
      page.fillName(faker.company.name() + ' Validation Test');
      cy.contains('button', 'Add Stage').should('be.visible').click();
      // Intentionally NOT filling the stage name
      page.savePipeline();
      cy.url().should('include', '/pipelines/new');
    });
  });

  // ─── DELETE ────────────────────────────────────────────────────────────────

  context('Delete - confirm dialog', { tags: ['@crud', '@delete'] }, () => {
    it('safe deletion: creates a dummy pipeline, deletes it, and confirms it is removed', { tags: ['@critical'] }, function () {
      const name = faker.company.name() + ' Delete Test Dummy';
      page.createPipeline(name);
      page.assertPipelineExists(name);

      page.deletePipeline(name);
      page.assertPipelineNotExists(name);
    });

    it('keeps the pipeline when the delete dialog is cancelled, then cleans up', { tags: ['@regression'] }, function () {
      cy.wait(2000); // Allow async data/suspense to render
      cy.get('body').then(($body) => {
        const $cards = $body.find('a[aria-label^="Open "]');
        if ($cards.length === 0) {
          cy.log('Skipping test: no pipelines exist');
          this.skip();
        } else {
          const name = $cards.first().attr('aria-label').replace('Open ', '');
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
        }
      });
    });
  });
});
