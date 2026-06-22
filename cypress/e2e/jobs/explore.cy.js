describe('Explore Jobs Module - Job Creation Form', () => {
  it('pastes a dummy JD and explores the next step', function () {
    cy.login();
    cy.visit('/jobs');
    cy.wait(3000);

    cy.get('body').then(($body) => {
      const $cards = $body.find('a[aria-label^="Open "]');
      if ($cards.length === 0) {
        cy.log('Skipping test: no BUs exist');
        this.skip();
      } else {
        // Open first business unit dynamically
        cy.wrap($cards.first()).click({ force: true });
        cy.wait(3000); 

        // Click New Job
        cy.get('button[title="New Job"], button:contains("New Job")').first().click({ force: true });
        cy.wait(1000);

        // Switch to Paste JD
        cy.contains('button', 'Paste JD').click({ force: true });
        cy.wait(500);

        // Find the contenteditable div inside the dialog and type
        cy.get('div[role="dialog"] [contenteditable="true"]').first().type('We are looking for a Software Engineer with 5 years of experience in React and Node.js. Location: Remote. Salary: $120k.', { force: true, delay: 0 });
        
        // Click Parse JD
        cy.contains('button', 'Parse JD').click({ force: true });
        
        // Wait for parsing and next step
        cy.wait(8000); // Parsing might take a few seconds
        cy.screenshot('jobs_create_form_step2', { capture: 'viewport' });
        
        // Try to click "Submit" or "Create Job" without filling required fields to trigger validations
        cy.get('body').then(($body2) => {
          if ($body2.find('button:contains("Create Job"), button:contains("Save"), button:contains("Submit")').length > 0) {
            cy.get('button:contains("Create Job"), button:contains("Save"), button:contains("Submit")').first().click({ force: true });
            cy.wait(1000);
            cy.screenshot('jobs_create_form_validations', { capture: 'viewport' });
          }
        });
      }
    });
  });
});
