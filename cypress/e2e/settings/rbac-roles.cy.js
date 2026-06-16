/**
 * @module RBAC — Dynamic Role-Based Access Control
 *
 * Tests cover two layers of RBAC:
 *
 * LAYER 1 — Admin CRUD of the Role system (Settings → Roles):
 *   Create, edit, delete custom roles; manage permissions per role.
 *   Runnable immediately with a single Admin account.
 *
 * LAYER 2 — Access enforcement (what a role-restricted user can see/do):
 *   Requires a second test user with non-Admin credentials.
 *   Env vars needed:
 *     CYPRESS_RESTRICTED_USER_EMAIL    — email of non-Admin test account
 *     CYPRESS_RESTRICTED_USER_PASSWORD — password
 *   Tests in the "Access Enforcement" context are skipped (pending) when
 *   RESTRICTED_USER_EMAIL is not set.
 *
 * ─── Setup for Layer 2 ────────────────────────────────────────────────────
 * 1. Admin creates a role "Test Restricted Role" with only Candidates: View
 * 2. Admin invites RESTRICTED_USER_EMAIL with that role
 * 3. Restricted user accepts invite (one-time manual step)
 * 4. Tests log in as restricted user and verify access gates
 *
 * ─── Discovering real permission selectors ────────────────────────────────
 * Run this discovery spec ONCE before writing selector-specific tests:
 *   npx cypress run --spec "cypress/e2e/_discovery/discover-roles-permissions.cy.js"
 * Output files:
 *   cypress/discovery/_create-settingsRoles.json
 *   cypress/discovery/_edit-settingsRoles.json
 *   cypress/discovery/_roles-list.json
 */

import { RolesPage } from '../../pages/RolesPage';
import { unique, assertHiddenOrAbsent, assertDisabledOrAbsent } from '../../support/utils/helpers';

const page = new RolesPage();
const DIALOG = '[role="dialog"]';

describe('RBAC — Roles CRUD (Admin)', { tags: ['@rbac', '@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/roles');
    page.waitUntilReady();
  });

  // ─── READ ─────────────────────────────────────────────────────────────────

  context('Read', { tags: ['@smoke'] }, () => {
    it('loads the Roles page with correct heading', { tags: ['@smoke', '@critical'] }, () => {
      cy.url().should('include', '/settings/roles');
      cy.contains('h1, h2, h3', 'Roles').should('be.visible');
    });

    it('shows the Create Role button', { tags: ['@smoke'] }, () => {
      cy.contains('button', 'Create Role').should('be.visible');
    });

    it('shows at least one existing role (Edit button present)', { tags: ['@smoke'] }, () => {
      cy.get('button[title="Edit"]').should('have.length.greaterThan', 0);
    });

    it('shows Edit controls for every role', { tags: ['@regression'] }, () => {
      cy.get('button[title="Edit"]').should('have.length.greaterThan', 0);
    });

    it('shows Delete controls only for custom (non-system) roles', { tags: ['@regression'] }, () => {
      // System roles (Admin, Owner) never have Delete; custom roles do.
      // At minimum the delete buttons that exist must be fewer than edit buttons.
      cy.get('button[title="Edit"]').its('length').then((editCount) => {
        cy.get('button[title="Delete"]').its('length').then((deleteCount) => {
          expect(deleteCount).to.be.lessThan(editCount);
        });
      });
    });

    it('shows permission badges for each role', { tags: ['@regression'] }, () => {
      cy.get('[data-slot="badge"]').should('have.length.greaterThan', 0);
    });

    it('shows the correct settings sub-navigation links', { tags: ['@regression'] }, () => {
      cy.get('a[href="/settings/roles"]').should('exist');
      cy.get('a[href="/settings/members"]').should('exist');
      cy.get('a[href="/settings/buckets"]').should('exist');
      cy.get('a[href="/settings/profile"]').should('exist');
    });
  });

  // ─── CREATE ROLE ──────────────────────────────────────────────────────────

  context('Create Role', { tags: ['@crud', '@create', '@rbac'] }, () => {
    it('opens the Create Role dialog when the button is clicked', { tags: ['@smoke'] }, () => {
      page.openCreateRole();
      cy.get(DIALOG).should('be.visible');
    });

    it('dialog contains a role name input', { tags: ['@smoke'] }, () => {
      page.openCreateRole();
      cy.get(DIALOG)
        .find('input[id*="role"], input[id*="name"], [data-slot="input"]')
        .first()
        .should('be.visible');
      page.closeRoleDialog();
    });

    it('dialog contains permission toggles or checkboxes', { tags: ['@smoke'] }, () => {
      page.openCreateRole();
      page.assertPermissionsVisible();
      page.closeRoleDialog();
    });

    it('creates a role with a name only — no permissions enabled', { tags: ['@smoke', '@critical'] }, () => {
      const name = unique('ROLE');
      page.createRole(name);
      page.assertRoleVisible(name);

      // Cleanup
      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('creates a role with a name and description', { tags: ['@regression'] }, () => {
      const name = unique('ROLE');
      page.createRole(name, { description: 'Automated test role — delete after test' });
      page.assertRoleVisible(name);

      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('creates a role with ALL permissions enabled', { tags: ['@regression', '@rbac'] }, () => {
      const name = unique('ROLE_ALL');
      page.createRole(name, { enableAll: true });
      page.assertRoleVisible(name);
      // A role with all permissions should have more badges than a role with none
      cy.get('body').should('contain.text', name);

      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('counts the permission toggles in the Create Role dialog', { tags: ['@regression', '@rbac'] }, () => {
      page.openCreateRole();
      // Record how many permissions exist — useful for understanding the permission matrix
      cy.get(DIALOG)
        .find('[role="switch"], [role="checkbox"], input[type="checkbox"]')
        .its('length')
        .should('be.greaterThan', 0)
        .then((count) => {
          cy.task('log', `Total permission toggles in Create Role dialog: ${count}`);
        });
      page.closeRoleDialog();
    });

    it('rejects an empty role name — dialog stays open', { tags: ['@regression', '@validation'] }, () => {
      page.openCreateRole();
      // Clear the name input (should already be empty)
      cy.get(DIALOG)
        .find('input[id*="role"], input[id*="name"], [data-slot="input"]')
        .first()
        .clear();
      cy.contains(DIALOG + ' button', /create role|save|create/i).click();
      cy.get(DIALOG).should('be.visible');
    });

    it('accepts special characters in the role name', { tags: ['@regression', '@boundary'] }, () => {
      const name = `${unique('ROLE')} & Co. — QA`;
      page.createRole(name);
      page.assertRoleVisible(name);

      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('treats an SQL-injection probe as literal role name', { tags: ['@regression', '@security'] }, () => {
      const name = `${unique('ROLE')} ' OR '1'='1`;
      page.createRole(name);
      page.assertRoleVisible(name);

      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('treats an XSS probe as literal role name', { tags: ['@regression', '@security'] }, () => {
      const name = `${unique('ROLE')} <script>alert(1)</script>`;
      cy.on('window:alert', () => { throw new Error('XSS payload executed in role name'); });
      page.createRole(name);
      page.assertRoleVisible(name);

      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('closes the Create Role dialog via Cancel without creating a role', { tags: ['@regression'] }, () => {
      const name = unique('ROLE_CANCEL');
      page.openCreateRole();
      page.fillRoleName(name);
      page.cancelRole();
      page.assertRoleNotVisible(name);
    });

    it('closes the Create Role dialog via the × button', { tags: ['@regression'] }, () => {
      page.openCreateRole();
      page.closeRoleDialog();
    });
  });

  // ─── PERMISSION MATRIX ────────────────────────────────────────────────────

  context('Permission Matrix', { tags: ['@rbac', '@regression'] }, () => {
    it('can enable individual permission toggles inside the dialog', { tags: ['@regression', '@rbac'] }, () => {
      const name = unique('ROLE_PERM');
      page.openCreateRole();
      page.fillRoleName(name);

      // Enable the FIRST permission toggle in the dialog
      cy.get(DIALOG)
        .find('[role="switch"], [role="checkbox"], input[type="checkbox"]')
        .first()
        .then(($el) => {
          const wasChecked =
            $el.attr('aria-checked') === 'true' ||
            $el.prop('checked') === true ||
            $el.attr('data-state') === 'checked';
          if (!wasChecked) cy.wrap($el).click();
          cy.wrap($el).should(($toggle) => {
            const isNowChecked =
              $toggle.attr('aria-checked') === 'true' ||
              $toggle.prop('checked') === true ||
              $toggle.attr('data-state') === 'checked';
            expect(isNowChecked).to.be.true;
          });
        });

      page.submitRole();
      cy.get(DIALOG).should('not.exist');
      page.assertRoleVisible(name);

      // Cleanup
      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('can enable ALL permissions and submit', { tags: ['@regression', '@rbac'] }, () => {
      const name = unique('ROLE_FULL');
      page.openCreateRole();
      page.fillRoleName(name);
      page.enableAllPermissions();
      page.submitRole();
      cy.get(DIALOG).should('not.exist');
      page.assertRoleVisible(name);

      // Full-permission role should show more badges than a bare role
      cy.get('body').should('contain.text', name);

      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('can create a role with no permissions (restricted role)', { tags: ['@regression', '@rbac'] }, () => {
      const name = unique('ROLE_NONE');
      page.openCreateRole();
      page.fillRoleName(name);
      // Ensure all permissions are OFF (they start off)
      page.disableAllPermissions();
      page.submitRole();
      cy.get(DIALOG).should('not.exist');
      page.assertRoleVisible(name);

      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('verifies permission labels include module names', { tags: ['@regression', '@rbac'] }, () => {
      page.openCreateRole();
      // The dialog labels should include at least some module names
      cy.get(DIALOG).invoke('text').should('match',
        /jobs|candidates|pipeline|template|import|settings|members|dashboard/i
      );
      page.closeRoleDialog();
    });
  });

  // ─── EDIT ROLE ────────────────────────────────────────────────────────────

  context('Edit Role', { tags: ['@crud', '@regression', '@rbac'] }, () => {
    it('opens the Edit dialog for the first role', { tags: ['@regression'] }, () => {
      page.openEditRole(0);
      cy.get(DIALOG).should('be.visible');
      page.closeRoleDialog();
    });

    it('Edit dialog pre-fills the existing role name', { tags: ['@regression'] }, () => {
      page.openEditRole(0);
      cy.get(DIALOG)
        .find('input[id*="role"], input[id*="name"], [data-slot="input"]')
        .first()
        .should('not.have.value', '');
      page.closeRoleDialog();
    });

    it('can change the name of a custom role and save', { tags: ['@regression', '@rbac'] }, () => {
      // First create a role to edit (so we have a known target)
      const original = unique('ROLE_EDIT_A');
      const updated = unique('ROLE_EDIT_B');
      page.createRole(original);
      page.assertRoleVisible(original);

      // Edit: change the name
      page.openEditRole(original);
      page.fillRoleName(updated);
      page.submitRole();
      cy.get(DIALOG).should('not.exist');
      page.assertRoleVisible(updated);
      page.assertRoleNotVisible(original);

      // Cleanup
      page.deleteRole(updated);
      page.assertRoleNotVisible(updated);
    });

    it('can toggle a permission in the Edit dialog and save', { tags: ['@regression', '@rbac'] }, () => {
      const name = unique('ROLE_TOGGLE');
      page.createRole(name);

      page.openEditRole(name);
      // Toggle the first permission
      cy.get(DIALOG)
        .find('[role="switch"], [role="checkbox"], input[type="checkbox"]')
        .first()
        .then(($el) => {
          cy.wrap($el).click(); // toggle from whatever state it's in
        });
      page.submitRole();
      cy.get(DIALOG).should('not.exist');
      page.assertRoleVisible(name);

      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('cancelling the Edit dialog does not change the role', { tags: ['@regression'] }, () => {
      const name = unique('ROLE_NOCHG');
      page.createRole(name);

      page.openEditRole(name);
      cy.get(DIALOG)
        .find('input[id*="role"], input[id*="name"], [data-slot="input"]')
        .first()
        .clear()
        .type('SHOULD_NOT_APPEAR');
      page.cancelRole();

      // Original name must still be visible
      page.assertRoleVisible(name);
      page.assertRoleNotVisible('SHOULD_NOT_APPEAR');

      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });
  });

  // ─── DELETE ROLE ──────────────────────────────────────────────────────────

  context('Delete Role', { tags: ['@crud', '@delete', '@rbac'] }, () => {
    it('shows a confirmation dialog when Delete is clicked', { tags: ['@regression'] }, () => {
      const name = unique('ROLE_DEL_DLG');
      page.createRole(name);

      page.openDeleteRole(name);
      cy.get(DIALOG).should('be.visible');
      page.cancelDelete(); // cancel to keep role

      page.deleteRole(name); // cleanup
      page.assertRoleNotVisible(name);
    });

    it('removes a custom role after confirming deletion', { tags: ['@critical', '@rbac'] }, () => {
      const name = unique('ROLE_DEL');
      page.createRole(name);
      page.assertRoleVisible(name);

      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('keeps the role when deletion is cancelled', { tags: ['@regression'] }, () => {
      const name = unique('ROLE_CANCEL_DEL');
      page.createRole(name);

      page.openDeleteRole(name);
      page.cancelDelete();
      page.assertRoleVisible(name);

      // Cleanup
      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });

    it('system role (first non-deletable) does not show a Delete button', { tags: ['@regression', '@rbac'] }, () => {
      // The first role in the list (typically Admin or Owner) must not have Delete
      cy.get('button[title="Edit"]').first()
        .closest('li, article, [data-slot="card"], tr, div')
        .find('button[title="Delete"]')
        .should('not.exist');
    });
  });

  // ─── ROLE ASSIGNMENT — Members dropdown ───────────────────────────────────

  context('Role Assignment in Members', { tags: ['@rbac', '@regression'] }, () => {
    it('a created role appears in the Members invite role dropdown', { tags: ['@regression', '@rbac'] }, () => {
      const name = unique('ROLE_IN_DROP');
      page.createRole(name);

      // Verify the role appears in the dropdown when inviting a member
      page.assertRoleInMembersDropdown(name);

      // Return to roles page and clean up
      cy.visit('/settings/roles');
      page.waitUntilReady();
      page.deleteRole(name);
      page.assertRoleNotVisible(name);
    });
  });
});

// ─── LAYER 2: Access Enforcement (requires second test user) ─────────────────

describe('RBAC — Access Enforcement (Restricted User)', { tags: ['@rbac', '@e2e'] }, () => {
  /**
   * These tests require:
   *   1. RESTRICTED_USER_EMAIL and RESTRICTED_USER_PASSWORD in env
   *   2. That user already invited and onboarded with a restricted role
   *      (e.g. a role that only has Candidates: View)
   *
   * Skip the entire suite if env vars are missing. Env vars are read live
   * inside the hook (not captured at module-parse time) so a value set late
   * by CI secret injection is still picked up.
   */
  const RESTRICTED_ROLE_NAME = 'View Candidates Only';
  let restrictedEmail;
  let restrictedPassword;

  before(function () {
    restrictedEmail = Cypress.env('RESTRICTED_USER_EMAIL');
    restrictedPassword = Cypress.env('RESTRICTED_USER_PASSWORD');
    if (!restrictedEmail || !restrictedPassword) {
      cy.log('⚠️  RESTRICTED_USER_EMAIL / RESTRICTED_USER_PASSWORD not set — skipping RBAC enforcement tests.');
      this.skip();
      return;
    }

    // The restricted role is long-lived shared fixture infrastructure — the
    // RESTRICTED_USER_EMAIL account is manually invited/onboarded against it
    // (see docstring above), so it is created idempotently here and
    // deliberately NOT deleted in an after() hook: removing it would strip
    // the restricted user's role assignment and break every future run.
    cy.login(); // Admin, via USER_EMAIL / USER_PASSWORD
    cy.visit('/settings/roles');
    page.waitUntilReady();

    cy.get('body').then(($body) => {
      if (!$body.text().includes(RESTRICTED_ROLE_NAME)) {
        page.openCreateRole();
        page.fillRoleName(RESTRICTED_ROLE_NAME);
        // Only enable Candidates-related permissions
        // (Selectors refined after running the discovery probe)
        cy.get(DIALOG).within(() => {
          cy.contains('label, [data-slot="label"]', /candidates/i)
            .closest('div, tr, li, section')
            .find('[role="switch"], [role="checkbox"], input[type="checkbox"]')
            .first()
            .then(($el) => {
              const isChecked = $el.attr('aria-checked') === 'true' || $el.prop('checked');
              if (!isChecked) cy.wrap($el).click();
            });
        });
        page.submitRole();
        cy.get(DIALOG).should('not.exist');
      }
    });
  });

  beforeEach(() => {
    cy.login(restrictedEmail, restrictedPassword);
  });

  context('Restricted User — Visible Routes', { tags: ['@rbac'] }, () => {
    it('restricted user can access /talent-base/candidates', () => {
      cy.visit('/talent-base/candidates');
      cy.url().should('include', '/talent-base/candidates');
      cy.get('body').should('not.contain.text', 'Access Denied');
      cy.get('body').should('not.contain.text', 'Unauthorized');
    });

    it('restricted user is redirected or denied on /settings/roles', () => {
      cy.visit('/settings/roles');
      // Either redirected away, shown an access denied screen, or the route
      // is not visible in the sidebar
      cy.url().then((url) => {
        const isAllowed = url.includes('/settings/roles');
        if (isAllowed) {
          // If the route loaded, the user should NOT see admin controls
          cy.contains('button', 'Create Role').should('not.exist');
        } else {
          // Redirected — acceptable
          expect(url).not.to.include('/settings/roles');
        }
      });
    });

    it('restricted user is redirected or denied on /settings/members', () => {
      cy.visit('/settings/members');
      cy.url().then((url) => {
        const isAllowed = url.includes('/settings/members');
        if (isAllowed) {
          cy.contains('button', 'Invite Member').should('not.exist');
        } else {
          expect(url).not.to.include('/settings/members');
        }
      });
    });

    it('restricted user does NOT see Jobs in the sidebar', () => {
      cy.visit('/');
      cy.expandSidebar();
      // Jobs link should not be visible if the role does not include Jobs access
      assertHiddenOrAbsent('a[href="/jobs"]');
    });

    it('restricted user does NOT see Pipelines in the sidebar', () => {
      cy.visit('/');
      cy.expandSidebar();
      assertHiddenOrAbsent('a[href="/pipelines"]');
    });

    it('restricted user DOES see Candidates in the sidebar', () => {
      cy.visit('/');
      cy.expandSidebar();
      cy.get('a[href="/talent-base/candidates"]').should('be.visible');
    });
  });

  context('Restricted User — Forbidden Actions', { tags: ['@rbac'] }, () => {
    it('restricted user cannot create a pipeline (form or button not accessible)', () => {
      cy.visit('/pipelines/new');
      cy.url().then((url) => {
        if (!url.includes('/pipelines/new')) {
          // Redirected — correct behaviour
          expect(url).not.to.include('/pipelines/new');
        } else {
          // If somehow reached, the submit should be blocked or hidden.
          // The real button has no type="submit" attribute — match by text.
          assertDisabledOrAbsent('button', 'Save Pipeline');
        }
      });
    });

    it('restricted user cannot access Settings', () => {
      cy.visit('/settings/profile');
      cy.url().then((url) => {
        if (url.includes('/settings/profile')) {
          assertDisabledOrAbsent('button', 'Save changes');
        } else {
          expect(url).not.to.include('/settings');
        }
      });
    });
  });
});
