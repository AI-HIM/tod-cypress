describe('discover mine', () => {
  beforeEach(() => cy.login());

  it('new import', () => {
    cy.visit('/talent-base/imports');
    cy.get('button[title="New Import"]').click();
    cy.wait(1500); // eslint-disable-line
    cy.url().then((u) => cy.task('log', 'URL after New Import: ' + u)).then(() => {
      cy.document().then((doc) => {
        const dlg = doc.querySelector('[role="dialog"]');
        cy.task('log', 'DIALOG present: ' + !!dlg);
        const scope = dlg || doc.body;
        const title = doc.querySelector('[data-slot="dialog-title"]');
        cy.task('log', 'TITLE: ' + (title ? title.textContent : 'none'));
        const inputs = [...scope.querySelectorAll('input')].map((i) => ({ ph: i.placeholder, type: i.type, id: i.id, al: i.getAttribute('aria-label') }));
        cy.task('log', 'INPUTS: ' + JSON.stringify(inputs));
        const btns = [...scope.querySelectorAll('button')].map((b) => b.textContent.trim()).filter(Boolean);
        cy.task('log', 'BUTTONS: ' + JSON.stringify(btns));
        const ta = [...scope.querySelectorAll('textarea')].map((t) => ({ ph: t.placeholder, id: t.id }));
        cy.task('log', 'TEXTAREAS: ' + JSON.stringify(ta));
      });
    });
  });

  it('add candidate after upload', () => {
    cy.visit('/talent-base/candidates');
    cy.get('button[title="Add a candidate"]').click();
    cy.wait(1000); // eslint-disable-line
    cy.get('[role="dialog"] input[type="file"]').selectFile('cypress/fixtures/files/sample-resume.pdf', { force: true }); // eslint-disable-line
    cy.wait(2500); // eslint-disable-line
    cy.document().then((doc) => {
      const dlg = doc.querySelector('[role="dialog"]');
      const submit = [...dlg.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Add Candidate');
      cy.task('log', 'SUBMIT disabled after upload: ' + (submit ? submit.disabled : 'no btn'));
      cy.task('log', 'DIALOG TEXT: ' + dlg.textContent.slice(0, 600));
    });
  });
});
