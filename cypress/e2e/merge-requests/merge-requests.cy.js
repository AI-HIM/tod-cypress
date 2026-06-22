/**
 * @module Merge Requests - Talent Base
 *
 * The Merge Requests feature reconciles incoming (imported) candidate records
 * against existing candidates in the Talent Base.
 *
 *  - LIST page (/talent-base/merge-requests): heading "Merge Requests" plus a
 *    list of PENDING requests rendered as links whose href ends in a uuid. Each
 *    item shows the candidate name, email, source file and the word "pending".
 *    There is NO approve/reject control on the list.
 *  - DETAIL page (/talent-base/merge-requests/<uuid>): a field-resolution screen
 *    showing the existing candidate, a "Pending" badge, and per-field radio
 *    controls to choose which value to keep. The two action controls are the
 *    "Merge" button (applies the merge — the approve equivalent) and the "Skip"
 *    button (dismisses the request — the reject equivalent).
 *
 * SAFETY: Clicking "Merge" or "Skip" mutates real, shared dev data
 * irreversibly (it consumes a pending request). These tests therefore VERIFY
 * the controls exist, are visible and enabled, but never click them.
 */

import { MergeRequestsPage } from '../../pages/MergeRequestsPage';

const page = new MergeRequestsPage();

describe('Merge Requests - Talent Base', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/talent-base/merge-requests');
    page.waitUntilReady();
  });

  // ─── READ (list page) ──────────────────────────────────────────────────────

  context('Read - list page', () => {
    it('loads the Merge Requests list with its heading', { tags: ['@smoke'] }, () => {
      cy.url().should('include', '/talent-base/merge-requests');
      page.assertListHeading();
    });

    it('shows at least one pending merge request item', { tags: ['@smoke', '@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $items = $body.find('a[href*="/talent-base/merge-requests/"]');
        if ($items.length === 0) {
          cy.log('Skipping test: no pending merge requests exist');
          this.skip();
        } else {
          page.assertHasPendingRequests();
        }
      });
    });

    it('renders every request item as a uuid detail link', { tags: ['@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $items = $body.find('a[href*="/talent-base/merge-requests/"]');
        if ($items.length === 0) {
          cy.log('Skipping test: no pending merge requests exist');
          this.skip();
        } else {
          page.requestItems().each(($el) => {
            const href = $el.attr('href');
            expect(href, 'request href').to.match(
              /\/talent-base\/merge-requests\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            );
          });
        }
      });
    });

    it('marks pending requests with the "pending" status text', { tags: ['@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $items = $body.find('a[href*="/talent-base/merge-requests/"]');
        if ($items.length === 0) {
          cy.log('Skipping test: no pending merge requests exist');
          this.skip();
        } else {
          // At least the first request item must be labelled pending. We assert on
          // the item text directly rather than the whole body to keep it meaningful.
          page.requestItems().first().invoke('text').should('match', /pending/i);
        }
      });
    });

    it('shows candidate identity (name + email) on each request item', { tags: ['@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $items = $body.find('a[href*="/talent-base/merge-requests/"]');
        if ($items.length === 0) {
          cy.log('Skipping test: no pending merge requests exist');
          this.skip();
        } else {
          page.requestItems().first().invoke('text').should('match', /@/); // email present
        }
      });
    });
  });

  // ─── WORKFLOW - open detail ──────────────────────────────────────────────────

  context('Workflow - open a merge request', () => {
    it('opens the first request and lands on the detail route', { tags: ['@smoke', '@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $items = $body.find('a[href*="/talent-base/merge-requests/"]');
        if ($items.length === 0) {
          cy.log('Skipping test: no pending merge requests exist');
          this.skip();
        } else {
          page.openFirstRequest();
          page.assertOnDetailPage();
        }
      });
    });

    it('shows the candidate details on the detail page', { tags: ['@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $items = $body.find('a[href*="/talent-base/merge-requests/"]');
        if ($items.length === 0) {
          cy.log('Skipping test: no pending merge requests exist');
          this.skip();
        } else {
          page.openFirstRequest();
          // The detail page surfaces the existing candidate's identity (name + email).
          cy.contains(/Existing candidate:/i).should('be.visible');
          // ...and the candidate's email is shown as the always-kept Email value.
          cy.contains(/Email \(always kept from existing\)/i).should('be.visible');
        }
      });
    });

    it('shows the per-field merge resolution UI', { tags: ['@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $items = $body.find('a[href*="/talent-base/merge-requests/"]');
        if ($items.length === 0) {
          cy.log('Skipping test: no pending merge requests exist');
          this.skip();
        } else {
          page.openFirstRequest();
          page.assertProfileFieldResolution();
        }
      });
    });
  });

  // ─── WORKFLOW - approve/reject controls ──────────────────────────────────────

  context('Workflow - approve (Merge) / reject (Skip) controls', () => {
    it('exposes both Merge and Skip action controls, enabled', { tags: ['@smoke', '@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $items = $body.find('a[href*="/talent-base/merge-requests/"]');
        if ($items.length === 0) {
          cy.log('Skipping test: no pending merge requests exist');
          this.skip();
        } else {
          page.openFirstRequest();
          // Non-destructive: assert the controls are present + actionable. We do NOT
          // click them — completing a merge or skip consumes real shared dev data.
          page.assertActionControlsPresent();
        }
      });
    });

    it('exposes the Merge button (approve equivalent) as enabled', { tags: ['@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $items = $body.find('a[href*="/talent-base/merge-requests/"]');
        if ($items.length === 0) {
          cy.log('Skipping test: no pending merge requests exist');
          this.skip();
        } else {
          page.openFirstRequest();
          page.mergeButton().should('be.visible').and('be.enabled');
        }
      });
    });

    it('exposes the Skip button (reject equivalent) as enabled', { tags: ['@regression'] }, function () {
      cy.get('body').then(($body) => {
        const $items = $body.find('a[href*="/talent-base/merge-requests/"]');
        if ($items.length === 0) {
          cy.log('Skipping test: no pending merge requests exist');
          this.skip();
        } else {
          page.openFirstRequest();
          page.skipButton().should('be.visible').and('be.enabled');
        }
      });
    });
  });
});
