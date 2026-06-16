/**
 * @module Candidates - Talent Base
 *
 * Verified live (2026-06-15):
 *  - Table headers: Candidate Name, Email, Phone, Title, Location, Experience, Added.
 *  - "Add a candidate" button opens a dialog with a FILE UPLOAD (resume) only.
 *    There are no first-name / last-name / email text fields in this dialog.
 *  - Pagination: [aria-label="Previous page"] / [aria-label="Next page"]
 *  - Row checkboxes: input[type="checkbox"][aria-label^="Select "]
 */

import { CandidatesPage } from '../../pages/CandidatesPage';

const page = new CandidatesPage();

describe('Candidates - Talent Base', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/talent-base/candidates');
    page.waitUntilReady();
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read - List, Search, Filter', { tags: ['@smoke'] }, () => {
    it('loads the candidates page on the correct URL', { tags: ['@smoke', '@critical'] }, () => {
      cy.url().should('include', '/talent-base/candidates');
      cy.get('table').should('be.visible');
    });

    it('displays the correct table column headers', { tags: ['@smoke'] }, () => {
      page.assertTableHeadersVisible();
    });

    it('shows at least one candidate in the table', { tags: ['@smoke'] }, () => {
      page.assertHasCandidates();
    });

    it('displays the Add a candidate button', { tags: ['@sanity'] }, () => {
      cy.get('button[title="Add a candidate"]').should('be.visible');
    });

    it('displays the search input', { tags: ['@sanity'] }, () => {
      cy.get('[placeholder="Search"]').should('be.visible');
    });

    it('displays filter controls', { tags: ['@regression'] }, () => {
      cy.contains('button', 'No filters').should('be.visible');
    });
  });

  // ─── SEARCH ───────────────────────────────────────────────────────────────

  context('Search', { tags: ['@regression'] }, () => {
    it('filters the table when a search term is entered', { tags: ['@regression'] }, () => {
      page.search('Rahul');
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
      cy.get('table tbody').should('contain.text', 'Rahul');
    });

    it('shows an empty table for an unmatched search term', { tags: ['@regression'] }, () => {
      page.search('ZZZNOMATCH_XYZCANDAUTO');
      cy.get('table tbody tr').should('have.length', 0);
    });

    it('restores the full list after clearing the search', { tags: ['@regression'] }, () => {
      page.search('xyz_no_match');
      cy.get('table tbody tr').should('have.length', 0);
      page.clearSearch();
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ─── PAGINATION ───────────────────────────────────────────────────────────

  context('Pagination', { tags: ['@regression'] }, () => {
    it('shows pagination controls when there are multiple pages', { tags: ['@regression'] }, () => {
      cy.get('[aria-label="Next page"]').should('be.visible');
    });

    it('navigates to the next page and back', { tags: ['@regression'] }, () => {
      cy.get('[aria-label="Next page"]').should('be.visible').click();
      cy.waitForPageLoad();
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
      cy.get('[aria-label="Previous page"]').should('be.visible').click();
      cy.waitForPageLoad();
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });
  });

  // ─── TABLE ACTIONS ────────────────────────────────────────────────────────

  context('Table Actions', { tags: ['@regression'] }, () => {
    it('allows selecting a candidate row via checkbox', { tags: ['@regression'] }, () => {
      cy.get('input[type="checkbox"][aria-label^="Select "]').first().check();
      cy.get('input[type="checkbox"][aria-label^="Select "]').first().should('be.checked');
    });

    it('clicking a candidate row navigates to their detail page', { tags: ['@regression'] }, () => {
      cy.get('table tbody tr').first().click();
      cy.url().should('match', /\/talent-base\/candidates\/.+/);
    });
  });

  // ─── ADD CANDIDATE DIALOG ─────────────────────────────────────────────────

  context('Add Candidate Dialog', { tags: ['@crud', '@create'] }, () => {
    it('opens the Add Candidate dialog with file upload UI', { tags: ['@smoke'] }, () => {
      page.openAddCandidate();
      page.assertAddCandidateDialogVisible();
    });

    it('shows the Search jobs and Search buckets inputs in the dialog', { tags: ['@regression'] }, () => {
      page.openAddCandidate();
      cy.get('[placeholder="Search jobs..."]').should('be.visible');
      cy.get('[placeholder="Search buckets..."]').should('be.visible');
    });

    it('closes the dialog on Cancel', { tags: ['@regression'] }, () => {
      page.openAddCandidate();
      page.cancelAddCandidate();
      page.assertDialogClosed();
    });

    it('closes the dialog via the close (×) button', { tags: ['@regression'] }, () => {
      page.openAddCandidate();
      cy.get('[data-slot="dialog-close"]').click();
      page.assertDialogClosed();
    });
  });
});
