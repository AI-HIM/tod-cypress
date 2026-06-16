/**
 * @discovery discover-roles-permissions
 *
 * Run ONCE to capture the live Create Role and Edit Role dialog structures.
 * Output is saved to cypress/discovery/ for use in writing verified RBAC tests.
 *
 * Run with:
 *   npx cypress run --spec "cypress/e2e/_discovery/discover-roles-permissions.cy.js"
 *
 * Excluded from normal CI via cypress.config.js excludeSpecPattern.
 */

describe('Discover: Roles Permission Dialog', { tags: ['@discovery'] }, () => {
  before(() => {
    cy.login();
  });

  it('captures the Create Role dialog structure', () => {
    cy.visit('/settings/roles');
    cy.contains('h1, h2, h3', 'Roles', { timeout: 15000 }).should('be.visible');

    // Open Create Role dialog
    cy.contains('button', 'Create Role').should('be.visible').click();
    cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');

    cy.get('[role="dialog"]').then(($dialog) => {
      const result = {
        heading: [],
        inputs: [],
        textareas: [],
        checkboxes: [],
        switches: [],
        buttons: [],
        labels: [],
        permissionSections: [],
      };

      // Headings inside dialog
      $dialog.find('h1, h2, h3, h4, [data-slot="dialog-title"]').each((_, el) => {
        result.heading.push({ tag: el.tagName, text: el.textContent.trim() });
      });

      // Text inputs
      $dialog.find('input[type="text"], input:not([type])').each((_, el) => {
        result.inputs.push({
          id: el.id, name: el.name, placeholder: el.placeholder,
          'data-slot': el.getAttribute('data-slot'),
        });
      });

      // Textareas
      $dialog.find('textarea').each((_, el) => {
        result.textareas.push({
          id: el.id, name: el.name, placeholder: el.placeholder,
        });
      });

      // Native checkboxes
      $dialog.find('input[type="checkbox"]').each((_, el) => {
        result.checkboxes.push({
          id: el.id, name: el.name,
          'aria-label': el.getAttribute('aria-label'),
          'data-slot': el.getAttribute('data-slot'),
          checked: el.checked,
        });
      });

      // Radix switches / checkboxes
      $dialog.find('[role="switch"], [role="checkbox"]').each((_, el) => {
        result.switches.push({
          role: el.getAttribute('role'),
          id: el.id,
          'aria-label': el.getAttribute('aria-label'),
          'aria-checked': el.getAttribute('aria-checked'),
          'data-slot': el.getAttribute('data-slot'),
          text: el.textContent.trim().substring(0, 60),
        });
      });

      // Labels — capture which permissions are labeled
      $dialog.find('label, [data-slot="label"]').each((_, el) => {
        result.labels.push({
          for: el.getAttribute('for'),
          text: el.textContent.trim().substring(0, 80),
        });
      });

      // Section headings within the permission matrix (p, span, div with text)
      $dialog.find('h2, h3, h4, h5, [class*="section"], [class*="module"], [class*="group"]').each((_, el) => {
        const txt = el.textContent.trim();
        if (txt.length > 0 && txt.length < 60) {
          result.permissionSections.push(txt);
        }
      });

      // Action buttons
      $dialog.find('button').each((_, el) => {
        result.buttons.push({
          text: el.textContent.trim().substring(0, 40),
          type: el.type,
          'data-slot': el.getAttribute('data-slot'),
        });
      });

      cy.writeFile('cypress/discovery/_create-settingsRoles.json', result);
      cy.task('log', `Create Role dialog: ${result.switches.length} switches, ${result.checkboxes.length} checkboxes, ${result.labels.length} labels`);
    });

    // Close dialog
    cy.get('[data-slot="dialog-close"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('captures the Edit Role dialog structure (first role)', () => {
    cy.visit('/settings/roles');
    cy.contains('h1, h2, h3', 'Roles', { timeout: 15000 }).should('be.visible');

    // Capture the existing role names from the list
    cy.get('body').then(($body) => {
      const roleItems = [];
      $body.find('[data-slot="badge"]').each((_, el) => {
        roleItems.push(el.textContent.trim());
      });
      cy.task('log', `Role badges found: ${JSON.stringify(roleItems.slice(0, 20))}`);
    });

    // Open Edit for the first role
    cy.get('button[title="Edit"]').first().should('be.visible').click();
    cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');

    cy.get('[role="dialog"]').then(($dialog) => {
      const result = {
        heading: [],
        inputs: [],
        switches: [],
        checkboxes: [],
        labels: [],
        permissionSections: [],
        buttons: [],
      };

      $dialog.find('h1, h2, h3, h4, [data-slot="dialog-title"]').each((_, el) => {
        result.heading.push(el.textContent.trim());
      });

      $dialog.find('input[type="text"], input:not([type])').each((_, el) => {
        result.inputs.push({
          id: el.id, placeholder: el.placeholder, value: el.value,
        });
      });

      $dialog.find('[role="switch"], [role="checkbox"]').each((_, el) => {
        result.switches.push({
          role: el.getAttribute('role'),
          'aria-label': el.getAttribute('aria-label'),
          'aria-checked': el.getAttribute('aria-checked'),
          id: el.id,
        });
      });

      $dialog.find('input[type="checkbox"]').each((_, el) => {
        result.checkboxes.push({
          id: el.id, 'aria-label': el.getAttribute('aria-label'), checked: el.checked,
        });
      });

      $dialog.find('label, [data-slot="label"]').each((_, el) => {
        result.labels.push(el.textContent.trim().substring(0, 80));
      });

      $dialog.find('h2, h3, h4, h5').each((_, el) => {
        const txt = el.textContent.trim();
        if (txt) result.permissionSections.push(txt);
      });

      $dialog.find('button').each((_, el) => {
        result.buttons.push({ text: el.textContent.trim().substring(0, 40), type: el.type });
      });

      cy.writeFile('cypress/discovery/_edit-settingsRoles.json', result);
      cy.task('log', `Edit Role dialog: ${result.switches.length} switches, ${result.inputs.length} inputs`);
    });

    cy.get('[data-slot="dialog-close"]').click();
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('captures role names from the list page', () => {
    cy.visit('/settings/roles');
    cy.contains('h1, h2, h3', 'Roles', { timeout: 15000 }).should('be.visible');

    cy.get('body').then(($body) => {
      const roles = [];
      const hasDelete = [];

      // Try various selectors that might hold role name text
      $body.find('[data-slot="card"], article, li, [class*="role"]').each((_, el) => {
        const text = el.textContent.trim().substring(0, 100);
        if (text.length > 1 && text.length < 60) {
          roles.push(text);
        }
      });

      // Which roles have delete buttons
      $body.find('button[title="Delete"]').each((_, el) => {
        const parent = el.closest('li, article, [data-slot="card"], div');
        if (parent) hasDelete.push(parent.textContent.trim().substring(0, 60));
      });

      const rolePageInfo = {
        potentialRoleTexts: roles.slice(0, 20),
        deletableRoleTexts: hasDelete,
        editButtonCount: $body.find('button[title="Edit"]').length,
        deleteButtonCount: $body.find('button[title="Delete"]').length,
        badgeCount: $body.find('[data-slot="badge"]').length,
        allPageText: $body.text().replace(/\s+/g, ' ').trim().substring(0, 2000),
      };

      cy.writeFile('cypress/discovery/_roles-list.json', rolePageInfo);
      cy.task('log', `Roles page: ${rolePageInfo.editButtonCount} edit buttons, ${rolePageInfo.deleteButtonCount} delete buttons`);
    });
  });
});
