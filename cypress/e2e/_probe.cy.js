describe('probe', () => {
  it('captures error DOM after bad login', () => {
    cy.visit('/login');
    cy.get('#email').type('doesnotexist@nowhere.com');
    cy.get('#password').type('SomePass123!', { log: false });
    cy.contains('button', /^log\s?in$/i).click();
    // give the app time to respond via retrying assertion on body text
    cy.contains(/invalid|incorrect|wrong|failed|error|credential|not found|unable/i, { timeout: 12000 }).then(($el) => {
      cy.log('MATCHED TEXT: ' + $el.text());
      cy.task && null;
    });
    cy.document().then((doc) => {
      const sonner = doc.querySelectorAll('[data-sonner-toast]');
      const alert = doc.querySelectorAll('[role="alert"]');
      const status = doc.querySelectorAll('[role="status"]');
      // eslint-disable-next-line no-console
      console.log('SONNER_COUNT=' + sonner.length, 'ALERT_COUNT=' + alert.length, 'STATUS_COUNT=' + status.length);
      sonner.forEach((s) => console.log('SONNER_TEXT=' + s.textContent));
      status.forEach((s) => console.log('STATUS_TEXT=' + s.textContent + ' :: ' + s.outerHTML.slice(0,200)));
    });
  });
});
