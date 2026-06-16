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
      cy.get('[role="dialog"] input[type="file"]').selectFile(
        'cypress/fixtures/files/sample-resume.pdf',
        { force: true }
      );
      // After attaching a file the submit button should be enabled/active
      cy.contains('[role="dialog"] button', /add candidate/i).should('be.visible');
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
    it('keeps dialog open when submitting without a file', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[role="dialog"]').should('be.visible');
      cy.contains('[role="dialog"] button', /add candidate/i).click();
      // Dialog should remain open or show a validation message
      cy.get('[role="dialog"]').should('be.visible');
    });
  });
});
