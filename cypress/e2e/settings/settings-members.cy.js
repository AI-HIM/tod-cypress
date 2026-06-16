/**
 * @module Settings - Members
 *
 * Verified live (2026-06-15):
 *  - Page heading: "Members"
 *  - Table headers: Member, Role, Reports To, Joined, Actions
 *  - "Invite Member" button always present.
 *  - Invite Member dialog fields: #invite-email (email), #invite-name (text),
 *    [data-slot="select-trigger"] for Role (first) and Manager (second).
 *  - Per-row buttons: button[title="Edit"], button[title="Remove"].
 *  - The current logged-in user's email is visible in the members table.
 */

describe('Settings - Members', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/members');
    cy.contains('h1, h2, h3', 'Members', { timeout: 15000 }).should('be.visible');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read', { tags: ['@smoke'] }, () => {
    it('loads the Members page with the correct heading', { tags: ['@smoke', '@critical'] }, () => {
      cy.url().should('include', '/settings/members');
      cy.contains('h1, h2, h3', 'Members').should('be.visible');
    });

    it('displays the correct table headers', { tags: ['@smoke'] }, () => {
      const headers = ['Member', 'Role', 'Reports To', 'Joined', 'Actions'];
      headers.forEach((h) => cy.get('table thead').should('contain.text', h));
    });

    it('shows at least one member row', { tags: ['@smoke'] }, () => {
      cy.get('table tbody tr').should('have.length.greaterThan', 0);
    });

    it('shows the current logged-in user in the members list', { tags: ['@regression'] }, () => {
      cy.get('table tbody').should('contain.text', Cypress.env('USER_EMAIL'));
    });

    it('shows Edit and Remove controls per member row', { tags: ['@regression'] }, () => {
      cy.get('button[title="Edit"]').should('have.length.greaterThan', 0);
      cy.get('button[title="Remove"]').should('have.length.greaterThan', 0);
    });
  });

  // ─── INVITE MEMBER ─────────────────────────────────────────────────────────

  context('Invite Member', { tags: ['@crud', '@create'] }, () => {
    it('shows the Invite Member button', { tags: ['@smoke'] }, () => {
      cy.contains('button', 'Invite Member').should('be.visible');
    });

    it('opens the Invite Member dialog with correct fields', { tags: ['@smoke'] }, () => {
      cy.contains('button', 'Invite Member').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('[role="dialog"]', 'Invite Member').should('be.visible');
      cy.get('#invite-email').should('be.visible');
      cy.get('#invite-name').should('be.visible');
      cy.get('[data-slot="select-trigger"]').first().should('be.visible');
    });

    it('validates email format — rejects a malformed email', { tags: ['@regression', '@validation'] }, () => {
      cy.contains('button', 'Invite Member').click();
      cy.get('#invite-email').should('be.visible').type('not-an-email');
      cy.get('#invite-name').type('Test User');
      cy.contains('[role="dialog"] button', 'Invite Member').click();
      // Should stay in dialog with a validation error
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('validates required fields — rejects empty email', { tags: ['@regression', '@validation'] }, () => {
      cy.contains('button', 'Invite Member').click();
      cy.get('#invite-name').type('Test User');
      cy.contains('[role="dialog"] button', 'Invite Member').click();
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('closes the Invite Member dialog via Cancel', { tags: ['@regression'] }, () => {
      cy.contains('button', 'Invite Member').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('[role="dialog"] button', 'Cancel').click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('closes the Invite Member dialog via the × button', { tags: ['@regression'] }, () => {
      cy.contains('button', 'Invite Member').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('[data-slot="dialog-close"]').click();
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  // ─── ROLE-BASED ────────────────────────────────────────────────────────────

  context('Role-Based', { tags: ['@regression'] }, () => {
    it('shows role badges for each member', { tags: ['@regression'] }, () => {
      // Scoped to the members table — an unscoped check could pass on an
      // unrelated badge elsewhere on the page without verifying anything.
      cy.get('table tbody tr').then(($rows) => {
        cy.get('table tbody [data-slot="badge"]').should('have.length', $rows.length);
      });
    });
  });
});
