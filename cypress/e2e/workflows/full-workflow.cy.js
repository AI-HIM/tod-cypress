/**
 * @module End-to-End Workflows
 *
 * Full hiring workflow covering all major modules.
 * Each step uses verified live selectors.
 *
 * Pipelines and Templates use FULL-PAGE FORMS, not modals:
 *  - Pipeline create: /pipelines/new
 *  - Template create: /templates/new
 *  - Folder create:   /templates/folders/new
 *
 * Cleanup runs in afterEach/after to avoid polluting the shared dev environment.
 */

import { dataFactory } from '../../support/utils/dataFactory';
import { TemplatesPage } from '../../pages/TemplatesPage';
import { SELECTORS } from '../../support/utils/helpers';

const CONFIRM_DIALOG = SELECTORS.modal.confirmDialog;

// ─── Full Hiring Workflow ────────────────────────────────────────────────────

describe('Full Hiring Workflow - E2E', { tags: ['@e2e', '@regression', '@critical'] }, () => {
  const bu = dataFactory.businessUnit();
  const pipeline = dataFactory.pipeline();
  const template = dataFactory.template();

  // beforeEach (not before) — Cypress's default testIsolation wipes cookies
  // and storage between tests within a spec, so a session restored only
  // once in `before()` is gone by Step 2 onward; cy.login()'s cy.session()
  // call must run before EVERY step to restore/re-validate it each time
  // (confirmed live 2026-06-16: Step 2's cy.visit('/pipelines/new') landed
  // on /login instead, cascading into every later step looking for the
  // wrong page's content).
  beforeEach(() => {
    cy.login();
  });

  // Step 1: Create Business Unit
  it('Step 1 — creates a Business Unit', { tags: ['@e2e'] }, () => {
    cy.visit('/jobs');
    cy.contains('h1, h2', 'Business Units').should('be.visible');
    cy.get('button[title="New BU"]').should('be.visible').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('#bu-name').should('be.visible').clear().type(bu.name);
    cy.get('#bu-description').clear().type(bu.description);
    cy.contains('[role="dialog"] button', /^Create BU$/).click();
    cy.contains('[data-sonner-toast][data-type="success"], [role="status"]', `Business Unit "${bu.name}" created`, {
      timeout: 15000,
    }).should('be.visible');
    cy.get(`a[aria-label="Open ${bu.name}"]`).should('exist');
  });

  // Step 2: Create a Pipeline (full-page form)
  it('Step 2 — creates a Pipeline', { tags: ['@e2e'] }, () => {
    cy.visit('/pipelines/new');
    cy.contains('h1, h2', 'New Pipeline').should('be.visible');
    cy.get('#pipeline-name').should('be.visible').clear().type(pipeline.name);
    cy.get('#pipeline-description').clear().type(pipeline.description);
    // Saving requires at least one named stage (confirmed live) — otherwise
    // "Save Pipeline" rejects with a toast and stays on /pipelines/new.
    cy.contains('button', 'Add Stage').click();
    cy.get('input[placeholder="Stage name"]').last().should('be.visible').clear().type(`${pipeline.name} Stage 1`);
    cy.contains('button', 'Save Pipeline').click();
    // On success, the app redirects to the new pipeline's own detail page.
    cy.url().should('match', /\/pipelines\/[0-9a-f-]{36}$/);
    cy.visit('/pipelines');
    cy.get(`a[aria-label="Open ${pipeline.name}"]`).should('exist');
  });

  // Step 3: Create a Template (full-page form)
  // Not cleaned up in after(): confirmed live that no individual template has
  // a delete affordance anywhere in the app (list card and detail/edit page
  // both expose zero delete control) — only folders are deletable. The
  // dataFactory-generated name keeps this test data clearly identifiable.
  it('Step 3 — creates an Email Template', { tags: ['@e2e'] }, () => {
    cy.visit('/templates/new');
    cy.contains('h1, h2', 'New Template').should('be.visible');
    cy.get('#template-name').should('be.visible').clear().type(template.name);
    cy.get('#template-subject').should('be.visible').clear().type(template.subject);
    // The message body is required — confirmed live 2026-06-16: omitting it
    // rejects the save with a "Please enter a message body" toast and stays
    // on /templates/new.
    cy.get(SELECTORS.templateForm.bodyTextarea).should('be.visible').clear().type(template.body);
    cy.contains('button', 'Save Template').click();
    cy.url().should('include', '/templates');
    cy.url().should('not.include', '/new');
    cy.get('body').should('contain.text', template.name);
  });

  // Step 4: Open Add Candidate dialog and verify
  it('Step 4 — opens the Add Candidate dialog', { tags: ['@e2e'] }, () => {
    cy.visit('/talent-base/candidates');
    cy.get('button[title="Add a candidate"]').should('be.visible').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('[role="dialog"]', 'Add Candidate').should('be.visible');
    cy.get('[role="dialog"] input[type="file"]').should('exist');
    // Close dialog without submitting
    cy.contains('[role="dialog"] button', /cancel/i).click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  // Step 5: Create an Import
  it('Step 5 — opens the New Import dialog', { tags: ['@e2e'] }, () => {
    cy.visit('/talent-base/imports');
    cy.get('button[title="New Import"]').should('be.visible').click();
    cy.get('[role="dialog"]').should('be.visible');
    // Close without submitting to keep env clean. The New Import dialog has
    // NO "Cancel" button (confirmed live 2026-06-16) — its buttons are an
    // icon-only close, "Continue", and "Close".
    cy.contains('[role="dialog"] button', /^close$/i).click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  // Step 6: Verify Settings Profile
  it('Step 6 — verifies settings profile page', { tags: ['@e2e'] }, () => {
    cy.visit('/settings/profile');
    cy.get('#name-input').should('be.visible').and('not.have.value', '');
    cy.get('#email-input').should('be.visible').and('not.have.value', '');
    cy.contains('h1, h2, h3', 'Profile').should('be.visible');
  });

  // Step 7: Logout
  it('Step 7 — logs out and verifies redirect to /login', { tags: ['@e2e'] }, () => {
    cy.visit('/');
    cy.logout();
    cy.url().should('include', '/login');
  });

  // Cleanup: delete the BU and pipeline created in this workflow
  after(() => {
    cy.login();

    // Delete BU
    cy.visit('/jobs');
    cy.get('[placeholder="Search business units"]').clear().type(bu.name);
    cy.waitForPageLoad();
    cy.get(`a[aria-label="Open ${bu.name}"]`).should('exist');
    cy.get('[aria-label="More"]').first().click();
    cy.contains('[role="menu"] [role="menuitem"]', /^Delete BU$/).should('be.visible').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains('[role="dialog"] button', /^Delete BU$/).click();

    // Delete Pipeline
    // scrollIntoView() first — the list container scrolls and can clip the card.
    cy.visit('/pipelines');
    cy.get(`a[aria-label="Open ${pipeline.name}"]`)
      .should('exist')
      .scrollIntoView()
      .parent()
      .find('button[title="Delete pipeline"]')
      .should('be.visible')
      .click();
    // Renders as role="alertdialog", not a plain dialog (confirmed live).
    cy.get(CONFIRM_DIALOG).should('be.visible').find('button').filter(':contains("Delete")').last().click();
  });
});

// ─── Candidate Search Workflow ────────────────────────────────────────────────

describe('Candidate Search Workflow - E2E', { tags: ['@e2e', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
  });

  it('searches candidates and verifies filtered results', { tags: ['@e2e'] }, () => {
    cy.visit('/talent-base/candidates');
    // Use whichever candidate already exists in the table rather than a
    // hardcoded seed name, so this test does not depend on fixed env data.
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    // td[0] is the row-selection checkbox column (confirmed live
    // 2026-06-16, empty text content) — the candidate name is td[1].
    cy.get('table tbody tr').first().find('td').eq(1).invoke('text').then((rawName) => {
      const term = rawName.trim();
      cy.get('[placeholder="Search"]').clear().type(term);
      cy.waitForPageLoad();
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
      cy.get('table tbody').should('contain.text', term);
    });
  });

  it('shows empty state for an unmatched candidate search', { tags: ['@e2e'] }, () => {
    cy.visit('/talent-base/candidates');
    cy.get('[placeholder="Search"]').clear().type('ZZZNOMATCH_XYZ_AUTO');
    cy.waitForPageLoad();
    // No-match renders a single empty-state row ("No candidates found"), not
    // zero rows (confirmed live 2026-06-16).
    cy.get('table tbody tr').should('have.length', 1);
    cy.get('table tbody').should('contain.text', 'No candidates found');
  });
});

// ─── Template Folder Workflow ─────────────────────────────────────────────────

describe('Template Folder Organization Workflow - E2E', { tags: ['@e2e', '@regression'] }, () => {
  const folder = dataFactory.folder();
  const tmpl = dataFactory.template();

  before(() => {
    cy.login();
  });

  after(() => {
    // Cleanup: delete the folder created by this workflow.
    cy.login();
    cy.visit('/templates');
    new TemplatesPage().deleteFolder(folder.name);
  });

  // The standalone template created here is not cleaned up — confirmed live
  // that no individual template has a delete affordance anywhere in the app
  // (only folders are deletable). The folder created alongside it IS deleted
  // in after() above.
  it('creates a folder then a standalone template', { tags: ['@e2e'] }, () => {
    // Create folder
    cy.visit('/templates/folders/new');
    cy.contains('h1, h2', 'New Folder').should('be.visible');
    cy.get('#folder-name').should('be.visible').clear().type(folder.name);
    cy.contains('button', 'Create Folder').click();
    cy.url().should('include', '/templates');
    cy.url().should('not.include', '/new');
    cy.get('body').should('contain.text', folder.name);

    // Create template
    cy.visit('/templates/new');
    cy.contains('h1, h2', 'New Template').should('be.visible');
    cy.get('#template-name').should('be.visible').clear().type(tmpl.name);
    cy.get('#template-subject').should('be.visible').clear().type(tmpl.subject);
    // Required — see Step 3's comment above for the live-confirmed validation.
    cy.get(SELECTORS.templateForm.bodyTextarea).should('be.visible').clear().type(tmpl.body);
    cy.contains('button', 'Save Template').click();
    cy.url().should('include', '/templates');
    cy.url().should('not.include', '/new');
    cy.get('body').should('contain.text', tmpl.name);
  });
});
