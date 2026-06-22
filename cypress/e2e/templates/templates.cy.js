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
 *  - Templates appear as list items/cards with a button[title="Delete template"].
 *  - After creating either a folder or template, they should be cleaned up immediately
 *    to maintain test environment hygiene.
 */

import { faker } from '@faker-js/faker';
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

    it('shows existing folder headings', { tags: ['@smoke'] }, function () {
      const fName = `Searchable Folder ${Date.now()}`;
      page.createFolder(fName);
      page.search(fName);
      cy.contains(fName).should('be.visible');
      page.deleteFolder(fName);
    });

    it('searches and shows matching results', { tags: ['@regression'] }, function () {
      const templateName = `Search Template ${Date.now()}`;
      page.createTemplate(templateName, 'Subject', 'Body');
      
      page.search(templateName);
      cy.contains(templateName).should('be.visible');
      
      page.deleteTemplate(templateName);
      page.assertTemplateNotVisible(templateName);
    });

    it('shows no results for an unmatched search term', { tags: ['@regression'] }, function () {
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

    it('creates a template with name and subject, then verifies it appears', { tags: ['@smoke', '@critical'] }, function () {
      const tmpl = dataFactory.template();
      tmpl.name = faker.lorem.words(3);
      page.createTemplate(tmpl.name, tmpl.subject, tmpl.body, tmpl.description);
      page.assertTemplateVisible(tmpl.name);
      
      // Cleanup
      page.deleteTemplate(tmpl.name);
      page.assertTemplateNotVisible(tmpl.name);
    });

    it('creates a template with name, subject, and body only (description optional)', { tags: ['@regression'] }, function () {
      const tmpl = dataFactory.template();
      tmpl.name = faker.lorem.words(3);
      page.createTemplate(tmpl.name, tmpl.subject, tmpl.body);
      page.assertTemplateVisible(tmpl.name);
      
      // Cleanup
      page.deleteTemplate(tmpl.name);
      page.assertTemplateNotVisible(tmpl.name);
    });

    it('treats special characters as literal text in template name', { tags: ['@regression'] }, function () {
      const name = `${faker.lorem.word()} & Co.`;
      const tmpl = dataFactory.template({ name });
      page.createTemplate(tmpl.name, tmpl.subject, tmpl.body);
      page.assertTemplateVisible(tmpl.name);
      
      // Cleanup
      page.deleteTemplate(tmpl.name);
      page.assertTemplateNotVisible(tmpl.name);
    });

    it('treats an SQL-injection probe as literal text in template name', { tags: ['@regression', '@security'] }, function () {
      const name = `${faker.lorem.word()} ${SQL_INJECTION}`;
      const tmpl = dataFactory.template({ name });
      page.createTemplate(tmpl.name, tmpl.subject, tmpl.body);
      page.assertTemplateVisible(tmpl.name);
      
      // Cleanup
      page.deleteTemplate(tmpl.name);
      page.assertTemplateNotVisible(tmpl.name);
    });

    it('creates a template inside a folder, opens the folder, and verifies the template', { tags: ['@regression'] }, function () {
      const folderName = `Test Folder ${Date.now()}`;
      const templateName = `Folder Template ${Date.now()}`;

      // 1. Create the parent folder
      page.createFolder(folderName);
      
      // 2. Create the template inside the folder
      cy.visit('/templates/new');
      cy.contains('label', 'Add to Folder').click();
      cy.contains('button', 'Select a folder...').click();
      cy.contains('[role="option"], li', folderName).scrollIntoView().click();
      
      page.fillTemplateName(templateName);
      page.fillTemplateSubject('Subject');
      page.fillTemplateBody('Body');
      page.saveTemplate();
      
      // 3. Open the folder to verify the template is inside
      cy.visit('/templates');
      cy.contains(folderName).closest('div.group[role="button"]').click();
      
      // Template should be visible in the folder
      cy.contains(templateName).should('be.visible');
      
      // Cleanup: Delete template while inside the folder
      page.deleteTemplate(templateName);
      page.assertTemplateNotVisible(templateName);
      
      // Cleanup: Delete the parent folder
      cy.visit('/templates');
      page.deleteFolder(folderName);
    });

    it('stays on the create page when name is empty', { tags: ['@regression', '@validation'] }, function () {
      cy.visit('/templates/new');
      cy.get('#template-name').should('be.visible').and('have.value', '');
      page.fillTemplateBody(faker.lorem.paragraph());
      cy.contains('button', 'Save Template').click();
      cy.url().should('include', '/templates/new');
    });

    it('shows validation error toast when body is empty', { tags: ['@regression', '@validation'] }, function () {
      const tmpl = dataFactory.template();
      tmpl.name = faker.lorem.words(3);
      
      cy.visit('/templates/new');
      page.fillTemplateName(tmpl.name);
      if (tmpl.subject) page.fillTemplateSubject(tmpl.subject);
      // Explicitly LEAVE BODY EMPTY
      
      page.saveTemplate();
      
      // Should show error toasty
      cy.contains('[data-sonner-toast]', /Please enter a message body/i).should('be.visible');
      // Should remain on the page
      cy.url().should('include', '/templates/new');
    });

    it('accepts a max-length (100 char) template name', { tags: ['@regression', '@boundary'] }, function () {
      const prefix = `${faker.lorem.word()}_`;
      const name = prefix + maxLengthString(100 - prefix.length);
      const tmpl = dataFactory.template({ name });
      page.createTemplate(tmpl.name, tmpl.subject, tmpl.body);
      cy.url().should('include', '/templates');
      
      // Cleanup
      page.deleteTemplate(tmpl.name);
      page.assertTemplateNotVisible(tmpl.name);
    });
  });

  // ─── CREATE FOLDER ────────────────────────────────────────────────────────

  context('Create Folder (full-page form)', { tags: ['@crud', '@create'] }, () => {
    it('navigates to the folder create form via the New Folder link', { tags: ['@smoke'] }, () => {
      page.clickNewFolder();
      cy.contains('h1, h2', 'New Folder').should('be.visible');
      cy.get('#folder-name').should('be.visible');
    });

    it('creates a folder with name only, then verifies it appears', { tags: ['@smoke', '@critical'] }, function () {
      const folder = dataFactory.folder();
      folder.name = faker.lorem.words(2) + ' Folder';
      page.createFolder(folder.name);
      page.assertFolderVisible(folder.name);

      // Cleanup — delete the folder.
      page.deleteFolder(folder.name);
      page.assertFolderNotVisible(folder.name);
    });

    it('creates a folder with name and description, then deletes it', { tags: ['@regression'] }, function () {
      const folder = dataFactory.folder();
      folder.name = faker.lorem.words(2) + ' Folder';
      page.createFolder(folder.name, folder.description);
      page.assertFolderVisible(folder.name);

      page.deleteFolder(folder.name);
      page.assertFolderNotVisible(folder.name);
    });

    it('stays on the create page when folder name is empty', { tags: ['@regression', '@validation'] }, function () {
      cy.visit('/templates/folders/new');
      cy.get('#folder-name').should('be.visible').and('have.value', '');
      cy.contains('button', 'Create Folder').click();
      cy.url().should('include', '/templates/folders/new');
    });

    it('treats an SQL-injection probe as literal folder name, then cleans up', { tags: ['@regression', '@security'] }, function () {
      const name = `${faker.lorem.word()} ${SQL_INJECTION}`;
      page.createFolder(name);
      page.assertFolderVisible(name);
      page.deleteFolder(name);
      page.assertFolderNotVisible(name);
    });
  });

  // ─── DELETE TEMPLATE ──────────────────────────────────────────────────────

  context('Delete Template', { tags: ['@crud', '@delete'] }, () => {
    it('removes a template after confirming deletion', { tags: ['@critical'] }, function () {
      cy.get('body').then(($body) => {
        const $btns = $body.find('button[title="Delete template"]');
        if ($btns.length === 0) {
          cy.log('Skipping test: no templates exist to delete');
          this.skip();
        } else {
          // Dynamic cleanup: Delete the first found template
          const name = $btns.first().closest('tr, .group, [data-slot="card"]').find('h3, span.font-medium, div.truncate').first().text().trim();
          
          if (!name) {
             this.skip(); // fallback if name not readable
          } else {
             page.deleteTemplate(name);
             page.assertTemplateNotVisible(name);
          }
        }
      });
    });
  });

  // ─── DELETE FOLDER ────────────────────────────────────────────────────────

  context('Delete Folder', { tags: ['@crud', '@delete'] }, () => {
    it('removes a folder after confirming deletion', { tags: ['@critical'] }, function () {
      cy.get('body').then(($body) => {
        const $btns = $body.find('button[title="Delete folder"]');
        if ($btns.length === 0) {
          cy.log('Skipping test: no folders exist to delete');
          this.skip();
        } else {
          // Dynamic cleanup: Delete the first found folder
          const name = $btns.first().closest('.group').find('h3, span.font-medium, div.truncate').first().text().trim();
          
          if (!name) {
             this.skip(); // fallback if name not readable
          } else {
             page.deleteFolder(name);
             page.assertFolderNotVisible(name);
          }
        }
      });
    });
  });

  // ─── SYNC WHATSAPP ────────────────────────────────────────────────────────

  context('Sync WhatsApp', { tags: ['@regression'] }, () => {
    it('shows the Sync WhatsApp button', { tags: ['@regression'] }, () => {
      cy.get('button[title="Pull approved WhatsApp templates from icpaas"]').should('be.visible');
    });
  });
});
