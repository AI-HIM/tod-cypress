/* Temporary behavior probe: empty-name validation + delete-confirm flow. */

function snapshot(label) {
  cy.document().then((doc) => {
    const out = {
      label,
      url: doc.location.pathname,
      toasts: Array.from(doc.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')).map((t) => ({
        type: t.getAttribute('data-type'),
        role: t.getAttribute('role'),
        text: t.innerText.trim().slice(0, 120),
      })),
      saveBtn: (() => {
        const b = Array.from(doc.querySelectorAll('button[type="submit"]')).find((x) => /save|create/i.test(x.innerText));
        return b ? { text: b.innerText.trim(), disabled: b.disabled, ariaDisabled: b.getAttribute('aria-disabled') } : null;
      })(),
      inlineErrors: Array.from(doc.querySelectorAll('[role="alert"], .text-red-500, .text-destructive, p.text-red, [data-slot="form-message"]')).map((e) => e.innerText.trim().slice(0, 120)).filter(Boolean),
      dialogText: Array.from(doc.querySelectorAll('[role="dialog"],[role="alertdialog"]')).map((d) => d.innerText.trim().slice(0, 200)),
    };
    cy.task('log', '\n=== ' + label + ' ===\n' + JSON.stringify(out, null, 2));
  });
}

describe('probe', () => {
  it('pipeline empty-name save behavior', () => {
    cy.login();
    cy.visit('/pipelines/new');
    cy.get('#pipeline-name', { timeout: 20000 }).should('be.visible');
    snapshot('pipeline-new-initial');
    cy.contains('button', /save pipeline/i).click();
    cy.get('body').should('be.visible');
    snapshot('pipeline-after-empty-save');
  });

  it('pipeline whitespace-name save behavior', () => {
    cy.login();
    cy.visit('/pipelines/new');
    cy.get('#pipeline-name', { timeout: 20000 }).should('be.visible').type('   ');
    cy.contains('button', /save pipeline/i).click();
    cy.get('body').should('be.visible');
    snapshot('pipeline-after-whitespace-save');
  });

  it('folder empty-name save behavior', () => {
    cy.login();
    cy.visit('/templates/folders/new');
    cy.get('#folder-name', { timeout: 20000 }).should('be.visible');
    cy.contains('button', /create folder/i).click();
    cy.get('body').should('be.visible');
    snapshot('folder-after-empty-save');
  });

  it('pipeline delete-confirm flow', () => {
    cy.login();
    cy.visit('/pipelines');
    cy.get('button[title="Delete pipeline"]', { timeout: 20000 }).first().click();
    cy.get('body').should('be.visible');
    snapshot('pipeline-after-delete-click');
  });

  it('folder delete-confirm flow', () => {
    cy.login();
    cy.visit('/templates');
    cy.get('button[title="Delete folder"]', { timeout: 20000 }).first().click();
    cy.get('body').should('be.visible');
    snapshot('folder-after-delete-click');
  });
});
