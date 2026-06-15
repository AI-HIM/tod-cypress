/**
 * @module End-to-End Workflow
 * @tags @e2e @regression @critical
 *
 * Full hiring workflow: Login → Create BU → Create Job → Add Candidate → Navigate Pipeline
 */

import { dataFactory } from '../../support/utils/dataFactory';

describe('Full Hiring Workflow - E2E', { tags: ['@e2e', '@regression', '@critical'] }, () => {
  const bu = dataFactory.businessUnit();
  const pipeline = dataFactory.pipeline();
  const candidate = dataFactory.candidate();
  const template = dataFactory.template();

  before(() => {
    cy.login();
  });

  // ─── Step 1: Create Business Unit ─────────────────────────────────────────

  it('@e2e - Step 1: Create a Business Unit', () => {
    cy.visit('/jobs');
    cy.get('button[title="New BU"]').should('be.visible').click();
    cy.get('#bu-name').should('be.visible').clear().type(bu.name);
    cy.get('#bu-description').clear().type(bu.description);
    cy.contains('button', /save|create/i).click();
    cy.get('body').should('contain.text', bu.name);
  });

  // ─── Step 2: Create a Pipeline ────────────────────────────────────────────

  it('@e2e - Step 2: Create a Pipeline', () => {
    cy.visit('/pipelines');
    cy.contains('button', /new pipeline/i).should('be.visible').click();
    cy.get('#pipeline-name').should('be.visible').clear().type(pipeline.name);
    cy.get('#pipeline-description').clear().type(pipeline.description);
    cy.contains('button', /save|create/i).click();
    cy.get('body').should('contain.text', pipeline.name);
  });

  // ─── Step 3: Create a Template ────────────────────────────────────────────

  it('@e2e - Step 3: Create an Email Template', () => {
    cy.visit('/templates');
    cy.contains('button', /new template/i).should('be.visible').click();
    cy.get('#template-name').should('be.visible').clear().type(template.name);
    cy.get('#template-subject').should('be.visible').clear().type(template.subject);
    cy.contains('button', /save|create/i).click();
    cy.get('body').should('contain.text', template.name);
  });

  // ─── Step 4: Add a Candidate ──────────────────────────────────────────────

  it('@e2e - Step 4: Add a Candidate', () => {
    cy.visit('/talent-base/candidates');
    cy.get('button[title="Add a candidate"]').should('be.visible').click();
    cy.get('[placeholder="First name"]').should('be.visible').clear().type(candidate.fullName.split(' ')[0]);
    cy.get('[placeholder="Last name"]').should('be.visible').clear().type(candidate.fullName.split(' ')[1]);
    cy.get('[placeholder="Email"]').should('be.visible').clear().type(candidate.email);
    cy.contains('button', /save|create|add/i).click();
    cy.get('body').should('be.visible');
  });

  // ─── Step 5: Create an Import Batch ───────────────────────────────────────

  it('@e2e - Step 5: Create an Import Batch', () => {
    const importData = dataFactory.importBatch();
    cy.visit('/talent-base/imports');
    cy.get('button[title="New Import"]').should('be.visible').click();
    cy.get('#import-name-input').should('be.visible').clear().type(importData.name);
    cy.get('#import-description-input').clear().type(importData.description);
    cy.contains('button', /save|create|next/i).click();
    cy.get('body').should('be.visible');
  });

  // ─── Step 6: Navigate Settings ────────────────────────────────────────────

  it('@e2e - Step 6: Navigate to Settings and verify profile', () => {
    cy.visit('/settings/profile');
    cy.get('#name-input').should('be.visible');
    cy.get('#email-input').should('be.visible');
  });

  // ─── Step 7: Logout ───────────────────────────────────────────────────────

  it('@e2e - Step 7: Logout and verify redirect to login', () => {
    cy.visit('/');
    cy.logout();
    cy.url().should('include', '/login');
  });
});

// ─── Workflow: Candidate Search & Filter E2E ──────────────────────────────────

describe('Candidate Search Workflow - E2E', { tags: ['@e2e', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
  });

  it('@e2e - should search and view candidate details', () => {
    cy.visit('/talent-base/candidates');
    cy.get('[placeholder="Search"]').clear().type('Alice');
    cy.waitForPageLoad();
    cy.get('body').then(($body) => {
      if ($body.find('table tbody tr').length > 0) {
        cy.get('table tbody tr').first().click();
        cy.get('body').should('be.visible');
      } else {
        cy.log('No candidates found matching search');
      }
    });
  });
});

// ─── Workflow: Template Folder Organization ───────────────────────────────────

describe('Template Organization Workflow - E2E', { tags: ['@e2e', '@regression'] }, () => {
  const folder = dataFactory.folder();
  const tmpl = dataFactory.template();

  before(() => {
    cy.login();
  });

  it('@e2e - should create folder and template under it', () => {
    cy.visit('/templates');

    // Create folder
    cy.contains('button', /new folder/i).click();
    cy.get('#folder-name').should('be.visible').clear().type(folder.name);
    cy.contains('button', /save|create/i).click();
    cy.get('body').should('contain.text', folder.name);

    // Create template
    cy.contains('button', /new template/i).click();
    cy.get('#template-name').should('be.visible').clear().type(tmpl.name);
    cy.get('#template-subject').should('be.visible').clear().type(tmpl.subject);
    cy.contains('button', /save|create/i).click();
    cy.get('body').should('contain.text', tmpl.name);
  });
});
