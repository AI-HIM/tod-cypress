// ─── Authentication ──────────────────────────────────────────────────────────

/**
 * Login using cy.session() for session caching between tests.
 * The session is keyed by email AND password so a rotated password (or a
 * different user sharing the same email across env files) never reuses a
 * stale cached session.
 */
Cypress.Commands.add('login', (email, password) => {
  const userEmail = email || Cypress.env('USER_EMAIL');
  const userPassword = password || Cypress.env('USER_PASSWORD');

  cy.session(
    [userEmail, userPassword],
    () => {
      cy.visit('/login');
      cy.get('#email').should('be.visible').clear().type(userEmail);
      cy.get('#password').should('be.visible').clear().type(userPassword, { log: false });
      cy.contains('button', /^log\s?in$/i).click();
      cy.url().should('not.include', '/login');
      cy.waitForPageLoad();
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        cy.visit('/');
        cy.url().should('not.include', '/login');
      },
    }
  );
});

Cypress.Commands.add('logout', () => {
  // The TOD app sidebar uses a Radix UI dropdown for the user account menu.
  // Step 1: Expand the sidebar first — this guarantees the sidebar's own
  // dropdown trigger is the LAST [data-slot="dropdown-menu-trigger"] in the
  // DOM (collapsed-state markup can omit or reorder it relative to any
  // content-area triggers), so `.last()` below reliably targets it.
  cy.expandSidebar();

  // Step 2: Click the user/account Radix dropdown trigger at the bottom of the sidebar.
  cy.get('[data-slot="dropdown-menu-trigger"]').last().click();

  // Step 3: Click "Sign out" in the now-open Radix dropdown menu. Scoped to
  // [role="menu"] (the open menu's container) so it can't match a stray
  // menuitem from a different, already-rendered dropdown.
  cy.contains('[role="menu"] [role="menuitem"]', /sign out/i, { timeout: 10000 })
    .should('be.visible')
    .click();
  cy.url().should('include', '/login');
});

// ─── Navigation ──────────────────────────────────────────────────────────────

/**
 * Navigate via a sidebar link by its href. The TOD sidebar links are icon-only
 * (empty text), so they must be selected by href, never by link text.
 */
Cypress.Commands.add('navigateTo', (href) => {
  cy.expandSidebar();
  cy.get(`a[href="${href}"]`).first().click({ force: true });
  cy.location('pathname').should('include', href === '/' ? '/' : href);
  cy.waitForPageLoad();
});

// ─── Page Load ───────────────────────────────────────────────────────────────

/** Wait for the document to finish loading after navigation. */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.document().its('readyState').should('eq', 'complete');
});

// ─── Table Helpers ────────────────────────────────────────────────────────────

/** Assert a table column header exists. */
Cypress.Commands.add('assertTableHeaders', (headers) => {
  headers.forEach((header) => {
    cy.get('table thead').should('contain.text', header);
  });
});

// ─── Sidebar ─────────────────────────────────────────────────────────────────

/** Expand collapsed sidebar if it is collapsed. */
Cypress.Commands.add('expandSidebar', () => {
  cy.get('body').then(($body) => {
    if ($body.find('button[title="Expand sidebar"]').length) {
      cy.get('button[title="Expand sidebar"]').click();
    }
  });
});
