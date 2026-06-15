/* Temporary probe — role-create flow. */
describe('settings probe', () => {
  before(() => cy.login());

  it('role page elements', () => {
    cy.visit('/settings/roles');
    cy.contains('Roles', { timeout: 15000 }).should('exist');
    cy.get('body').then(($b) => {
      const createEls = [...$b.find('button, a, [role="button"], [data-slot="button"]')]
        .filter((e) => /create role/i.test(e.textContent))
        .map((e) => ({ tag: e.tagName, slot: e.getAttribute('data-slot'), href: e.getAttribute('href'), text: e.textContent.trim().slice(0, 30) }));
      cy.task('log', '=== CREATE ROLE ELS ===');
      cy.task('log', JSON.stringify(createEls));
    });
    // click it however it renders
    cy.contains(/create role/i).click();
    cy.wait(1500);
    cy.url().then((u) => cy.task('log', `URL AFTER: ${u}`));
    cy.get('body').then(($b) => {
      const dialog = $b.find('[role="dialog"]');
      cy.task('log', `DIALOG: ${dialog.length}`);
      const inputs = [...$b.find('input, textarea')].map((i) => ({ id: i.id, ph: i.getAttribute('placeholder'), type: i.type, tag: i.tagName }));
      cy.task('log', '=== INPUTS ===');
      cy.task('log', JSON.stringify(inputs.slice(0, 25)));
      const btns = [...new Set([...$b.find('button, [data-slot="button"]')].map((b) => b.textContent.trim().slice(0, 25)).filter(Boolean))];
      cy.task('log', '=== BUTTONS ===');
      cy.task('log', JSON.stringify(btns));
      const headings = [...$b.find('h1,h2,h3,[data-slot="dialog-title"]')].map((h) => h.textContent.trim());
      cy.task('log', '=== HEADINGS ===');
      cy.task('log', JSON.stringify(headings));
      // checkboxes for permissions?
      const checks = $b.find('input[type="checkbox"], [role="checkbox"], [role="switch"]').length;
      cy.task('log', `CHECKBOXES/SWITCHES: ${checks}`);
    });
  });
});
