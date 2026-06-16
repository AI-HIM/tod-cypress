/**
 * Jobs → Business Units (BU) — full CRUD + validation + workflow coverage.
 *
 * Domain owner: Jobs / Business Units.
 * Page object: cypress/pages/JobsPage.js
 *
 * Verified live against todapp-dev (2026-06-15):
 *  - Create: success toast `Business Unit "<name>" created`; card `a[aria-label="Open <name>"]`.
 *  - Empty/whitespace name: dialog stays open, inline error "Name is required", NO toast.
 *  - Delete: row "More" (Radix) → "Delete BU" → confirm dialog (title `Delete BU "<name>"?`,
 *    confirm button "Delete BU") → toast `... deleted`, card removed.
 *
 * Every create test cleans up after itself via a real Delete so this shared dev
 * environment is not polluted.
 *
 * KNOWN LIVE APP DEFECTS (confirmed live 2026-06-16) — both asserted on
 * directly below; do not weaken either test to force a pass:
 *  1. Cancelling the "Delete BU" confirm dialog leaves `<body>` with an
 *     inline `pointer-events: none` style that never clears — confirmed via
 *     direct polling immediately after the Cancel click (present at t+0ms
 *     and still present 6+ seconds later), which permanently blocks all
 *     further mouse interaction with the page. A bug in the app's Radix
 *     dialog-close cleanup. See "keeps the BU when the delete dialog is
 *     cancelled" below.
 *  2. The delete-confirm dialog's title renders the BU name as one unbroken
 *     string with no min-width constraint on its flex item — for a very
 *     long, space-less name (e.g. the 100-char boundary case) the title's
 *     content width balloons past the dialog's own box, pushing the confirm
 *     button fully outside the viewport and permanently unclickable through
 *     normal interaction. A CSS layout bug in the confirm-dialog component,
 *     not a scrolling issue. See "accepts a max-length (100 char) name" below.
 */

import { JobsPage } from '../../pages/JobsPage';
import { unique, maxLengthString, SQL_INJECTION, XSS_PROBE } from '../../support/utils/helpers';

const jobs = new JobsPage();

// Existing seed data on dev used for read/search assertions.
const SEED_BU = 'TCS';

describe('Jobs - Business Units', { tags: ['@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/jobs');
    jobs.waitUntilReady();
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read - list & search', { tags: ['@read'] }, () => {
    it('shows the Business Units page with primary actions', { tags: ['@smoke'] }, () => {
      cy.contains('h1, h2', 'Business Units').should('be.visible');
      cy.get('button[title="New BU"]').should('be.visible');
      cy.get('button[title="New Job"]').should('be.visible');
      cy.get('[placeholder="Search business units"]').should('be.visible');
    });

    it('lists existing BU cards as "Open …" links', { tags: ['@smoke'] }, () => {
      cy.get('a[aria-label^="Open "]').should('have.length.greaterThan', 0);
    });

    it('searches and filters to a known seed BU', { tags: ['@smoke'] }, () => {
      jobs.searchBU(SEED_BU);
      jobs.assertBUExists(SEED_BU);
      // The filtered result set must not contain an unrelated seed BU.
      cy.get('a[aria-label^="Open "]').each(($a) => {
        expect($a.attr('aria-label')).to.match(/TCS/i);
      });
    });

    it('shows an empty result set for a non-matching search', () => {
      jobs.searchBU('ZZZ_NO_SUCH_BU_XYZ_AUTO');
      cy.get('a[aria-label^="Open "]').should('have.length', 0);
    });

    it('restores the full list after clearing the search', () => {
      jobs.searchBU(SEED_BU);
      jobs.assertBUExists(SEED_BU);
      jobs.clearSearch();
      cy.get('a[aria-label^="Open "]').should('have.length.greaterThan', 1);
    });
  });

  // ─── CREATE (self-cleaning) ──────────────────────────────────────────────────

  context('Create - New BU', { tags: ['@crud', '@create'] }, () => {
    it('creates a BU with name + description, then deletes it', { tags: ['@smoke', '@critical'] }, () => {
      const name = unique('AUTO');
      jobs.createBU(name, 'Created by automated CRUD test');
      jobs.assertCreateSuccess(name);
      jobs.searchBU(name);
      jobs.assertBUExists(name);

      // Cleanup — real delete via row "More" menu + confirm dialog.
      jobs.deleteBU(name);
      jobs.assertDeleteSuccess(name);
      jobs.assertBUNotExists(name);
    });

    it('creates a BU with name only (description optional), then deletes it', () => {
      const name = unique('AUTO');
      jobs.createBU(name);
      jobs.assertCreateSuccess(name);
      jobs.searchBU(name);
      jobs.assertBUExists(name);

      jobs.deleteBU(name);
      jobs.assertDeleteSuccess(name);
      jobs.assertBUNotExists(name);
    });

    it('stores special characters literally in the BU name, then deletes it', () => {
      // Treat special characters as LITERAL text; the created card must show the
      // exact string back (aria-label="Open <literal name>").
      const name = `${unique('AUTO')} & Co. (R&D) #1 -- "ácçénts"`;
      jobs.createBU(name);
      jobs.assertCreateSuccess(name);
      jobs.searchBU(name);
      jobs.assertBUExists(name);

      jobs.deleteBU(name);
      jobs.assertDeleteSuccess(name);
      jobs.assertBUNotExists(name);
    });

    it('treats an SQL-injection probe as a literal name, then deletes it', { tags: ['@security'] }, () => {
      const name = `${unique('AUTO')} ${SQL_INJECTION}`;
      jobs.createBU(name);
      // The probe must be stored as inert text, not executed — verify literal echo.
      jobs.assertCreateSuccess(name);
      jobs.searchBU(name);
      jobs.assertBUExists(name);

      jobs.deleteBU(name);
      jobs.assertDeleteSuccess(name);
      jobs.assertBUNotExists(name);
    });

    it('treats an XSS probe as literal text (no script execution), then deletes it', { tags: ['@security'] }, () => {
      const name = `${unique('AUTO')} ${XSS_PROBE}`;
      // If the probe executed, this alert stub would be invoked.
      cy.on('window:alert', () => {
        throw new Error('XSS payload executed — alert() was called');
      });
      jobs.createBU(name);
      jobs.assertCreateSuccess(name);
      jobs.searchBU(name);
      jobs.assertBUExists(name);

      jobs.deleteBU(name);
      jobs.assertDeleteSuccess(name);
      jobs.assertBUNotExists(name);
    });

    it('accepts a max-length (100 char) name as literal text, then deletes it', { tags: ['@boundary'] }, () => {
      const name = `${unique('AUTO')}_${maxLengthString(100 - 12)}`; // unique prefix + filler ≈ 100 chars
      jobs.createBU(name);
      jobs.assertCreateSuccess(name);
      jobs.searchBU(name);
      jobs.assertBUExists(name);

      // KNOWN LIVE APP DEFECT (confirmed live 2026-06-16): the delete-confirm
      // dialog renders the BU name as one unbroken string in its title. The
      // title's flex item has no min-width constraint, so for a name this
      // long the title's content width balloons far past the dialog's own
      // box, pushing the dialog's action buttons fully outside the viewport
      // (measured live: confirm button rendered ~1640px from the left edge
      // in a 1440px-wide viewport) — permanently unclickable through normal
      // interaction. This is a CSS layout bug in the app's confirm-dialog
      // component, not a scrolling issue (scrollIntoView() cannot fix a
      // horizontal overflow, confirmed live).
      //
      // Capture the button's position now (non-throwing), force the cleanup
      // click regardless — a real user has no such workaround, but this
      // boundary-value test still shouldn't orphan data — and assert on the
      // captured value LAST, so a real regression still fails the test
      // clearly without skipping the cleanup that must run first.
      cy.get('[aria-label="More"]').first().click();
      cy.contains('[role="menu"] [role="menuitem"]', /^Delete BU$/).should('be.visible').click();
      cy.get('[role="dialog"]').should('be.visible');
      let confirmBtnRight;
      cy.contains('[role="dialog"] button', /^Delete BU$/).then(($btn) => {
        confirmBtnRight = $btn[0].getBoundingClientRect().right;
      });
      cy.contains('[role="dialog"] button', /^Delete BU$/).click({ force: true });

      jobs.assertDeleteSuccess(name);
      jobs.assertBUNotExists(name);

      cy.then(() => {
        expect(
          confirmBtnRight,
          'confirm button must stay within the viewport — known live bug pushes it off-screen for very long, space-less names'
        ).to.be.at.most(Cypress.config('viewportWidth'));
      });
    });
  });

  // ─── VALIDATION / NEGATIVE ───────────────────────────────────────────────────

  context('Validation - negative paths', { tags: ['@validation', '@negative'] }, () => {
    it('rejects an empty name with an inline error and no success toast', { tags: ['@smoke'] }, () => {
      jobs.openNewBU();
      jobs.submitCreate();
      jobs.assertInlineRequiredError();
      jobs.assertNoSuccessToast();
      jobs.assertDialogOpen();
    });

    it('rejects a whitespace-only name with an inline error and no success toast', () => {
      jobs.openNewBU();
      jobs.fillBUName('     ');
      jobs.submitCreate();
      jobs.assertInlineRequiredError();
      jobs.assertNoSuccessToast();
      jobs.assertDialogOpen();
    });
  });

  // ─── DELETE (workflow) ───────────────────────────────────────────────────────

  context('Delete - confirm dialog workflow', { tags: ['@crud', '@delete'] }, () => {
    it('removes a BU after confirming the delete dialog', { tags: ['@critical'] }, () => {
      const name = unique('AUTO');
      jobs.createBU(name);
      jobs.assertCreateSuccess(name);

      jobs.searchBU(name);
      jobs.assertBUExists(name);
      cy.get('[aria-label="More"]').first().click();
      cy.contains('[role="menu"] [role="menuitem"]', /^Delete BU$/).should('be.visible').click();

      // Confirm dialog appears with the BU name in its title.
      cy.get('[role="dialog"]').should('be.visible').and('contain.text', `Delete BU "${name}"?`);
      // scrollIntoView() — a long name can wrap the title and push the confirm
      // button out of the visible area (same clipping class of issue as the
      // Pipelines delete flow).
      cy.contains('[role="dialog"] button', /^Delete BU$/).scrollIntoView().click();

      jobs.assertDeleteSuccess(name);
      jobs.assertBUNotExists(name);
    });

    it('keeps the BU when the delete dialog is cancelled, then cleans up', () => {
      const name = unique('AUTO');
      jobs.createBU(name);
      jobs.assertCreateSuccess(name);

      jobs.searchBU(name);
      jobs.assertBUExists(name);
      cy.get('[aria-label="More"]').first().click();
      cy.contains('[role="menu"] [role="menuitem"]', /^Delete BU$/).should('be.visible').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('[role="dialog"] button', /^Cancel$/).click();

      // Cancelled — the BU must still exist.
      cy.get('[role="dialog"]').should('not.exist');
      jobs.assertBUExists(name);

      // KNOWN LIVE APP DEFECT (see module JSDoc above): cancelling leaves
      // `<body>` permanently pointer-events:none, which blocks all further
      // interaction including the cleanup below. Capture the value now
      // (non-throwing), recover via a full navigation (a fresh page load
      // doesn't carry over the leftover inline style, since it's only a
      // client-side DOM artifact) so real cleanup can still run, and assert
      // on the captured value LAST — so a regression still fails clearly
      // without skipping the cleanup that must run first.
      let bodyPointerEvents;
      cy.get('body').then(($body) => {
        bodyPointerEvents = $body.css('pointer-events');
      });

      // Recover + real cleanup so we don't pollute the shared env.
      cy.visit('/jobs');
      jobs.waitUntilReady();
      jobs.deleteBU(name);
      jobs.assertDeleteSuccess(name);
      jobs.assertBUNotExists(name);

      cy.then(() => {
        expect(bodyPointerEvents, 'body pointer-events after cancelling the delete dialog').to.not.equal('none');
      });
    });
  });

  // ─── MODAL UX ────────────────────────────────────────────────────────────────

  context('Modal UX', { tags: ['@ui'] }, () => {
    it('closes the New BU dialog via Cancel', () => {
      jobs.openNewBU();
      jobs.cancelDialog();
      jobs.assertDialogClosed();
    });

    it('closes the New BU dialog via the close (×) control', () => {
      jobs.openNewBU();
      jobs.closeDialog();
      jobs.assertDialogClosed();
    });
  });
});
