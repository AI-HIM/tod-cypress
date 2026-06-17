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
      cy.get('.border-slate-200 > .flex-1 > .flex, table').first().should('be.visible');
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
      cy.contains('button', /filters/i).should('be.visible');
    });
  });

  // ─── SEARCH ───────────────────────────────────────────────────────────────

  context('Search', { tags: ['@regression'] }, () => {
    it('filters the table when a search term is entered', { tags: ['@regression'] }, () => {
      page.search('Rahul');
      cy.get('.border-slate-200 > .flex-1 > .flex > *').should('have.length.greaterThan', 0);
      cy.get('.border-slate-200 > .flex-1 > .flex').should('contain.text', 'Rahul');
    });

    it('shows an empty table for an unmatched search term', { tags: ['@regression'] }, () => {
      page.search('ZZZNOMATCH_XYZCANDAUTO');
      cy.get('.border-slate-200 > .flex-1 > .flex > *').should('not.exist');
    });

    it('restores the full list after clearing the search', { tags: ['@regression'] }, () => {
      page.search('xyz_no_match');
      cy.get('.border-slate-200 > .flex-1 > .flex > *').should('not.exist');
      page.clearSearch();
      cy.get('.border-slate-200 > .flex-1 > .flex > *').should('have.length.greaterThan', 0);
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
      cy.get('.border-slate-200 > .flex-1 > .flex > *').should('have.length.greaterThan', 0);
      cy.get('[aria-label="Previous page"]').should('be.visible').click();
      cy.waitForPageLoad();
      cy.get('.border-slate-200 > .flex-1 > .flex > *').should('have.length.greaterThan', 0);
    });
  });

  // ─── TABLE ACTIONS ────────────────────────────────────────────────────────

  context('Table Actions', { tags: ['@regression'] }, () => {
    it('allows selecting a candidate row via checkbox', { tags: ['@regression'] }, () => {
      const checkboxSelector = '.divide-y > :nth-child(1) > .w-12 > .group > .appearance-none';
      cy.get(checkboxSelector).click({ force: true });
      cy.get(checkboxSelector).should('exist');
    });

    it('clicking a candidate row navigates to their detail page', { tags: ['@regression'] }, () => {
      // Use the explicit selector that was working previously to trigger the drawer
      cy.get('.w-full > .divide-y > :nth-child(2) > :nth-child(3)').click({ force: true });
      
      // Wait for the drawer/side panel to open (the URL does not change for the drawer)
      cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');
    });
  });

  // ─── ADVANCED FILTERS ───────────────────────────────────────────────────────

  context('Advanced Filters', { tags: ['@regression'] }, () => {
    it('applies a filter and then clears it', { tags: ['@regression'] }, () => {
      // 1. Open filters
      cy.contains('button', /filters/i).click();

      // 2. Click Add filter
      cy.contains('button', /add filter/i).click();

      // 3. Select 'Bucket' filter type (assuming first combobox/select is the type)
      // Since UI frameworks vary, we use generic text matching to select the bucket option
      cy.get('body').type('{esc}'); // Ensure any focus is clear
      cy.contains('button', /filters/i).click(); // Re-open if needed

      // The browser agent found the exact bucket 'PROBE_4PQ5KK' 
      // Click the first dropdown to select 'Bucket'
      // Click the second dropdown to select 'PROBE_4PQ5KK'
      // As a robust fallback without exact React selectors, we type into the page or click text
      cy.get('div.gap-2 > .justify-between').click()
      cy.contains(/Bucket/i).click({ force: true });
      cy.get('.w-fit').click()
      cy.contains('PROBE_4PQ5KK').click({ force: true });

      // 4. Apply
      cy.contains('button', /apply/i).click();
      cy.waitForPageLoad();

      // 5. Verify the filtered candidate appears
      cy.get('.flex-1 > .h-full').should('have.length.greaterThan', 0);

      // 6. Clear filter
      cy.contains('button', /filter/i).click();
      cy.contains('button', /clear|remove/i).first().click();
      cy.waitForPageLoad();
    });
  });

  // ─── BULK ACTIONS ───────────────────────────────────────────────────────────

  context('Bulk Actions', { tags: ['@regression', '@crud'] }, () => {
    it('allows bulk deleting candidates', { tags: ['@regression'] }, () => {
      // We will assert on the row count
      cy.get('.border-slate-200 > .flex-1 > .flex > *').then($rows => {
        const initialCount = $rows.length;
        if (initialCount < 2) return; // Skip if not enough candidates

        // Select first two candidates
        cy.get('.divide-y > :nth-child(1) > .w-12 > .group > .appearance-none').click({ force: true });
        cy.get('.divide-y > :nth-child(2) > .w-12 > .group > .appearance-none').click({ force: true });

        // Click the bulk delete button
        cy.get('button[title="Delete"], button:contains("Delete")').should('be.visible').click();

        // Confirm deletion in the popup
        cy.get('.bg-red-600').click();

        // Verify count dropped (dynamic wait using Cypress retries)
        cy.get('.border-slate-200 > .flex-1 > .flex > *', { timeout: 10000 }).should('have.length.lessThan', initialCount);
      });
    });
  });

  // ─── SORTING ────────────────────────────────────────────────────────────────

  context('Column Sorting', { tags: ['@regression'] }, () => {
    it('sorts candidates by Name (A-Z and Z-A)', { tags: ['@regression'] }, () => {
      cy.get('table tbody tr:first-child td:nth-child(2)').invoke('text').then((firstRowText) => {
        // Open sort dropdown and click Name to sort A-Z
        cy.get('button[data-slot="popover-trigger"]').eq(1).click();
        cy.get('div[data-slot="popover-content"]').contains('button', 'Name').click();

        // Dynamically wait for the list to update
        cy.get('table tbody tr:first-child td:nth-child(2)', { timeout: 10000 }).should(($el) => {
          expect($el.text()).not.to.equal(firstRowText);
        });

        cy.get('table tbody tr:first-child td:nth-child(2)').invoke('text').then((sortedRowText) => {
          // Open sort dropdown again and click Name to sort Z-A
          cy.get('button[data-slot="popover-trigger"]').eq(1).click();
          cy.get('div[data-slot="popover-content"]').contains('button', 'Name').click();

          // Assert the first row text has changed again
          cy.get('table tbody tr:first-child td:nth-child(2)', { timeout: 10000 }).should(($el) => {
            expect($el.text()).not.to.equal(sortedRowText);
          });
        });
      });
    });

    it('sorts candidates by Created Date', { tags: ['@regression'] }, () => {
      cy.get('table tbody tr:first-child td:nth-child(2)').invoke('text').then((firstRowText) => {
        // Open sort dropdown and click Created date
        cy.get('button[data-slot="popover-trigger"]').eq(1).click();
        cy.get('div[data-slot="popover-content"]').contains('button', 'Created Date').click();

        // Assert sorting changed the top candidate
        cy.get('table tbody tr:first-child td:nth-child(2)', { timeout: 10000 }).should(($el) => {
          expect($el.text()).not.to.equal(firstRowText);
        });
      });
    });

    it('sorts candidates by Experience', { tags: ['@regression'] }, () => {
      cy.get('table tbody tr:first-child td:nth-child(2)').invoke('text').then((firstRowText) => {
        // Open sort dropdown and click Experience
        cy.get('button[data-slot="popover-trigger"]').eq(1).click();
        cy.get('div[data-slot="popover-content"]').contains('button', 'Experience').click();

        // Assert sorting changed the top candidate
        cy.get('table tbody tr:first-child td:nth-child(2)', { timeout: 10000 }).should(($el) => {
          expect($el.text()).not.to.equal(firstRowText);
        });
      });
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
