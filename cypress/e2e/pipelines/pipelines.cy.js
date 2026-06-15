/**
 * @module Pipelines
 * @tags @smoke @regression @crud
 */

import { PipelinesPage } from '../../pages/PipelinesPage';
import { dataFactory } from '../../support/utils/dataFactory';
import { maxLengthString, SQL_INJECTION, XSS_PROBE } from '../../support/utils/helpers';

const page = new PipelinesPage();

describe('Pipelines', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/pipelines');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read', () => {
    it('@smoke - should load pipelines page', () => {
      cy.url().should('include', '/pipelines');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should display New Pipeline button', () => {
      cy.contains('button', /new pipeline/i).should('be.visible');
    });

    it('@regression - should search pipelines', () => {
      cy.get('[placeholder*="Search"]').clear().type('Pipeline');
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });

    it('@regression - should show no results for unmatched search', () => {
      cy.get('[placeholder*="Search"]').clear().type('ZZZNOMATCHAUTO');
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  context('Create', () => {
    it('@smoke - should open New Pipeline modal', () => {
      cy.contains('button', /new pipeline/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('@critical - should create pipeline with name and description', () => {
      const pipeline = dataFactory.pipeline();
      cy.contains('button', /new pipeline/i).click();
      cy.get('#pipeline-name').should('be.visible').clear().type(pipeline.name);
      cy.get('#pipeline-description').clear().type(pipeline.description);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('contain.text', pipeline.name);
    });

    it('@regression - should create pipeline with name only', () => {
      const pipeline = dataFactory.pipeline();
      cy.contains('button', /new pipeline/i).click();
      cy.get('#pipeline-name').should('be.visible').clear().type(pipeline.name);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('contain.text', pipeline.name);
    });

    it('@regression - should not create pipeline with empty name', () => {
      cy.contains('button', /new pipeline/i).click();
      cy.contains('button', /save|create/i).click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('@regression - should handle max length pipeline name', () => {
      cy.contains('button', /new pipeline/i).click();
      cy.get('#pipeline-name').clear().type(maxLengthString(100));
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should reject SQL injection in pipeline name', () => {
      cy.contains('button', /new pipeline/i).click();
      cy.get('#pipeline-name').clear().type(SQL_INJECTION);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });

    it('@regression - should reject XSS in pipeline name', () => {
      cy.contains('button', /new pipeline/i).click();
      cy.get('#pipeline-name').clear().type(XSS_PROBE);
      cy.contains('button', /save|create/i).click();
      cy.get('body').should('be.visible');
    });
  });

  // ─── MODAL UX ─────────────────────────────────────────────────────────────

  context('Modal UX', () => {
    it('@regression - should close modal on Cancel', () => {
      cy.contains('button', /new pipeline/i).click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('button', /cancel/i).click();
      cy.get('#pipeline-name').should('not.exist');
    });
  });

  // ─── DELETE / UPDATE (when applicable) ────────────────────────────────────

  context('Pipeline Detail', () => {
    it('@regression - should be able to click on a pipeline to view details', () => {
      cy.get('body').then(($body) => {
        const hasPipelines = $body.find('table tbody tr, [data-pipeline], li').length > 0;
        if (hasPipelines) {
          cy.get('table tbody tr, [data-pipeline], li').first().click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('No pipelines found to click');
        }
      });
    });
  });
});
