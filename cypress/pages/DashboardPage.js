import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const S = SELECTORS.dashboard;

/** Section headings rendered on the TOD dashboard (verified via discovery). */
export const DASHBOARD_SECTIONS = [
  'Needs Attention',
  'Recent Activity',
  'Interview Performance',
  'Hiring Funnel',
  'Pipeline Trend',
  'Candidate Sources',
  'Job Overview',
];

export class DashboardPage extends BasePage {
  constructor() {
    super('/dashboard');
  }

  waitUntilReady() {
    cy.location('pathname', { timeout: 15000 }).should('eq', '/dashboard');
    return this;
  }

  /**
   * Assert the personalized greeting without hardcoding a user name.
   * The greeting format is "Good morning/afternoon/evening, <Name>".
   * We match only the time-of-day part so this works for any logged-in user.
   */
  assertGreeting() {
    cy.contains(S.greetingPattern, { timeout: 15000 }).should('be.visible');
    return this;
  }

  /** Assert a specific dashboard section heading is visible. */
  assertSection(text) {
    cy.contains(text, { timeout: 15000 }).should('be.visible');
    return this;
  }

  /** Assert every known dashboard section heading is present. */
  assertAllSections() {
    DASHBOARD_SECTIONS.forEach((section) => this.assertSection(section));
    return this;
  }

  /** Recharts widgets expose [data-slot="chart"]. Assert at least one rendered. */
  assertChartsRendered() {
    cy.get(S.chart, { timeout: 15000 }).should('have.length.greaterThan', 0);
    return this;
  }
}
