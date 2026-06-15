/* Temporary CRUD probe: full create -> verify -> delete cycle for pipeline & folder. */

function snap(label) {
  cy.document().then((doc) => {
    cy.task('log', '\n=== ' + label + ' === url=' + doc.location.pathname +
      ' | aria-open=' + Array.from(doc.querySelectorAll('a[aria-label^="Open "]')).map(a => a.getAttribute('aria-label')).join(' || ').slice(0, 400));
  });
}

describe('crud-probe', () => {
  it('pipeline create + verify + delete', () => {
    const name = 'AUTO_PRB_' + Math.random().toString(36).slice(2, 7).toUpperCase();
    cy.login();
    cy.visit('/pipelines/new');
    cy.get('#pipeline-name', { timeout: 20000 }).should('be.visible').type(name);
    cy.contains('button', /save pipeline/i).click();
    cy.get('body').should('be.visible');
    snap('after-save-pipeline');
    cy.task('log', 'created name=' + name);
    // Wait and check where we land + toast
    cy.document().then((doc) => {
      cy.task('log', 'toasts=' + Array.from(doc.querySelectorAll('[data-sonner-toast]')).map(t => t.getAttribute('data-type') + ':' + t.innerText.trim().slice(0,80)).join(' | '));
    });
  });

  it('folder create + verify + delete', () => {
    const name = 'AUTO_FLD_' + Math.random().toString(36).slice(2, 7).toUpperCase();
    cy.login();
    cy.visit('/templates/folders/new');
    cy.get('#folder-name', { timeout: 20000 }).should('be.visible').type(name);
    cy.contains('button', /create folder/i).click();
    cy.get('body').should('be.visible');
    cy.document().then((doc) => {
      cy.task('log', '\n=== after-create-folder === url=' + doc.location.pathname +
        ' | toasts=' + Array.from(doc.querySelectorAll('[data-sonner-toast]')).map(t => t.getAttribute('data-type') + ':' + t.innerText.trim().slice(0,80)).join(' | ') +
        ' | headings=' + Array.from(doc.querySelectorAll('h1,h2,h3')).map(h => h.innerText.trim()).join(' || ').slice(0,400));
    });
    cy.task('log', 'created folder=' + name);
  });
});
