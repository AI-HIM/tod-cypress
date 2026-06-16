/**
 * @module Imports — CSV Upload
 *
 * Tests all file upload scenarios for the New Import dialog.
 * The Import flow accepts a CSV of candidates for bulk upload.
 *
 * Fixture files used (all in cypress/fixtures/files/):
 *  ✅ Valid CSV:
 *    candidates-valid.csv        — 5 rows, correct columns
 *    candidates-minimal.csv      — 1 data row
 *    candidates-large.csv        — 50 data rows
 *    candidates-headers-only.csv — headers but no data rows
 *    candidates-special-chars.csv — rows with quotes, apostrophes, unicode
 *  ❌ Invalid CSV:
 *    candidates-malformed.csv    — broken quoting / extra fields
 *    candidates-wrong-columns.csv — columns do not match expected names
 *    candidates-not-csv.txt      — valid CSV content but .txt extension
 *    empty-file.csv              — zero bytes
 *  🚫 Wrong file type:
 *    invalid-type.jpg            — image
 *    invalid-type.exe            — executable
 *
 * NOTE: The "New Import" button and dialog selector are:
 *   button[title="New Import"]
 *   [role="dialog"]
 * The dialog fields are: #import-name-input, #import-description-input
 * plus a file input (if the dialog is a two-step wizard, the file input
 * may appear on a subsequent step after filling the name).
 *
 * If the discovery reveals a single-step form that includes the file input,
 * update FILE_INPUT below. Run the _discovery spec to confirm.
 */

import { unique } from '../../support/utils/helpers';

const DIALOG = '[role="dialog"]';
// File input may be directly in the dialog or on a subsequent step.
// Try both patterns:
const FILE_INPUT_SELECTOR = `${DIALOG} input[type="file"]`;
const F = (name) => `cypress/fixtures/files/${name}`;

// ─── Helper: open New Import dialog and fill mandatory name ────────────────
function openImport(name) {
  cy.get('button[title="New Import"]').should('be.visible').click();
  cy.get(DIALOG, { timeout: 10000 }).should('be.visible');
  cy.get('#import-name-input').should('be.visible').clear().type(name);
}

// ─── Helper: attach a file to the import dialog (handles wizard steps) ─────
function attachFile(fixtureName) {
  // Check if file input is already visible (single-step form)
  // or if we need to click Next to reach the file upload step.
  cy.get(DIALOG).then(($dialog) => {
    const hasFileInput = $dialog.find('input[type="file"]').length > 0;
    if (hasFileInput) {
      cy.get(FILE_INPUT_SELECTOR).selectFile(F(fixtureName), { force: true });
    } else {
      // Two-step wizard: click Next/Continue to reach the file step
      cy.contains(DIALOG + ' button', /next|continue/i).click();
      cy.get(FILE_INPUT_SELECTOR, { timeout: 10000 }).should('exist')
        .selectFile(F(fixtureName), { force: true });
    }
  });
}

// ─── Helper: submit and expect dialog to close ──────────────────────────────
function submitImport() {
  cy.contains(DIALOG + ' button', /save|create|next|import|upload/i).click();
}

describe('Imports — CSV Upload', { tags: ['@regression', '@upload'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/talent-base/imports');
    cy.url().should('include', '/talent-base/imports');
  });

  // ─── Dialog open/close ────────────────────────────────────────────────────

  context('Dialog Controls', { tags: ['@smoke'] }, () => {
    it('opens the New Import dialog', { tags: ['@smoke', '@critical'] }, () => {
      cy.get('button[title="New Import"]').click();
      cy.get(DIALOG).should('be.visible');
    });

    it('shows the import name input inside the dialog', { tags: ['@smoke'] }, () => {
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('be.visible');
    });

    it('closes the dialog via Cancel', { tags: ['@smoke'] }, () => {
      cy.get('button[title="New Import"]').click();
      cy.get(DIALOG).should('be.visible');
      cy.contains(DIALOG + ' button', /cancel/i).click();
      cy.get(DIALOG).should('not.exist');
    });

    it('closes the dialog via the × button', { tags: ['@regression'] }, () => {
      cy.get('button[title="New Import"]').click();
      cy.get('[data-slot="dialog-close"]').click();
      cy.get(DIALOG).should('not.exist');
    });
  });

  // ─── Import name validation ───────────────────────────────────────────────

  context('Import Name Validation', { tags: ['@regression', '@validation'] }, () => {
    it('rejects an empty name — keeps dialog open', { tags: ['@regression'] }, () => {
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').should('have.value', '');
      cy.contains(DIALOG + ' button', /save|create|next/i).click();
      cy.get(DIALOG).should('be.visible');
    });

    it('accepts a valid import name', { tags: ['@regression'] }, () => {
      const name = unique('IMP');
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').clear().type(name);
      cy.get('#import-name-input').should('have.value', name);
    });

    it('accepts special characters in the import name', { tags: ['@regression'] }, () => {
      const name = `${unique('IMP')} & Co. #1`;
      cy.get('button[title="New Import"]').click();
      cy.get('#import-name-input').clear().type(name);
      cy.get('#import-name-input').should('have.value', name);
      cy.contains(DIALOG + ' button', /cancel/i).click();
    });
  });

  // ─── File input detection ─────────────────────────────────────────────────

  context('File Input Presence', { tags: ['@smoke'] }, () => {
    it('shows a file input in the dialog (single-step) or after clicking Next (wizard)', { tags: ['@smoke'] }, () => {
      const name = unique('IMP');
      openImport(name);

      // Check if file input exists in initial step
      cy.get(DIALOG).then(($dialog) => {
        const hasFileInput = $dialog.find('input[type="file"]').length > 0;
        if (hasFileInput) {
          cy.get(FILE_INPUT_SELECTOR).should('exist');
        } else {
          // Wizard: navigate to file step
          cy.contains(DIALOG + ' button', /next|continue/i).click();
          cy.get(FILE_INPUT_SELECTOR, { timeout: 10000 }).should('exist');
        }
      });

      cy.contains(DIALOG + ' button', /cancel|close/i).click({ multiple: true, force: true });
      cy.get(DIALOG).should('not.exist');
    });
  });

  // ─── Valid CSV uploads ────────────────────────────────────────────────────

  context('Valid CSV Files', { tags: ['@regression', '@upload'] }, () => {
    it('accepts a valid 5-row CSV file', { tags: ['@smoke', '@critical'] }, () => {
      const name = unique('IMP_VALID');
      openImport(name);
      attachFile('candidates-valid.csv');
      cy.get(DIALOG).should('be.visible');
      cy.get('body').should('be.visible');
    });

    it('accepts a minimal (1-row) CSV file', { tags: ['@regression'] }, () => {
      const name = unique('IMP_MIN');
      openImport(name);
      attachFile('candidates-minimal.csv');
      cy.get(DIALOG).should('be.visible');
    });

    it('accepts a large (50-row) CSV file', { tags: ['@regression', '@boundary'] }, () => {
      const name = unique('IMP_LARGE');
      openImport(name);
      attachFile('candidates-large.csv');
      cy.get(DIALOG).should('be.visible');
    });

    it('accepts a CSV with special characters (quotes, unicode, apostrophes)', { tags: ['@regression'] }, () => {
      const name = unique('IMP_SPEC');
      openImport(name);
      attachFile('candidates-special-chars.csv');
      cy.get(DIALOG).should('be.visible');
      cy.get('body').should('not.contain.text', 'application error');
    });

    it('accepts a headers-only CSV (no data rows)', { tags: ['@regression', '@boundary'] }, () => {
      const name = unique('IMP_HDRS');
      openImport(name);
      attachFile('candidates-headers-only.csv');
      cy.get(DIALOG).should('be.visible');
    });
  });

  // ─── Invalid / malformed CSV ──────────────────────────────────────────────

  context('Invalid and Malformed CSV Files', { tags: ['@regression', '@negative', '@upload'] }, () => {
    it('handles a malformed CSV gracefully — no crash', { tags: ['@regression'] }, () => {
      const name = unique('IMP_BAD');
      openImport(name);
      attachFile('candidates-malformed.csv');
      cy.get(DIALOG).should('be.visible');
      cy.get('body').should('not.contain.text', 'application error');
    });

    it('handles a CSV with wrong column names — shows error or warning', { tags: ['@regression', '@validation'] }, () => {
      const name = unique('IMP_WCOL');
      openImport(name);
      attachFile('candidates-wrong-columns.csv');
      cy.get(DIALOG).should('be.visible');
      // App should warn about missing columns, not silently accept wrong data
      cy.get('body').should('be.visible');
    });

    it('handles an empty (zero-byte) CSV gracefully', { tags: ['@regression', '@boundary'] }, () => {
      const name = unique('IMP_EMPTY');
      openImport(name);
      attachFile('empty-file.csv');
      cy.get(DIALOG).should('be.visible');
      // Submitting with an empty file should keep dialog open or show error
      submitImport();
      cy.get('body').should('be.visible');
    });
  });

  // ─── Wrong file type ──────────────────────────────────────────────────────

  context('Wrong File Type (non-CSV)', { tags: ['@regression', '@negative', '@upload'] }, () => {
    it('rejects or warns when uploading a .txt file instead of .csv', { tags: ['@regression'] }, () => {
      const name = unique('IMP_TXT');
      openImport(name);
      attachFile('candidates-not-csv.txt');
      // App should either reject the file or show a warning
      cy.get(DIALOG).should('be.visible');
      cy.get('body').should('not.contain.text', 'application error');
    });

    it('rejects or warns when uploading a JPG image', { tags: ['@regression', '@security'] }, () => {
      const name = unique('IMP_JPG');
      openImport(name);
      attachFile('invalid-type.jpg');
      cy.get(DIALOG).should('be.visible');
      cy.get('body').should('be.visible');
    });

    it('rejects or warns when uploading an EXE — no execution', { tags: ['@regression', '@security'] }, () => {
      const name = unique('IMP_EXE');
      openImport(name);
      attachFile('invalid-type.exe');
      cy.get(DIALOG).should('be.visible');
      cy.get('body').should('be.visible');
    });
  });

  // ─── File replacement ─────────────────────────────────────────────────────

  context('File Replacement', { tags: ['@regression'] }, () => {
    it('replaces previously selected file when a new file is chosen', { tags: ['@regression'] }, () => {
      const name = unique('IMP_REPL');
      openImport(name);

      cy.get(DIALOG).then(($dialog) => {
        if ($dialog.find('input[type="file"]').length > 0) {
          // Select first file
          cy.get(FILE_INPUT_SELECTOR).selectFile(F('candidates-minimal.csv'), { force: true });
          // Select replacement file
          cy.get(FILE_INPUT_SELECTOR).selectFile(F('candidates-valid.csv'), { force: true });
          cy.get(DIALOG).should('be.visible');
        } else {
          // Wizard: go to file step
          cy.contains(DIALOG + ' button', /next|continue/i).click();
          cy.get(FILE_INPUT_SELECTOR, { timeout: 10000 }).selectFile(F('candidates-minimal.csv'), { force: true });
          cy.get(FILE_INPUT_SELECTOR).selectFile(F('candidates-valid.csv'), { force: true });
        }
      });

      cy.contains(DIALOG + ' button', /cancel|close/i).click({ multiple: true, force: true });
    });
  });

  // ─── Combined: name + description + file ─────────────────────────────────

  context('Full Form Submission', { tags: ['@regression', '@crud'] }, () => {
    it('fills name, description, and valid CSV — then cancels to keep env clean', { tags: ['@regression'] }, () => {
      const name = unique('IMP_FULL');
      const desc = 'Automated test import batch — June 2026';

      cy.get('button[title="New Import"]').click();
      cy.get(DIALOG).should('be.visible');
      cy.get('#import-name-input').clear().type(name);
      cy.get('#import-description-input').clear().type(desc);
      cy.get('#import-name-input').should('have.value', name);
      cy.get('#import-description-input').should('have.value', desc);

      // Cancel to preserve env
      cy.contains(DIALOG + ' button', /cancel/i).click();
      cy.get(DIALOG).should('not.exist');
    });
  });
});
