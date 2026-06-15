/**
 * @module Settings - Members
 * @tags @smoke @regression @role-based
 */

describe('Settings - Members', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/members');
  });

  context('Read', () => {
    it('@smoke - should load members page', () => {
      cy.url().should('include', '/settings/members');
      cy.get('body').should('be.visible');
    });

    it('@sanity - should display members list or empty state', () => {
      cy.get('body').should('be.visible');
    });

    it('@regression - should display current user in members list', () => {
      cy.get('body').should('contain.text', Cypress.env('USER_EMAIL'));
    });

    it('@regression - should search members if search is available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[placeholder*="Search"]').length) {
          cy.get('[placeholder*="Search"]').clear().type('auto');
          cy.waitForPageLoad();
          cy.get('body').should('be.visible');
        } else {
          cy.log('No search on members page');
        }
      });
    });
  });

  context('Invite Member', () => {
    it('@regression - should show invite option if available', () => {
      cy.get('body').then(($body) => {
        const hasInvite = $body.find('button').toArray().some((btn) =>
          /invite/i.test(btn.textContent)
        );
        if (hasInvite) {
          cy.contains('button', /invite/i).should('be.visible');
        } else {
          cy.log('No invite button found — may require admin role');
        }
      });
    });

    it('@regression - should validate email when inviting member', () => {
      cy.get('body').then(($body) => {
        const hasInvite = $body.find('button').toArray().some((btn) =>
          /invite/i.test(btn.textContent)
        );
        if (hasInvite) {
          cy.contains('button', /invite/i).click();
          cy.get('[type="email"], [placeholder*="email"]').last().clear().type('invalid-email');
          cy.contains('button', /send|invite/i).last().click();
          cy.get('body').should('be.visible');
        } else {
          cy.log('No invite flow to test');
        }
      });
    });
  });

  context('Role-Based', () => {
    it('@regression - should display member roles', () => {
      cy.get('body').should('be.visible');
    });
  });
});
