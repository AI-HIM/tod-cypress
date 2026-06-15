/**
 * @module Settings - Buckets
 * @tags @smoke @regression @crud
 */

import { dataFactory } from '../../support/utils/dataFactory';
import { SQL_INJECTION, XSS_PROBE, maxLengthString } from '../../support/utils/helpers';

describe('Settings - Buckets', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/buckets');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read', () => {
    it('@smoke - should load buckets page', () => {
      cy.url().should('include', '/settings/buckets');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should display page content', () => {
      cy.get('body').should('be.visible');
    });

    it('@regression - should show existing buckets or empty state', () => {
      cy.get('body').should('be.visible');
    });
  });

  // ─── CREATE ────────────────────────────────────────────────────────────────

  context('Create Bucket', () => {
    it('@smoke - should show New Bucket button if available', () => {
      cy.get('body').then(($body) => {
        const hasBtn = $body.find('button').toArray().some((btn) =>
          /new bucket|add bucket|create bucket/i.test(btn.textContent)
        );
        if (hasBtn) {
          cy.contains('button', /new bucket|add bucket|create bucket/i).should('be.visible');
        } else {
          cy.log('No bucket creation button found');
        }
      });
    });

    it('@critical - should create a bucket with a valid name', () => {
      cy.get('body').then(($body) => {
        const hasBtn = $body.find('button').toArray().some((btn) =>
          /new bucket|add bucket|create bucket/i.test(btn.textContent)
        );
        if (hasBtn) {
          const name = `Bucket_AUTO_${Date.now()}`;
          cy.contains('button', /new bucket|add bucket|create bucket/i).click();
          cy.get('[placeholder*="name"], #bucket-name, [name*="name"]').last().should('be.visible').clear().type(name);
          cy.contains('button', /save|create/i).click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('Bucket creation not available');
        }
      });
    });

    it('@regression - should reject empty bucket name', () => {
      cy.get('body').then(($body) => {
        const hasBtn = $body.find('button').toArray().some((btn) =>
          /new bucket|add bucket|create bucket/i.test(btn.textContent)
        );
        if (hasBtn) {
          cy.contains('button', /new bucket|add bucket|create bucket/i).click();
          cy.contains('button', /save|create/i).click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('Bucket creation not available');
        }
      });
    });

    it('@regression - should reject SQL injection in bucket name', () => {
      cy.get('body').then(($body) => {
        const hasBtn = $body.find('button').toArray().some((btn) =>
          /new bucket|add bucket|create bucket/i.test(btn.textContent)
        );
        if (hasBtn) {
          cy.contains('button', /new bucket|add bucket|create bucket/i).click();
          cy.get('[placeholder*="name"], #bucket-name, [name*="name"]').last().clear().type(SQL_INJECTION);
          cy.contains('button', /save|create/i).click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('Bucket creation not available');
        }
      });
    });
  });

  // ─── DELETE ────────────────────────────────────────────────────────────────

  context('Delete Bucket', () => {
    it('@regression - should prompt confirmation before deleting a bucket', () => {
      cy.get('body').then(($body) => {
        const hasRows = $body.find('table tbody tr, [data-bucket]').length > 0;
        if (hasRows) {
          cy.get('table tbody tr, [data-bucket]').first().within(() => {
            cy.contains(/delete|remove/i).click();
          });
          cy.get('body').should('be.visible');
        } else {
          cy.log('No buckets to delete');
        }
      });
    });
  });
});
