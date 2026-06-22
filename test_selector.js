// Cypress test
cy.contains(name).parents().filter(`:has(${S.deleteTemplateBtn})`).first().find(S.deleteTemplateBtn)
