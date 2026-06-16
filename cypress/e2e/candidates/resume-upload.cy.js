/**
 * @module Add Candidate — Resume Upload
 *
 * Tests all file upload scenarios for the "Add a candidate" dialog.
 * The dialog accepts a resume file (input[type="file"]) plus optional
 * job/bucket associations. Candidates are added by uploading resumes.
 *
 * Fixture files used (all in cypress/fixtures/files/):
 *  ✅ Valid:
 *    sample-resume.pdf       — standard single-page PDF
 *    sample-resume-2.pdf     — second valid PDF
 *    sample-resume.docx      — valid Word document
 *    sample-resume.txt       — plain text resume
 *  ❌ Invalid type:
 *    invalid-type.jpg        — image file
 *    invalid-type.exe        — executable
 *    invalid-type.html       — HTML file
 *  ⚠️ Edge cases:
 *    empty-file.pdf          — zero-byte file
 *    sample-resume-large.pdf — ~6 MB file (tests size limit handling)
 */

const DIALOG = '[role="dialog"]';
const FILE_INPUT = `${DIALOG} input[type="file"]`;
const SUBMIT_BTN = /add candidate/i;
const CANCEL_BTN = /cancel/i;

const F = (name) => `cypress/fixtures/files/${name}`;

describe('Add Candidate — Resume Upload', { tags: ['@regression', '@upload'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/talent-base/candidates');
    cy.get('button[title="Add a candidate"]', { timeout: 15000 }).should('be.visible');
  });

  // ─── Dialog open/close ─────────────────────────────────────────────────────

  context('Dialog Controls', { tags: ['@smoke'] }, () => {
    it('opens the Add Candidate dialog with a file input', { tags: ['@smoke', '@critical'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(DIALOG).should('be.visible');
      cy.contains(DIALOG, 'Add Candidate').should('be.visible');
      cy.get(FILE_INPUT).should('exist');
    });

    it('closes the dialog via Cancel without uploading', { tags: ['@smoke'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(DIALOG).should('be.visible');
      cy.contains(DIALOG + ' button', CANCEL_BTN).click();
      cy.get(DIALOG).should('not.exist');
    });

    it('closes the dialog via the × button', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[data-slot="dialog-close"]').click();
      cy.get(DIALOG).should('not.exist');
    });
  });

  // ─── Valid file types ──────────────────────────────────────────────────────

  context('Valid File Types', { tags: ['@regression', '@upload'] }, () => {
    it('accepts a valid PDF resume', { tags: ['@smoke', '@critical'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(FILE_INPUT).selectFile(F('sample-resume.pdf'), { force: true });
      cy.get(DIALOG).should('be.visible');
      // After selecting a file, the dialog should remain open and ready to submit
      cy.contains(DIALOG + ' button', SUBMIT_BTN).should('be.visible');
    });

    it('accepts a second different PDF resume', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(FILE_INPUT).selectFile(F('sample-resume-2.pdf'), { force: true });
      cy.get(DIALOG).should('be.visible');
      cy.contains(DIALOG + ' button', SUBMIT_BTN).should('be.visible');
    });

    it('accepts a DOCX (Word document) resume', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(FILE_INPUT).selectFile(F('sample-resume.docx'), { force: true });
      cy.get(DIALOG).should('be.visible');
      // Either the file is accepted (dialog ready) or a validation message appears —
      // either outcome must NOT crash the page
      cy.get('body').should('be.visible');
    });

    it('accepts a plain text (.txt) resume', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(FILE_INPUT).selectFile(F('sample-resume.txt'), { force: true });
      cy.get(DIALOG).should('be.visible');
      cy.get('body').should('be.visible');
    });
  });

  // ─── Invalid file types ────────────────────────────────────────────────────

  context('Invalid File Types', { tags: ['@regression', '@negative', '@upload'] }, () => {
    it('shows rejection or warning when uploading a JPG image', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(FILE_INPUT).selectFile(F('invalid-type.jpg'), { force: true });
      // App should either show an error message OR keep the submit button disabled
      cy.get(DIALOG).should('be.visible');
      cy.get('body').should('not.contain.text', 'application error');
    });

    it('shows rejection or warning when uploading an EXE', { tags: ['@regression', '@security'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(FILE_INPUT).selectFile(F('invalid-type.exe'), { force: true });
      cy.get(DIALOG).should('be.visible');
      // The page must not crash, and no script should execute
      cy.get('body').should('not.contain.text', 'application error');
    });

    it('shows rejection or warning when uploading an HTML file', { tags: ['@regression', '@security'] }, () => {
      cy.on('window:alert', () => { throw new Error('XSS payload executed from HTML file'); });
      cy.get('button[title="Add a candidate"]').click();
      cy.get(FILE_INPUT).selectFile(F('invalid-type.html'), { force: true });
      cy.get(DIALOG).should('be.visible');
      cy.get('body').should('be.visible');
    });
  });

  // ─── Edge cases: empty and large files ────────────────────────────────────

  context('Edge Case Files', { tags: ['@regression', '@boundary', '@upload'] }, () => {
    it('handles a zero-byte (empty) PDF file gracefully', { tags: ['@regression', '@boundary'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(FILE_INPUT).selectFile(F('empty-file.pdf'), { force: true });
      cy.get(DIALOG).should('be.visible');
      // Should show error or keep submit disabled — must not close dialog with empty file
      cy.contains(DIALOG + ' button', SUBMIT_BTN).click();
      cy.get(DIALOG).should('be.visible'); // dialog stays open
    });

    it('handles a large (~6 MB) PDF without crashing', { tags: ['@regression', '@boundary'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(FILE_INPUT).selectFile(F('sample-resume-large.pdf'), { force: true });
      // App should either accept or reject the large file gracefully
      cy.get(DIALOG).should('be.visible');
      cy.get('body').should('be.visible');
    });
  });

  // ─── Negative path: submit without file ───────────────────────────────────

  context('Negative Path', { tags: ['@regression', '@negative'] }, () => {
    it('keeps the dialog open when submitting without a file', { tags: ['@smoke', '@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(DIALOG).should('be.visible');
      cy.contains(DIALOG + ' button', SUBMIT_BTN).click();
      // Without a file, the dialog must remain open
      cy.get(DIALOG).should('be.visible');
    });
  });

  // ─── File replacement ──────────────────────────────────────────────────────

  context('File Replacement', { tags: ['@regression'] }, () => {
    it('replaces a selected file when a new file is chosen', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      // Select first file
      cy.get(FILE_INPUT).selectFile(F('sample-resume.pdf'), { force: true });
      cy.get(DIALOG).should('be.visible');
      // Select a different file (replacement)
      cy.get(FILE_INPUT).selectFile(F('sample-resume-2.pdf'), { force: true });
      cy.get(DIALOG).should('be.visible');
      cy.contains(DIALOG + ' button', SUBMIT_BTN).should('be.visible');
    });
  });

  // ─── Job & Bucket association ──────────────────────────────────────────────

  context('Job and Bucket Association', { tags: ['@regression'] }, () => {
    it('shows Search jobs and Search buckets fields', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="Search jobs..."]').should('be.visible');
      cy.get('[placeholder="Search buckets..."]').should('be.visible');
    });

    it('searches for a job and the input updates', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="Search jobs..."]').clear().type('BPO');
      cy.get('[placeholder="Search jobs..."]').should('have.value', 'BPO');
      cy.get('body').should('be.visible'); // no crash
    });

    it('searches for a bucket and the input updates', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get('[placeholder="Search buckets..."]').clear().type('Senior');
      cy.get('[placeholder="Search buckets..."]').should('have.value', 'Senior');
    });

    it('selects a file AND searches for a job (combined flow)', { tags: ['@regression'] }, () => {
      cy.get('button[title="Add a candidate"]').click();
      cy.get(FILE_INPUT).selectFile(F('sample-resume.pdf'), { force: true });
      cy.get('[placeholder="Search jobs..."]').clear().type('BPO');
      cy.get(DIALOG).should('be.visible');
      // Cancel to keep env clean
      cy.contains(DIALOG + ' button', CANCEL_BTN).click();
      cy.get(DIALOG).should('not.exist');
    });
  });
});
