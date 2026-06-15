import { SELECTORS } from '../../support/utils/helpers';

const S = SELECTORS.sidebar;

export class Sidebar {
  expand() {
    cy.get('body').then(($body) => {
      if ($body.find(S.expandBtn).length) {
        cy.get(S.expandBtn).click();
      }
    });
    return this;
  }

  collapse() {
    cy.get('body').then(($body) => {
      if ($body.find(S.collapseBtn).length) {
        cy.get(S.collapseBtn).click();
      }
    });
    return this;
  }

  navigateToJobs() {
    this.expand();
    cy.get(S.jobsLink).click();
    cy.waitForPageLoad();
    return this;
  }

  navigateToDashboard() {
    this.expand();
    cy.get(S.dashboardLink).click();
    cy.waitForPageLoad();
    return this;
  }

  navigateToPipelines() {
    this.expand();
    cy.get(S.pipelinesLink).click();
    cy.waitForPageLoad();
    return this;
  }

  navigateToTemplates() {
    this.expand();
    cy.get(S.templatesLink).click();
    cy.waitForPageLoad();
    return this;
  }

  navigateToCandidates() {
    this.expand();
    cy.get(S.candidatesLink).click();
    cy.waitForPageLoad();
    return this;
  }

  navigateToImports() {
    this.expand();
    cy.get(S.importsLink).click();
    cy.waitForPageLoad();
    return this;
  }

  navigateToMergeRequests() {
    this.expand();
    cy.get(S.mergeRequestsLink).click();
    cy.waitForPageLoad();
    return this;
  }

  navigateToSettings() {
    this.expand();
    cy.get(S.settingsLink).click();
    cy.waitForPageLoad();
    return this;
  }

  openUserMenu() {
    // Expand the sidebar so the user label is visible (avatar + name).
    // The Radix dropdown trigger is visible in both collapsed and expanded states,
    // but expanding ensures tests are deterministic and see the full username.
    this.expand();
    // Use .last() — the expanded sidebar may introduce extra dropdown triggers
    // in the chats/content area; the sidebar user button is always last in DOM order
    // while the sidebar is expanded (it sits at the bottom of the fixed sidebar).
    cy.get(S.userMenuBtn).last().click();
    return this;
  }

  signOut() {
    this.openUserMenu();
    cy.contains(S.menuItem, /sign out/i)
      .should('be.visible')
      .click();
    cy.url().should('include', '/login');
    return this;
  }

  assertLinkVisible(href) {
    cy.get(`a[href="${href}"]`).should('exist');
    return this;
  }
}
