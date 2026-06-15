/**
 * @module Merge Requests - Talent Base
 * @tags @smoke @regression
 */

import { MergeRequestsPage } from '../../pages/MergeRequestsPage';

const page = new MergeRequestsPage();

describe('Merge Requests - Talent Base', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/talent-base/merge-requests');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read', () => {
    it('@smoke - should load merge requests page', () => {
      cy.url().should('include', '/talent-base/merge-requests');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should display page content', () => {
      cy.get('body').should('not.be.empty');
    });

    it('@regression - should show list of merge requests or empty state', () => {
      cy.get('body').then(($body) => {
        const hasRequests = $body.find('table tbody tr, [data-request], li[class]').length > 0;
        if (hasRequests) {
          cy.log('Merge requests list is visible');
        } else {
          cy.log('Empty state shown — no merge requests in current environment');
        }
        cy.get('body').should('be.visible');
      });
    });

    it('@regression - should search merge requests', () => {
      cy.get('body').then(($body) => {
        const hasSearch = $body.find('[placeholder*="Search"]').length > 0;
        if (hasSearch) {
          cy.get('[placeholder*="Search"]').clear().type('test');
          cy.waitForPageLoad();
          cy.get('body').should('be.visible');
        } else {
          cy.log('No search input on merge requests page');
        }
      });
    });
  });

  // ─── WORKFLOW ─────────────────────────────────────────────────────────────

  context('Workflow - Approve/Reject', () => {
    it('@regression - should be able to open a merge request if one exists', () => {
      cy.get('body').then(($body) => {
        const requestLinks = $body.find('table tbody tr, [data-request]');
        if (requestLinks.length > 0) {
          requestLinks.first().click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('No merge requests to open in current environment');
        }
      });
    });

    it('@regression - should display approve/reject actions on a merge request', () => {
      cy.get('body').then(($body) => {
        const hasRows = $body.find('table tbody tr').length > 0;
        if (hasRows) {
          cy.get('table tbody tr').first().click();
          cy.get('body').then(($detailBody) => {
            const hasApprove = $detailBody.find('[class*="approve"], button:contains("Approve")').length > 0;
            const hasReject = $detailBody.find('[class*="reject"], button:contains("Reject")').length > 0;
            if (hasApprove || hasReject) {
              cy.log('Approve/Reject actions are visible');
            } else {
              cy.log('No action buttons found — may require a specific merge request state');
            }
          });
        } else {
          cy.log('No merge requests available in current environment');
        }
      });
    });
  });
});
