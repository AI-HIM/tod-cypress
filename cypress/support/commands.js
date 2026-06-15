import { dataFactory } from './utils/dataFactory';

// ─── Authentication ──────────────────────────────────────────────────────────

/**
 * Login using cy.session() for session caching between tests.
 * The session is keyed by email so different users get separate sessions.
 */
Cypress.Commands.add('login', (email, password) => {
  const userEmail = email || Cypress.env('USER_EMAIL');
  const userPassword = password || Cypress.env('USER_PASSWORD');

  cy.session(
    [userEmail],
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

/** Login without session caching — use when testing the login page itself. */
Cypress.Commands.add('loginDirect', (email, password) => {
  const userEmail = email || Cypress.env('USER_EMAIL');
  const userPassword = password || Cypress.env('USER_PASSWORD');

  cy.visit('/login');
  cy.get('#email').should('be.visible').clear().type(userEmail);
  cy.get('#password').should('be.visible').clear().type(userPassword, { log: false });
  cy.contains('button', /^log\s?in$/i).click();
});

Cypress.Commands.add('logout', () => {
  // The TOD app sidebar uses a Radix UI dropdown for the user account menu.
  // The trigger button ([data-slot="dropdown-menu-trigger"]) is visible in both
  // collapsed and expanded sidebar states — no expandSidebar() call is needed.
  //
  // Step 1: Click the expand sidebar button (it exists in the header when collapsed).
  cy.expandSidebar();

  // Step 2: Click the user/account Radix dropdown trigger at the bottom of the sidebar.
  // This is the LAST [data-slot="dropdown-menu-trigger"] on the page (there may be
  // others inside the main content area when the sidebar is expanded).
  cy.get('[data-slot="dropdown-menu-trigger"]').last().click();

  // Step 3: Click "Sign out" in the Radix dropdown menu.
  // "Sign out" renders as div[role="menuitem"][data-slot="dropdown-menu-item"].
  cy.contains('[role="menuitem"]', /sign out/i, { timeout: 10000 })
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

/** Navigate directly to a URL and wait for load. */
Cypress.Commands.add('navigateToUrl', (path) => {
  cy.visit(path);
  cy.waitForPageLoad();
});

// ─── Page Load ───────────────────────────────────────────────────────────────

/** Wait for network to settle after navigation. */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.document().then((doc) => {
    if (doc.readyState !== 'complete') {
      cy.wait(300);
    }
  });
});

/** Wait for an API intercept alias to complete and return. */
Cypress.Commands.add('waitForApi', (alias, options = {}) => {
  cy.wait(`@${alias}`, { timeout: options.timeout || 20000 });
});

// ─── Element Interactions ─────────────────────────────────────────────────────

/** Get element by placeholder attribute. */
Cypress.Commands.add('getByPlaceholder', (placeholder) => {
  return cy.get(`[placeholder="${placeholder}"]`);
});

/** Get element by data-testid attribute. */
Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});

/** Get element by aria-label. */
Cypress.Commands.add('getByAriaLabel', (label) => {
  return cy.get(`[aria-label="${label}"]`);
});

/** Clear an input then type the given value. */
Cypress.Commands.add('typeIn', (selector, value) => {
  cy.get(selector).should('be.visible').clear().type(value);
});

/** Click a button by its visible text. */
Cypress.Commands.add('clickButton', (text) => {
  cy.contains('button', text).should('be.visible').click();
});

/** Click a link by its visible text. */
Cypress.Commands.add('clickLink', (text) => {
  cy.contains('a', text).should('be.visible').click();
});

// ─── Table Helpers ────────────────────────────────────────────────────────────

/** Assert a table contains a row with the given text. */
Cypress.Commands.add('tableContains', (text) => {
  cy.get('table tbody tr').should('contain.text', text);
});

/** Assert a table column header exists. */
Cypress.Commands.add('assertTableHeaders', (headers) => {
  headers.forEach((header) => {
    cy.get('table thead').should('contain.text', header);
  });
});

/** Click a table row containing the given text. */
Cypress.Commands.add('clickTableRow', (text) => {
  cy.get('table tbody tr').contains(text).closest('tr').click();
});

// ─── Search ───────────────────────────────────────────────────────────────────

/** Type into a search input and verify results contain text. */
Cypress.Commands.add('searchAndVerify', (placeholder, searchTerm, expectedText) => {
  cy.get(`[placeholder="${placeholder}"]`).clear().type(searchTerm);
  cy.waitForPageLoad();
  if (expectedText) {
    cy.get('body').should('contain.text', expectedText);
  }
});

// ─── Modal Helpers ────────────────────────────────────────────────────────────

/** Wait for a modal/dialog to become visible by its heading text. */
Cypress.Commands.add('waitForModal', (headingText) => {
  cy.contains('[role="dialog"], .modal, [data-headlessui-state]', headingText, {
    timeout: 10000,
  }).should('be.visible');
});

/** Close the active Radix dialog via its Cancel button or the dialog-close (×). */
Cypress.Commands.add('closeModal', () => {
  cy.get('[role="dialog"]').within(() => {
    cy.get('button:contains("Cancel"), [data-slot="dialog-close"]').first().click({ force: true });
  });
  cy.get('[role="dialog"]').should('not.exist');
});

// ─── Toast / Notification ─────────────────────────────────────────────────────

/** Assert a success toast message is visible. */
Cypress.Commands.add('assertSuccessToast', (text) => {
  if (text) {
    cy.contains('[role="status"], [role="alert"], .toast, [data-sonner-toast]', text, {
      timeout: 10000,
    }).should('be.visible');
  } else {
    cy.get('[role="status"], [role="alert"], .toast, [data-sonner-toast]', {
      timeout: 10000,
    }).should('be.visible');
  }
});

/** Assert an error toast/message is visible. */
Cypress.Commands.add('assertErrorMessage', (text) => {
  if (text) {
    cy.contains(text, { timeout: 10000 }).should('be.visible');
  } else {
    cy.get('[role="alert"], .error, .text-red', { timeout: 10000 }).should('be.visible');
  }
});

// ─── File Upload ──────────────────────────────────────────────────────────────

/** Attach a fixture file to a file input. */
Cypress.Commands.add('uploadFixtureFile', (selector, fixturePath, mimeType) => {
  cy.get(selector).selectFile(`cypress/fixtures/${fixturePath}`, {
    force: true,
    mimeType: mimeType || 'application/octet-stream',
  });
});

// ─── Pagination ──────────────────────────────────────────────────────────────

Cypress.Commands.add('goToNextPage', () => {
  cy.get('[aria-label="Next page"]').should('be.visible').click();
  cy.waitForPageLoad();
});

Cypress.Commands.add('goToPreviousPage', () => {
  cy.get('[aria-label="Previous page"]').should('be.visible').click();
  cy.waitForPageLoad();
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

/** Click a sidebar navigation link by label text. */
Cypress.Commands.add('clickSidebarLink', (label) => {
  cy.expandSidebar();
  cy.contains('nav a, aside a', label).first().click();
  cy.waitForPageLoad();
});

// ─── Assertions ───────────────────────────────────────────────────────────────

/** Assert the page URL includes the given path. */
Cypress.Commands.add('assertUrl', (path) => {
  cy.url().should('include', path);
});

/** Assert a heading is visible on the page. */
Cypress.Commands.add('assertHeading', (text) => {
  cy.contains('h1, h2, h3', text).should('be.visible');
});

// Re-export dataFactory so tests can use it via cy commands
Cypress.Commands.add('generateCandidate', (overrides = {}) => {
  return cy.wrap(dataFactory.candidate(overrides));
});

Cypress.Commands.add('generateBusinessUnit', (overrides = {}) => {
  return cy.wrap(dataFactory.businessUnit(overrides));
});
