import { SELECTORS } from '../support/utils/helpers';

export class BasePage {
  constructor(path) {
    this.path = path;
  }

  visit() {
    cy.visit(this.path);
    this.waitUntilReady();
    return this;
  }

  waitUntilReady() {
    cy.get('body').should('be.visible');
    cy.url().should('not.include', '/login');
    return this;
  }

  expandSidebar() {
    cy.expandSidebar();
    return this;
  }

  navigateTo(href) {
    this.expandSidebar();
    cy.get(`a[href="${href}"]`).first().click();
    cy.waitForPageLoad();
    return this;
  }

  assertUrl(path) {
    cy.url().should('include', path);
    return this;
  }

  assertHeading(text) {
    cy.contains('h1, h2, h3', text).should('be.visible');
    return this;
  }

  clickButton(text) {
    cy.contains('button', text).should('be.visible').click();
    return this;
  }

  typeIn(selector, value) {
    cy.get(selector).should('be.visible').clear().type(value);
    return this;
  }

  assertSuccessToast(text) {
    const sel = SELECTORS.toast.any;
    if (text) {
      cy.contains(sel, text, { timeout: 10000 }).should('be.visible');
    } else {
      cy.get(sel, { timeout: 10000 }).should('be.visible');
    }
    return this;
  }

  logout() {
    cy.get(SELECTORS.sidebar.userMenuBtn).last().click();
    cy.contains(SELECTORS.sidebar.signOutMenuItem, /sign out/i).click();
    cy.url().should('include', '/login');
    return this;
  }
}
