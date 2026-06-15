/* Temporary discovery spec for create-form pages owned by Pipelines/Templates.
   Excluded from normal runs (lives under _discovery). */

const pages = [
  { name: 'pipelines-new', path: '/pipelines/new' },
  { name: 'templates-new', path: '/templates/new' },
  { name: 'templates-folders-new', path: '/templates/folders/new' },
];

function dump(name) {
  cy.document().then((doc) => {
    const els = (sel) => Array.from(doc.querySelectorAll(sel));
    const inputs = els('input').map((i) => ({
      tag: 'input',
      type: i.type,
      id: i.id,
      name: i.name,
      placeholder: i.placeholder,
      slot: i.getAttribute('data-slot'),
      required: i.required,
      maxLength: i.maxLength,
      ariaLabel: i.getAttribute('aria-label'),
    }));
    const textareas = els('textarea').map((t) => ({
      tag: 'textarea',
      id: t.id,
      name: t.name,
      placeholder: t.placeholder,
      slot: t.getAttribute('data-slot'),
    }));
    const buttons = els('button').map((b) => ({
      text: b.innerText.trim().slice(0, 40),
      type: b.type,
      title: b.getAttribute('title'),
      disabled: b.disabled,
      slot: b.getAttribute('data-slot'),
    }));
    const labels = els('label').map((l) => ({
      text: l.innerText.trim().slice(0, 40),
      for: l.getAttribute('for'),
    }));
    const selects = els('[data-slot="select-trigger"], select').map((s) => ({
      text: s.innerText.trim().slice(0, 40),
      slot: s.getAttribute('data-slot'),
    }));
    const headings = els('h1,h2,h3').map((h) => h.innerText.trim());
    const out = {
      url: doc.location.pathname,
      headings,
      inputs,
      textareas,
      selects,
      labels,
      buttons,
    };
    cy.writeFile(`cypress/discovery/_create-${name}.json`, JSON.stringify(out, null, 2));
    cy.task('log', `\n=== ${name} ===\n` + JSON.stringify(out, null, 2));
  });
}

describe('discover create forms', () => {
  pages.forEach((p) => {
    it(`dumps ${p.path}`, () => {
      cy.login();
      cy.visit(p.path);
      cy.get('body').should('be.visible');
      // give the SPA time to render the form
      cy.get('input, textarea', { timeout: 20000 }).should('exist');
      dump(p.name);
    });
  });
});
