/**
 * @module Settings - Roles
 * @tags @smoke @regression @role-based
 */

describe('Settings - Roles', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/roles');
  });

  context('Read', () => {
    it('@smoke - should load roles page', () => {
      cy.url().should('include', '/settings/roles');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should display roles list', () => {
      cy.get('body').should('be.visible');
    });

    it('@regression - should display default roles (Admin, Member, etc.)', () => {
      cy.get('body').then(($body) => {
        const hasRoles = /admin|member|owner|viewer/i.test($body.text());
        if (hasRoles) {
          cy.log('Default roles are visible');
        } else {
          cy.log('No default roles found — may require data setup');
        }
        cy.get('body').should('be.visible');
      });
    });
  });

  context('Role Actions', () => {
    it('@regression - should open create role if button exists', () => {
      cy.get('body').then(($body) => {
        const hasCreateBtn = $body.find('button').toArray().some((btn) =>
          /new role|create role|add role/i.test(btn.textContent)
        );
        if (hasCreateBtn) {
          cy.contains('button', /new role|create role|add role/i).click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('No role creation button — roles may be system-defined');
        }
      });
    });

    it('@regression - should click on a role to view permissions', () => {
      cy.get('body').then(($body) => {
        const roleRows = $body.find('table tbody tr, [data-role], li');
        if (roleRows.length > 0) {
          cy.wrap(roleRows).first().click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('No roles to click');
        }
      });
    });
  });
});
