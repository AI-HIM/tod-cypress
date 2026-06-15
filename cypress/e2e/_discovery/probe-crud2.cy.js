/* Probe 2: pipeline stage fields, and folder save after clicking Add Stage / inspecting folder form post-name. */

describe('crud-probe2', () => {
  it('pipeline add stage then inspect', () => {
    cy.login();
    cy.visit('/pipelines/new');
    cy.get('#pipeline-name', { timeout: 20000 }).should('be.visible').type('AUTO_PRB_STG');
    cy.contains('button', /add stage/i).click();
    cy.get('body').should('be.visible');
    cy.document().then((doc) => {
      const inputs = Array.from(doc.querySelectorAll('input,textarea')).map(i => ({ tag: i.tagName, id: i.id, ph: i.placeholder, slot: i.getAttribute('data-slot') }));
      cy.task('log', '\n=== pipeline-after-add-stage inputs ===\n' + JSON.stringify(inputs, null, 2));
      const btns = Array.from(doc.querySelectorAll('button')).map(b => b.innerText.trim().slice(0,30)).filter(Boolean);
      cy.task('log', 'buttons=' + btns.join(' | '));
    });
  });

  it('folder save with name, observe', () => {
    const name = 'AUTO_FLD_' + Math.random().toString(36).slice(2,7).toUpperCase();
    cy.login();
    cy.visit('/templates/folders/new');
    cy.get('#folder-name', { timeout: 20000 }).should('be.visible').type(name);
    cy.task('log', 'folder name typed=' + name);
    // find the submit button precisely
    cy.document().then((doc) => {
      const subs = Array.from(doc.querySelectorAll('button[type="submit"]')).map(b => ({ text: b.innerText.trim(), disabled: b.disabled }));
      cy.task('log', 'submit-buttons=' + JSON.stringify(subs));
    });
    cy.contains('button', /create folder/i).click();
    // wait for either nav or toast
    cy.wait(2000); // eslint-disable-line cypress/no-unnecessary-waiting
    cy.document().then((doc) => {
      cy.task('log', 'after-click url=' + doc.location.pathname +
        ' toasts=' + Array.from(doc.querySelectorAll('[data-sonner-toast]')).map(t => t.getAttribute('data-type')+':'+t.innerText.trim().slice(0,80)).join(' | '));
    });
  });
});
