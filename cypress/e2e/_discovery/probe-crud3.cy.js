/* Probe 3: full pipeline create (name+stage+save) and template create, observe nav/toast + list visibility. Then clean up. */

describe('crud-probe3', () => {
  it('pipeline full create + cleanup', () => {
    const name = 'AUTO_PIP_' + Math.random().toString(36).slice(2,7).toUpperCase();
    cy.login();
    cy.visit('/pipelines/new');
    cy.get('#pipeline-name', { timeout: 20000 }).should('be.visible').type(name);
    cy.contains('button', /add stage/i).click();
    cy.get('input[placeholder="Stage name"]').type('Screening');
    cy.contains('button', /save pipeline/i).click();
    cy.wait(2500); // eslint-disable-line cypress/no-unnecessary-waiting
    cy.document().then((doc) => {
      cy.task('log', 'pipeline after-save url=' + doc.location.pathname +
        ' toasts=' + Array.from(doc.querySelectorAll('[data-sonner-toast]')).map(t => t.getAttribute('data-type')+':'+t.innerText.trim().slice(0,60)).join(' | '));
    });
    cy.visit('/pipelines');
    cy.get('a[aria-label="Open ' + name + '"]', { timeout: 20000 }).should('exist');
    cy.task('log', 'pipeline card found for ' + name);
    // cleanup: delete it
    cy.get('a[aria-label="Open ' + name + '"]').closest('[data-slot], div, li').parent().within(() => {});
    // Instead, find the delete button associated. Cards each have their own delete btn; match by proximity.
    cy.get('a[aria-label="Open ' + name + '"]').parents().filter((i, el) => el.querySelector('button[title="Delete pipeline"]')).first().within(() => {
      cy.get('button[title="Delete pipeline"]').first().click();
    });
    cy.contains('[role="alertdialog"],[role="dialog"]', /delete pipeline\?/i).within(() => {
      cy.contains('button', /^delete pipeline$/i).click();
    });
    cy.wait(2000); // eslint-disable-line cypress/no-unnecessary-waiting
    cy.document().then((doc) => {
      cy.task('log', 'after-delete-pipeline still-present=' + (doc.querySelector('a[aria-label="Open ' + name + '"]') ? 'YES' : 'no') +
        ' toasts=' + Array.from(doc.querySelectorAll('[data-sonner-toast]')).map(t => t.getAttribute('data-type')+':'+t.innerText.trim().slice(0,60)).join(' | '));
    });
  });
});
