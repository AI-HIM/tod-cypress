/**
 * @module Dashboard
 * The /dashboard analytics page. Asserts the greeting, every major section
 * heading, and that recharts widgets render. No table exists on this page.
 */

import { DashboardPage, DASHBOARD_SECTIONS } from '../../pages/DashboardPage';

const dashboardPage = new DashboardPage();

describe('Dashboard', { tags: ['@smoke', '@regression'] }, () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/dashboard');
    dashboardPage.waitUntilReady();
  });

  context('Happy Path', { tags: ['@smoke'] }, () => {
    it('shows the personalized greeting', { tags: ['@critical'] }, () => {
      dashboardPage.assertGreeting();
    });

    DASHBOARD_SECTIONS.forEach((section) => {
      it(`renders the "${section}" section`, { tags: ['@regression'] }, () => {
        dashboardPage.assertSection(section);
      });
    });

    it('renders recharts chart widgets', { tags: ['@regression'] }, () => {
      dashboardPage.assertChartsRendered();
    });
  });

  context('Navigation', { tags: ['@regression'] }, () => {
    it('navigates from the dashboard to Jobs', () => {
      cy.navigateTo('/jobs');
      cy.location('pathname').should('eq', '/jobs');
    });
  });

  context('Unauthenticated Access', { tags: ['@critical', '@regression'] }, () => {
    it('redirects an unauthenticated visit to /dashboard back to /login', () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit('/dashboard');
      cy.location('pathname', { timeout: 15000 }).should('include', '/login');
    });
  });
});
