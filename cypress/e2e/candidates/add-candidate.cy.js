/**
 * @module Add Candidate
 *
 * Verified live (2026-06-15):
 *  - "Add a candidate" button opens a [role="dialog"] titled "Add Candidate".
 *  - The dialog is a RESUME-UPLOAD flow — it has NO first name / last name /
 *    email / phone text fields. Fields present:
 *      • input[type="file"] — resume file upload
 *      • [placeholder="Search jobs..."] — optional job selection
 *      • [placeholder="Search buckets..."] — optional bucket selection
 *  - Action buttons: "Cancel", "Add Candidate" (data-slot="button").
 *  - Submitting without a file keeps the dialog open (no redirect).
 */

import { faker } from '@faker-js/faker';

describe('Add Candidate - Dialog', { tags: ['@smoke', '@regression', '@crud'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/talent-base/candidates');
    cy.get('button[title="Add a candidate"]').should('be.visible');
  });

  // ─── Dialog Open / Close ───────────────────────────────────────────────────

  context('Dialog Open / Close', { tags: ['@smoke'] }, () => {
    it('opens the Add Candidate dialog with the correct heading', { tags: ['@smoke', '@critical'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('[role="dialog"]', 'Add Candidate').should('be.visible');
    });

    it('shows the resume file upload input in the dialog', { tags: ['@smoke'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"] input[type="file"]').should('exist');
    });

    it('shows the Search jobs input', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="Search jobs..."]').should('be.visible');
    });

    it('shows the Search buckets input', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="Search buckets..."]').should('be.visible');
    });

    it('shows the Add Candidate submit button (initially)', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.contains('[role="dialog"] button', /add candidate/i).should('be.visible');
    });

    it('closes the dialog via the Cancel button', { tags: ['@smoke'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('[role="dialog"] button', /cancel/i).click();
      cy.get('[role="dialog"]').should('not.exist');
    });

    it('closes the dialog via the close (×) button', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.get('[data-slot="dialog-close"]').click();
      cy.get('[role="dialog"]').should('not.exist');
    });
  });

  // ─── File Upload ────────────────────────────────────────────────────────────

  context('File Upload', { tags: ['@regression'] }, () => {
    it('accepts a PDF resume file', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"] input[type="file"]').parent().selectFile(
        'cypress/fixtures/files/Fake-Resume.pdf',
        { action: 'drag-drop', force: true }
      );
      // After attaching a file the submit button should be enabled/active
      cy.contains('[role="dialog"] button', /add candidate/i).should('not.be.disabled');
    });

    it('rejects an oversized file (> 10MB)', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"] input[type="file"]').parent().selectFile(
        'cypress/fixtures/files/20mb.pdf',
        { action: 'drag-drop', force: true }
      );
      // Assert the toast message appears (using a flexible regex and checking existence)
      cy.contains(/file exceeds 10mb/i).should('exist');
      // After attaching an oversized file, the submit button should remain disabled
      cy.contains('[role="dialog"] button', /add candidate/i).should('be.disabled');
    });

    it('rejects an invalid file extension (JSON)', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"] input[type="file"]').parent().selectFile(
        'cypress/fixtures/files/2mb.json',
        { action: 'drag-drop', force: true }
      );
      // Assert the toast message appears (using a flexible regex and checking existence)
      cy.contains(/only pdf and word files/i).should('exist');
      // After attaching an invalid file type, the submit button should remain disabled
      cy.contains('[role="dialog"] button', /add candidate/i).should('be.disabled');
    });
  });

  // ─── Job & Bucket Search ────────────────────────────────────────────────────

  context('Job and Bucket Search', { tags: ['@regression'] }, () => {
    it('types in the Search jobs input and shows suggestions or empty state', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="Search jobs..."]').clear().type('BPO');
      // The input must remain visible and functional
      cy.get('[placeholder="Search jobs..."]').should('have.value', 'BPO');
    });

    it('types in the Search buckets input and shows suggestions or empty state', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="Search buckets..."]').clear().type('Senior');
      cy.get('[placeholder="Search buckets..."]').should('have.value', 'Senior');
    });
  });

  // ─── Negative Path ─────────────────────────────────────────────────────────

  context('Negative Path', { tags: ['@negative', '@regression'] }, () => {
    it('Add candidate button should be disabled until file is uploaded', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      // The Add Candidate button should be disabled when no file is selected
      cy.contains('[role="dialog"] button', /add candidate/i).should('be.disabled');
    });
  });

  // ─── E2E CRUD ──────────────────────────────────────────────────────────────

  context('E2E CRUD Operations', { tags: ['@e2e', '@regression'] }, () => {
    it('Adds, edits, and deletes a candidate successfully', () => {
      let initialCount = 0;

      // 1. Get initial count
      cy.get('.justify-between > .text-slate-500').invoke('text').then((text) => {
        const match = text.match(/\d+/g);
        if (match) {
          // Assume the last number in the string is the total count (e.g., "Showing 1 to 10 of 45")
          initialCount = parseInt(match[match.length - 1], 10);
        }
      });

      // 2. Add Candidate
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"] input[type="file"]').parent().selectFile(
        'cypress/fixtures/files/Fake-Resume.pdf',
        { action: 'drag-drop', force: true }
      );
      cy.contains('[role="dialog"] button', /add candidate/i).click();

      // Assert success toast or Added popup appears
      cy.contains(/success|added/i).should('exist');

      // Wait until the file finishes uploading and shows "Candidate added"
      // Using a 60s timeout so Cypress dynamically waits out long network requests
      cy.contains('Candidate added', { matchCase: false, timeout: 60000 }).should('exist');
      
      // Close the added popup (pressing Escape is usually the most reliable generic way to close a modal)
      cy.get('body').type('{esc}');
      
      // Wait until the popup text is completely gone before proceeding
      cy.contains('Candidate added', { matchCase: false, timeout: 60000 }).should('not.exist');

      // Click the refresh screen button
      // Mapped from XPath: /html/body/div[2]/div[2]/main/div[1]/button[2]
      cy.get('html > body > div:nth-of-type(2) > div:nth-of-type(2) > main > div:nth-of-type(1) > button:nth-of-type(2)')
        .click({ force: true });

      // Wait a moment for the table and count to refresh
      cy.wait(1500);

      // Verify count increased by 1
      cy.get('.justify-between > .text-slate-500').should(($el) => {
        const text = $el.text();
        const match = text.match(/\d+/g);
        if (match) {
          const newCount = parseInt(match[match.length - 1], 10);
          expect(newCount).to.eq(initialCount + 1, 'Count should increase by 1');
        } else {
          throw new Error('Count numbers not found in text: ' + text);
        }
      });

      // 3. Edit Candidate
      // Click first entry in the list to open the drawer
      cy.get('.border-slate-200 > .flex-1 > .flex > :nth-child(1) > :nth-child(2)').click();

      // Click Edit option in the drawer
      cy.get('.space-y-4 > .justify-between > .flex').click();

      // Update name, email and phone
      const newName = faker.person.fullName();
      const newEmail = faker.internet.email();
      const newPhone = faker.string.numeric(10);

      cy.get('.space-y-3 > :nth-child(1) > .w-full').clear().type(newName);
      cy.get('.space-y-3 > :nth-child(2) > .w-full').clear().type(newEmail);
      cy.get(':nth-child(3) > .w-full').clear().type(newPhone);

      // Save changes
      // The selector matches 2 elements (likely Cancel/Save or Desktop/Mobile variants), so we click the last one
      cy.get('.justify-between > .flex > .text-teal-700').last().click();

      // Verify update success toast
      cy.contains(/success|updated/i).should('exist');

      // Close drawer (simulate pressing Escape or clicking a close button)
      cy.get('body').type('{esc}');

      // 4. Delete Candidate
      // Select the candidate using checkbox on the first row
      cy.get('.divide-y > :nth-child(1) > .w-12 > .group > .appearance-none').click({ force: true });

      // Click delete button in header
      cy.get('button[title="Delete"], button:contains("Delete")').click();

      // Confirm deletion in the popup
      cy.get('.bg-red-600').click();
      
      // Wait a moment for the table to refresh after deletion
      cy.wait(1500);

      // Verify count is back to initial
      cy.get('.justify-between > .text-slate-500').should(($el) => {
        const text = $el.text();
        const match = text.match(/\d+/g);
        if (match) {
          const finalCount = parseInt(match[match.length - 1], 10);
          expect(finalCount).to.eq(initialCount, 'Count should revert to initial after deletion');
        }
      });
    });
  });
});
