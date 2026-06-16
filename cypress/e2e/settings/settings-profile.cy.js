/**
 * @module Settings - Profile
 *
 * Verified live (2026-06-15):
 *  - Page headings: "Profile", "Organization"
 *  - Inputs: #name-input (text), #email-input (email, may be read-only),
 *    #career-site-tagline (text), #career-site-about (textarea).
 *  - Save button: button:contains("Save changes") — starts DISABLED; enabled
 *    only after editing a field. Selector is NOT button[type="submit"].
 *  - Saved name is read back via Cypress.env('USER_NAME') if set, or persisted
 *    back to #name-input value after save.
 *
 * KNOWN LIVE APP DEFECT (confirmed 2026-06-16, reproduced 4x in isolation,
 * incl. on a fresh page load with no other field touched): editing
 * #career-site-tagline correctly enables "Save changes", but editing
 * #name-input never does — not after blur, extra keystrokes, or 3+ seconds
 * of waiting. There is only one Save control on the page (confirmed via a
 * full button-label dump), so this is not a missing second save mechanism.
 * The 5 tests below that rely on "edit name -> Save enables -> click" are
 * written correctly against the intended business rule and will correctly
 * keep failing until this app bug is fixed — do not weaken them to force a
 * pass.
 */

import { SQL_INJECTION, XSS_PROBE, maxLengthString, unique } from '../../support/utils/helpers';

describe('Settings - Profile', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/settings/profile');
    cy.get('#name-input', { timeout: 15000 }).should('be.visible');
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read', { tags: ['@smoke'] }, () => {
    it('loads the settings profile page', { tags: ['@smoke', '@critical'] }, () => {
      cy.url().should('include', '/settings/profile');
      cy.contains('h1, h2, h3', 'Profile').should('be.visible');
    });

    it('displays the name input field pre-filled with the user name', { tags: ['@sanity'] }, () => {
      cy.get('#name-input').should('be.visible').and('not.have.value', '');
    });

    it('displays the email input field pre-filled with the user email', { tags: ['@sanity'] }, () => {
      cy.get('#email-input').should('be.visible').and('not.have.value', '');
    });

    it('shows the career site tagline input', { tags: ['@regression'] }, () => {
      cy.get('#career-site-tagline').should('be.visible');
    });

    it('shows the Save changes button', { tags: ['@regression'] }, () => {
      // scrollIntoView first — the page content can scroll, clipping the button.
      cy.contains('button', 'Save changes').scrollIntoView().should('be.visible');
    });

    it('shows the Organization section heading', { tags: ['@regression'] }, () => {
      cy.contains('h1, h2, h3', 'Organization').should('be.visible');
    });
  });

  // ─── UPDATE PROFILE ────────────────────────────────────────────────────────

  context('Update Profile', { tags: ['@regression'] }, () => {
    it('enables the Save button when the name field is edited', { tags: ['@smoke'] }, () => {
      cy.get('#name-input').invoke('val').then((originalName) => {
        cy.get('#name-input').clear().type(`${originalName} Edit`);
        cy.contains('button', 'Save changes').should('not.be.disabled');
        // Restore original value
        cy.get('#name-input').clear().type(originalName);
      });
    });

    it('updates the career site tagline and saves', { tags: ['@regression'] }, () => {
      const tagline = `Auto Tagline ${unique('TAG')}`;
      cy.get('#career-site-tagline').clear().type(tagline);
      cy.contains('button', 'Save changes').should('not.be.disabled').click();
      cy.url().should('include', '/settings/profile');
      // scrollIntoView first — saving keeps scroll position near the bottom
      // form fields, clipping the heading at the top of the scroll container.
      cy.contains('h1, h2, h3', 'Profile').scrollIntoView().should('be.visible');
    });

    it('rejects an empty name — save button stays disabled', { tags: ['@regression', '@validation'] }, () => {
      cy.get('#name-input').clear();
      // Clearing the only edited field re-disables save
      cy.contains('button', 'Save changes').should('be.disabled');
    });

    it('accepts special characters in the name field', { tags: ['@regression'] }, () => {
      cy.get('#name-input').invoke('val').then((originalName) => {
        cy.get('#name-input').clear().type("O'Brien & Co.");
        cy.contains('button', 'Save changes').should('not.be.disabled').click();
        cy.url().should('include', '/settings/profile');
        // Restore
        cy.get('#name-input').clear().type(originalName);
        cy.contains('button', 'Save changes').should('not.be.disabled').click();
      });
    });

    it('handles max-length (100 char) input in name field', { tags: ['@regression', '@boundary'] }, () => {
      cy.get('#name-input').invoke('val').then((originalName) => {
        cy.get('#name-input').clear().type(maxLengthString(100));
        cy.contains('button', 'Save changes').should('not.be.disabled').click();
        cy.url().should('include', '/settings/profile');
        // Restore
        cy.get('#name-input').clear().type(originalName);
        cy.contains('button', 'Save changes').should('not.be.disabled').click();
      });
    });

    it('treats an SQL-injection probe as literal text in name', { tags: ['@regression', '@security'] }, () => {
      cy.get('#name-input').invoke('val').then((originalName) => {
        cy.get('#name-input').clear().type(SQL_INJECTION);
        cy.contains('button', 'Save changes').should('not.be.disabled').click();
        // Must stay on profile page — probe must not redirect or execute
        cy.url().should('include', '/settings/profile');
        // Restore
        cy.get('#name-input').clear().type(originalName);
        cy.contains('button', 'Save changes').should('not.be.disabled').click();
      });
    });

    it('treats an XSS probe as literal text in name', { tags: ['@regression', '@security'] }, () => {
      cy.on('window:alert', () => { throw new Error('XSS payload executed'); });
      cy.get('#name-input').invoke('val').then((originalName) => {
        cy.get('#name-input').clear().type(XSS_PROBE);
        cy.contains('button', 'Save changes').should('not.be.disabled').click();
        cy.url().should('include', '/settings/profile');
        // Restore
        cy.get('#name-input').clear().type(originalName);
        cy.contains('button', 'Save changes').should('not.be.disabled').click();
      });
    });
  });

  // ─── EMAIL FIELD ──────────────────────────────────────────────────────────

  context('Email Field', { tags: ['@regression'] }, () => {
    it('displays the email field with the logged-in user email', { tags: ['@regression'] }, () => {
      cy.get('#email-input').should('have.value', Cypress.env('USER_EMAIL'));
    });

    it('email field is readonly — direct edits do not enable the save button', { tags: ['@regression'] }, () => {
      // Profile email requires a separate verification flow to change.
      // Confirmed live (2026-06-16): the input carries the HTML `readonly`
      // attribute, so Cypress's actionability check correctly refuses
      // .clear()/.type() on it — assert the readonly state directly instead
      // of attempting an edit that the browser itself would never allow.
      cy.get('#email-input').should('have.attr', 'readonly');
      cy.contains('button', 'Save changes').should('be.disabled');
    });
  });

  // ─── NAVIGATION ────────────────────────────────────────────────────────────

  context('Settings Sub-Navigation', { tags: ['@regression'] }, () => {
    it('shows the settings sub-nav links', { tags: ['@regression'] }, () => {
      cy.get('a[href="/settings/profile"]').should('exist');
      cy.get('a[href="/settings/buckets"]').should('exist');
      cy.get('a[href="/settings/members"]').should('exist');
      cy.get('a[href="/settings/roles"]').should('exist');
    });

    it('navigates to Buckets settings via sub-nav', { tags: ['@regression'] }, () => {
      cy.get('a[href="/settings/buckets"]').click();
      cy.url().should('include', '/settings/buckets');
    });
  });
});
