/**
 * @module Templates
 *
 * Verified live (2026-06-16):
 *  - "New Template" → a[href="/templates/new"] — full-page form, NOT a modal.
 *  - "New Folder"   → a[href="/templates/folders/new"] — full-page form, NOT a modal.
 *  - Template create page (/templates/new):
 *      #template-name (required), #template-description (optional),
 *      #template-subject, textarea for body. The save button is a plain
 *      <button data-slot="button"> with NO type="submit" attribute — select
 *      it by its visible text "Save Template", never button[type="submit"].
 *  - Folder create page (/templates/folders/new):
 *      #folder-name (required), #folder-description (optional). Same caveat:
 *      the "Create Folder" button has no type="submit" attribute either.
 *  - After save, the app redirects back to /templates.
 *  - Folders appear as cards with a hover-revealed button[title="Delete folder"].
 *  - There is NO delete affordance for an individual standalone template —
 *    confirmed via live DOM inspection of both the /templates list page
 *    (template cards render zero buttons) and the /templates/<id> detail/edit
 *    page (only a Save button + the global account-menu dropdown trigger).
 *    Templates created directly by tests are therefore NOT cleaned up; this is
 *    a product limitation, not a test gap.
 */

import { TemplatesPage } from '../../pages/TemplatesPage';
import { dataFactory } from '../../support/utils/dataFactory';
import { unique, maxLengthString, SQL_INJECTION, XSS_PROBE } from '../../support/utils/helpers';

const page = new TemplatesPage();

describe('Templates', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/templates');
    page.waitUntilReady();
  });

  // ─── READ ──────────────────────────────────────────────────────────────────

  context('Read - list page', { tags: ['@smoke'] }, () => {
    it('loads the templates page with heading and action links', { tags: ['@smoke', '@critical'] }, () => {
      cy.contains('h1, h2', 'Message Templates').should('be.visible');
      cy.get('a[href="/templates/new"]').should('be.visible');
      cy.get('a[href="/templates/folders/new"]').should('be.visible');
    });

    it('displays the search input', { tags: ['@smoke'] }, () => {
      cy.get('[placeholder="Search templates and folders..."]').should('be.visible');
    });

    it('shows existing folder headings', { tags: ['@smoke'] }, () => {
      cy.get('button[title="Delete folder"]').should('have.length.greaterThan', 0);
    });

    it('searches and shows matching results', { tags: ['@regression'] }, () => {
      cy.get('[placeholder="Search templates and folders..."]').clear().type('Screen');
      cy.waitForPageLoad();
      cy.get('body').should('contain.text', 'Screen');
      cy.get('[placeholder="Search templates and folders..."]').clear();
    });

    it('shows no results for an unmatched search term', { tags: ['@regression'] }, () => {
      cy.get('[placeholder="Search templates and folders..."]').clear().type('ZZZNOMATCH_AUTO_XYZ');
      cy.waitForPageLoad();
      cy.get('button[title="Delete folder"]').should('not.exist');
      cy.get('[placeholder="Search templates and folders..."]').clear();
    });
  });

  // ─── CREATE TEMPLATE ───────────────────────────────────────────────────────

  context('Create Template (full-page form)', { tags: ['@crud', '@create'] }, () => {
    it('navigates to the template create form via the New Template link', { tags: ['@smoke'] }, () => {
      page.clickNewTemplate();
      cy.contains('h1, h2', 'New Template').should('be.visible');
      cy.get('#template-name').should('be.visible');
    });

    it('creates a template with name and subject, then verifies it appears', { tags: ['@smoke', '@critical'] }, () => {
      const tmpl = dataFactory.template();
      page.createTemplate(tmpl.name, tmpl.subject, tmpl.description);
      page.assertTemplateVisible(tmpl.name);
    });

    it('creates a template with name and subject only (description optional)', { tags: ['@regression'] }, () => {
      const tmpl = dataFactory.template();
      page.createTemplate(tmpl.name, tmpl.subject);
      page.assertTemplateVisible(tmpl.name);
    });

    it('treats special characters as literal text in template name', { tags: ['@regression'] }, () => {
      const name = `${unique('TPL')} & Co.`;
      const tmpl = dataFactory.template({ name });
      page.createTemplate(tmpl.name, tmpl.subject);
      page.assertTemplateVisible(tmpl.name);
    });

    it('treats an SQL-injection probe as literal text in template name', { tags: ['@regression', '@security'] }, () => {
      const name = `${unique('TPL')} ${SQL_INJECTION}`;
      const tmpl = dataFactory.template({ name });
      page.createTemplate(tmpl.name, tmpl.subject);
      page.assertTemplateVisible(tmpl.name);
    });

    it('stays on the create page when name is empty', { tags: ['@regression', '@validation'] }, () => {
      cy.visit('/templates/new');
      cy.get('#template-name').should('be.visible').and('have.value', '');
      cy.contains('button', 'Save Template').click();
      cy.url().should('include', '/templates/new');
    });

    it('accepts a max-length (100 char) template name', { tags: ['@regression', '@boundary'] }, () => {
      const name = `${unique('TPL')}_${maxLengthString(100 - 12)}`;
      const tmpl = dataFactory.template({ name });
      page.createTemplate(tmpl.name, tmpl.subject);
      cy.url().should('include', '/templates');
    });
  });

  // ─── CREATE FOLDER ────────────────────────────────────────────────────────

  context('Create Folder (full-page form)', { tags: ['@crud', '@create'] }, () => {
    it('navigates to the folder create form via the New Folder link', { tags: ['@smoke'] }, () => {
      page.clickNewFolder();
      cy.contains('h1, h2', 'New Folder').should('be.visible');
      cy.get('#folder-name').should('be.visible');
    });

    it('creates a folder with name only, then verifies it appears', { tags: ['@smoke', '@critical'] }, () => {
      const folder = dataFactory.folder();
      page.createFolder(folder.name);
      page.assertFolderVisible(folder.name);

      // Cleanup — delete the folder.
      page.deleteFolder(folder.name);
      page.assertFolderNotVisible(folder.name);
    });

    it('creates a folder with name and description, then deletes it', { tags: ['@regression'] }, () => {
      const folder = dataFactory.folder();
      page.createFolder(folder.name, folder.description);
      page.assertFolderVisible(folder.name);

      page.deleteFolder(folder.name);
      page.assertFolderNotVisible(folder.name);
    });

    it('stays on the create page when folder name is empty', { tags: ['@regression', '@validation'] }, () => {
      cy.visit('/templates/folders/new');
      cy.get('#folder-name').should('be.visible').and('have.value', '');
      cy.contains('button', 'Create Folder').click();
      cy.url().should('include', '/templates/folders/new');
    });

    it('treats an SQL-injection probe as literal folder name, then cleans up', { tags: ['@regression', '@security'] }, () => {
      const name = `${unique('FLD')} ${SQL_INJECTION}`;
      page.createFolder(name);
      page.assertFolderVisible(name);
      page.deleteFolder(name);
      page.assertFolderNotVisible(name);
    });
  });

  // ─── DELETE FOLDER ────────────────────────────────────────────────────────

  context('Delete Folder', { tags: ['@crud', '@delete'] }, () => {
    it('removes a folder after confirming deletion', { tags: ['@critical'] }, () => {
      const folder = dataFactory.folder();
      page.createFolder(folder.name);
      page.assertFolderVisible(folder.name);

      page.deleteFolder(folder.name);
      page.assertFolderNotVisible(folder.name);
    });
  });

  // ─── SYNC WHATSAPP ────────────────────────────────────────────────────────

  context('Sync WhatsApp', { tags: ['@regression'] }, () => {
    it('shows the Sync WhatsApp button', { tags: ['@regression'] }, () => {
      cy.get('button[title="Pull approved WhatsApp templates from icpaas"]').should('be.visible');
    });
  });
});
