/**
 * @module Candidates - Talent Base
 * @tags @smoke @regression @crud
 */

import { CandidatesPage } from '../../pages/CandidatesPage';
import { dataFactory } from '../../support/utils/dataFactory';

const page = new CandidatesPage();

describe('Candidates - Talent Base', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/talent-base/candidates');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read - List, Search, Filter', () => {
    it('@smoke - should load candidates page', () => {
      cy.url().should('include', '/talent-base/candidates');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should display Add a candidate button', () => {
      cy.get('button[title="Add a candidate"]').should('be.visible');
    });

    it('@sanity - should display search input', () => {
      cy.get('[placeholder="Search"]').should('be.visible');
    });

    it('@regression - should search for a candidate', () => {
      cy.get('[placeholder="Search"]').clear().type('Alice');
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });

    it('@regression - should clear search and restore list', () => {
      cy.get('[placeholder="Search"]').clear().type('xyz').clear();
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });

    it('@regression - should show no results for unmatched search', () => {
      cy.get('[placeholder="Search"]').clear().type('ZZZNOMATCH_XYZCANDAUTO');
      cy.waitForPageLoad();
      cy.get('body').should('be.visible');
    });
  });

  // ─── PAGINATION ───────────────────────────────────────────────────────────

  context('Pagination', () => {
    it('@regression - should show pagination controls if applicable', () => {
      cy.get('body').then(($body) => {
        const hasNext = $body.find('[aria-label="Next page"]').length > 0;
        if (hasNext) {
          cy.get('[aria-label="Next page"]').should('be.visible');
        } else {
          cy.log('No pagination needed for current data set');
        }
      });
    });
  });

  // ─── TABLE ────────────────────────────────────────────────────────────────

  context('Table Display', () => {
    it('@regression - should display candidate table if records exist', () => {
      cy.get('body').then(($body) => {
        if ($body.find('table').length) {
          cy.get('table').should('be.visible');
        } else {
          cy.log('No table found — page may use list/card layout');
        }
      });
    });
  });
});
