import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const M = SELECTORS.modal;

/**
 * Page object for the Settings → Roles module.
 *
 * LIST page (/settings/roles):
 *  - Heading "Roles"
 *  - "Create Role" button always present
 *  - Each role row has button[title="Edit"]
 *  - Custom (deletable) roles have button[title="Delete"]
 *  - System roles (Admin, Owner, …) do NOT have button[title="Delete"]
 *  - [data-slot="badge"] elements show permission count/labels per role
 *
 * CREATE / EDIT dialogs:
 *  - Open via [role="dialog"]
 *  - Role name: #role-name (most likely) or first [data-slot="input"]
 *  - Permissions: [role="switch"] or [role="checkbox"] or input[type="checkbox"]
 *  - Submit: button:contains("Create Role") or "Save"
 *  - Cancel: button:contains("Cancel")
 *  - Close: [data-slot="dialog-close"]
 *
 * NOTE: Run the discovery probe first to verify selectors:
 *   npx cypress run --spec "cypress/e2e/_discovery/discover-roles-permissions.cy.js"
 */
export class RolesPage extends BasePage {
  constructor() {
    super('/settings/roles');
  }

  waitUntilReady() {
    cy.url().should('include', '/settings/roles');
    cy.contains('h1, h2, h3', 'Roles', { timeout: 15000 }).should('be.visible');
    return this;
  }

  // ─── List ─────────────────────────────────────────────────────────────────

  /** Assert at least one role exists (has at least one Edit button). */
  assertRolesLoaded() {
    cy.get('button[title="Edit"]').should('have.length.greaterThan', 0);
    return this;
  }

  /** Assert a role with the given name is visible on the list. */
  assertRoleVisible(name) {
    cy.get('body').should('contain.text', name);
    return this;
  }

  /** Assert a role with the given name is NOT visible on the list. */
  assertRoleNotVisible(name) {
    cy.get('body').should('not.contain.text', name);
    return this;
  }

  /** Assert the Create Role button is present. */
  assertCreateButtonVisible() {
    cy.contains('button', 'Create Role').should('be.visible');
    return this;
  }

  // ─── Open Create Role dialog ──────────────────────────────────────────────

  openCreateRole() {
    cy.contains('button', 'Create Role').should('be.visible').click();
    cy.get(M.dialog, { timeout: 10000 }).should('be.visible');
    return this;
  }

  // ─── Fill role form (works for both Create and Edit dialogs) ─────────────

  /** Fill the role name field. Falls back through likely selectors. */
  fillRoleName(name) {
    // Try the ID pattern used throughout the app; fall back to first input.
    cy.get(M.dialog).within(() => {
      cy.get('input[id*="role"], input[id*="name"], [data-slot="input"]')
        .first()
        .should('be.visible')
        .clear()
        .type(name);
    });
    return this;
  }

  clearRoleName() {
    cy.get(M.dialog).within(() => {
      cy.get('input[id*="role"], input[id*="name"], [data-slot="input"]')
        .first()
        .clear();
    });
    return this;
  }

  fillRoleDescription(description) {
    cy.get(M.dialog).within(() => {
      cy.get('textarea, [data-slot="textarea"]').first().clear().type(description);
    });
    return this;
  }

  // ─── Permission toggles ──────────────────────────────────────────────────

  /**
   * Enable a permission by its label text. Works for both Radix switches and
   * native checkboxes. Passes the label text to cy.contains() so partial
   * matches work.
   *
   * @example enablePermission('Jobs') → enables the first toggle next to a label containing "Jobs"
   * @example enablePermission('View', 'Jobs') → enables the "View" toggle within the Jobs section
   */
  enablePermission(label, sectionLabel) {
    cy.get(M.dialog).within(() => {
      if (sectionLabel) {
        cy.contains(sectionLabel)
          .closest('section, div, tr, li')
          .contains(label)
          .closest('label, div, td, li')
          .find('[role="switch"], [role="checkbox"], input[type="checkbox"]')
          .first()
          .then(($el) => {
            const isChecked =
              $el.attr('aria-checked') === 'true' ||
              $el.prop('checked') === true ||
              $el.attr('data-state') === 'checked';
            if (!isChecked) cy.wrap($el).click();
          });
      } else {
        cy.contains('label, [data-slot="label"]', label)
          .closest('div, tr, li')
          .find('[role="switch"], [role="checkbox"], input[type="checkbox"]')
          .first()
          .then(($el) => {
            const isChecked =
              $el.attr('aria-checked') === 'true' ||
              $el.prop('checked') === true ||
              $el.attr('data-state') === 'checked';
            if (!isChecked) cy.wrap($el).click();
          });
      }
    });
    return this;
  }

  /** Enable ALL permission toggles inside the dialog. */
  enableAllPermissions() {
    cy.get(M.dialog).within(() => {
      cy.get('[role="switch"], [role="checkbox"], input[type="checkbox"]').each(($el) => {
        const isChecked =
          $el.attr('aria-checked') === 'true' ||
          $el.prop('checked') === true ||
          $el.attr('data-state') === 'checked';
        if (!isChecked) cy.wrap($el).click();
      });
    });
    return this;
  }

  /** Disable ALL permission toggles inside the dialog. */
  disableAllPermissions() {
    cy.get(M.dialog).within(() => {
      cy.get('[role="switch"], [role="checkbox"], input[type="checkbox"]').each(($el) => {
        const isChecked =
          $el.attr('aria-checked') === 'true' ||
          $el.prop('checked') === true ||
          $el.attr('data-state') === 'checked';
        if (isChecked) cy.wrap($el).click();
      });
    });
    return this;
  }

  /** Assert at least one permission toggle exists in the dialog. */
  assertPermissionsVisible() {
    cy.get(M.dialog)
      .find('[role="switch"], [role="checkbox"], input[type="checkbox"]')
      .should('have.length.greaterThan', 0);
    return this;
  }

  /** Count the number of permission toggles in the dialog. */
  countPermissions() {
    return cy
      .get(M.dialog)
      .find('[role="switch"], [role="checkbox"], input[type="checkbox"]')
      .its('length');
  }

  // ─── Submit / Cancel / Close ──────────────────────────────────────────────

  submitRole() {
    cy.get(M.dialog).within(() => {
      cy.contains('button', /create role|save|update/i)
        .should('be.visible')
        .click();
    });
    return this;
  }

  cancelRole() {
    cy.get(M.dialog).within(() => {
      cy.contains('button', /cancel/i).click();
    });
    cy.get(M.dialog).should('not.exist');
    return this;
  }

  closeRoleDialog() {
    cy.get('[data-slot="dialog-close"]').click();
    cy.get(M.dialog).should('not.exist');
    return this;
  }

  // ─── Full create flow ─────────────────────────────────────────────────────

  /**
   * Create a role: opens dialog, fills name, optionally enables all permissions,
   * submits. Expects dialog to close on success.
   */
  createRole(name, { description, enableAll = false } = {}) {
    this.openCreateRole();
    this.fillRoleName(name);
    if (description) this.fillRoleDescription(description);
    if (enableAll) this.enableAllPermissions();
    this.submitRole();
    cy.get(M.dialog).should('not.exist');
    return this;
  }

  // ─── Edit ─────────────────────────────────────────────────────────────────

  /** Open Edit dialog for the role whose name is visible on the list.
   *  Falls back to opening by index if name is not matchable. */
  openEditRole(nameOrIndex = 0) {
    if (typeof nameOrIndex === 'string') {
      cy.contains(nameOrIndex)
        .closest('li, article, [data-slot="card"], tr, div')
        .find('button[title="Edit"]')
        .should('be.visible')
        .click();
    } else {
      cy.get('button[title="Edit"]').eq(nameOrIndex).should('be.visible').click();
    }
    cy.get(M.dialog, { timeout: 10000 }).should('be.visible');
    return this;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  /** Open Delete confirmation for a role by name or index. */
  openDeleteRole(nameOrIndex = 0) {
    if (typeof nameOrIndex === 'string') {
      cy.contains(nameOrIndex)
        .closest('li, article, [data-slot="card"], tr, div')
        .find('button[title="Delete"]')
        .should('be.visible')
        .click();
    } else {
      cy.get('button[title="Delete"]').eq(nameOrIndex).should('be.visible').click();
    }
    cy.get(M.dialog, { timeout: 10000 }).should('be.visible');
    return this;
  }

  confirmDelete() {
    cy.get(M.dialog).within(() => {
      cy.contains('button', /delete|confirm/i).last().click();
    });
    cy.get(M.dialog).should('not.exist');
    return this;
  }

  cancelDelete() {
    cy.get(M.dialog).within(() => {
      cy.contains('button', /cancel/i).click();
    });
    cy.get(M.dialog).should('not.exist');
    return this;
  }

  /** Full delete flow: finds role by name, confirms deletion. */
  deleteRole(name) {
    this.openDeleteRole(name);
    this.confirmDelete();
    return this;
  }

  // ─── Role verification ────────────────────────────────────────────────────

  /** Assert a specific role does NOT have a Delete button (system role). */
  assertRoleNotDeletable(name) {
    cy.contains(name)
      .closest('li, article, [data-slot="card"], tr, div')
      .find('button[title="Delete"]')
      .should('not.exist');
    return this;
  }

  /** Assert the role appears in the Members invite role dropdown. */
  assertRoleInMembersDropdown(roleName) {
    cy.visit('/settings/members');
    cy.contains('button', 'Invite Member').click();
    cy.get(M.dialog).should('be.visible');
    cy.get('[data-slot="select-trigger"]').first().click();
    cy.contains('[role="option"], [data-slot="select-item"]', roleName).should('be.visible');
    cy.get('[data-slot="dialog-close"]').click();
    cy.get(M.dialog).should('not.exist');
    return this;
  }
}
