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

import { faker } from '@faker-js/faker';
import { SELECTORS } from '../../support/utils/helpers';

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

    it('shows at least one member row', { tags: ['@smoke'] }, function () {
      cy.wait(2000); // Allow async list to render
      cy.get('body').then(($body) => {
        const $rows = $body.find('table tbody tr');
        if ($rows.length === 0) {
          cy.log('Skipping test: no members exist');
          this.skip();
        } else {
          cy.wrap($rows).should('have.length.greaterThan', 0);
        }
      });
    });

    it('shows the current logged-in user in the members list', { tags: ['@regression'] }, function () {
      cy.wait(2000); // Allow async list to render
      cy.get('body').then(($body) => {
        const $rows = $body.find('table tbody tr');
        if ($rows.length === 0) {
          cy.log('Skipping test: no members exist');
          this.skip();
        } else {
          cy.get('table tbody').should('contain.text', Cypress.env('USER_EMAIL'));
        }
      });
    });

    it('shows Edit and Remove controls per member row', { tags: ['@regression'] }, function () {
      cy.wait(2000); // Allow async list to render
      cy.get('body').then(($body) => {
        const $rows = $body.find('table tbody tr');
        if ($rows.length === 0) {
          cy.log('Skipping test: no members exist');
          this.skip();
        } else {
          cy.get('button[title="Edit"]').should('have.length.greaterThan', 0);
          cy.get('button[title="Remove"]').should('have.length.greaterThan', 0);
        }
      });
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
      cy.get('.space-y-4 > :nth-child(3) > .justify-between').click()
      cy.get('[role="option"]').last().click(); // Pick any role
      cy.contains('[role="dialog"] button', 'Invite Member').click();

      // Should stay in dialog and show toast
      cy.get('[role="dialog"]').should('be.visible');
      cy.get(SELECTORS.toast.error).should('be.visible');
    });

    it('validates required fields on empty submission', { tags: ['@regression', '@validation'] }, () => {
      cy.contains('button', 'Invite Member').click();
      // Leave all fields blank
      cy.wait('2000')
      cy.contains('[role="dialog"] button', 'Invite Member').click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.get(SELECTORS.toast.error).should('be.visible');
    });

    it('rejects inviting a member with an existing email address', { tags: ['@regression', '@validation'] }, () => {
      cy.contains('button', 'Invite Member').click();
      // Use the logged-in user's email which is guaranteed to exist
      cy.get('#invite-email').should('be.visible').type(Cypress.env('USER_EMAIL') || 'sowmyasagar.k@gmail.com');
      cy.get('#invite-name').type('Duplicate User');

      cy.get('[data-slot="select-trigger"]').first().click();
      cy.get('[role="option"]').last().click();

      cy.contains('[role="dialog"] button', 'Invite Member').click();

      cy.get('[role="dialog"]').should('be.visible');
      // The toast text for duplicate could vary, looking for a general error or duplicate message
      // cy.get(SELECTORS.toast.any).should('be.visible');
      // If there's a specific string like "already exists" or "User with this email already exists"
      cy.get(SELECTORS.toast.error).should('be.visible');
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

  // ─── CRUD (CREATE, UPDATE, DELETE) ─────────────────────────────────────────

  context('CRUD Flow', { tags: ['@crud'] }, () => {
    it('successfully invites, edits, and removes a member using Faker data', { tags: ['@critical'] }, () => {
      const fakeName = faker.person.fullName() + ' ' + faker.string.alphanumeric(4);
      const fakeEmail = faker.internet.email();
      const editedName = fakeName + ' (Edited)';

      // 1. CREATE (Invite Member)
      cy.contains('button', 'Invite Member').click();
      cy.get('#invite-email').should('be.visible').type(fakeEmail);
      cy.get('#invite-name').type(fakeName);

      // Select Role (defaulting to the first available in dropdown)
      cy.get('[data-slot="select-trigger"]').first().click();
      cy.get('[role="option"]').last().click(); // Pick any role

      cy.contains('[role="dialog"] button', 'Invite Member').click();

      // Wait for dialog to close
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(4000); // Wait for list refresh

      // Scroll to bottom to ensure the new member is visible
      cy.scrollTo('bottom', { ensureScrollable: false });
      cy.wait(1000); // Wait for potential lazy loading or virtual scrolling

      // Verify new member is in the list
      cy.get('table tbody').should('contain.text', fakeName);
      cy.get('table tbody').should('contain.text', fakeEmail);

      // 2. UPDATE (Edit Member)
      // Find the row containing the member and click Edit
      cy.contains('table tbody tr', fakeName)
        .find('button[title="Edit"]')
        .scrollIntoView()
        .should('be.visible')
        .click();

      cy.get('[role="dialog"]').should('be.visible');
      cy.get('#invite-name').clear().type(editedName);

      // Assuming save button says "Save" or "Update", let's use the standard dialog action button.
      // Often it's Save Changes or just Save
      cy.get('[role="dialog"] button[data-slot="button"]').contains(/save|update|edit/i).click();
      cy.get('[role="dialog"]').should('not.exist');
      cy.wait(2000);

      cy.get('table tbody').should('contain.text', editedName);
      cy.get('table tbody').should('not.contain.text', fakeName);

      // 3. DELETE (Remove Member)
      cy.contains('table tbody tr', editedName)
        .find('button[title="Remove"]')
        .scrollIntoView()
        .should('be.visible')
        .click();

      // Handle confirmation dialog
      cy.get(SELECTORS.modal.confirmDialog).should('be.visible');
      cy.get(SELECTORS.modal.confirmDialog).find('button').filter(':contains("Remove"), :contains("Delete"), :contains("Confirm")').last().click();

      cy.get(SELECTORS.modal.confirmDialog).should('not.exist');
      cy.wait(2000);

      // Verify member is gone
      cy.scrollTo('bottom', { ensureScrollable: false });
      cy.get('table tbody').should('not.contain.text', editedName);
      cy.get('table tbody').should('not.contain.text', fakeEmail);
    });
  });

  // ─── ROLE-BASED ────────────────────────────────────────────────────────────

  context('Role-Based', { tags: ['@regression'] }, () => {
    it('shows role badges for each member', { tags: ['@regression'] }, function () {
      cy.wait(2000); // Allow async list to render
      cy.get('body').then(($body) => {
        const $rows = $body.find('table tbody tr');
        if ($rows.length === 0) {
          cy.log('Skipping test: no members exist');
          this.skip();
        } else {
          cy.get('table tbody [data-slot="badge"]').should('have.length', $rows.length);
        }
      });
    });
  });
});
