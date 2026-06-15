import { BasePage } from './BasePage';

/**
 * Page object for the Merge Requests area of Talent Base.
 *
 * LIST page (/talent-base/merge-requests):
 *  - heading "Merge Requests"
 *  - each request is a link `a[href*="/talent-base/merge-requests/<uuid>"]`
 *    whose text contains the candidate name, email, source file and "pending".
 *  - there are NO approve/reject controls on the list itself.
 *
 * DETAIL page (/talent-base/merge-requests/<uuid>):
 *  - it is a field-resolution screen, NOT a simple approve/reject form.
 *  - heading = the source file name (e.g. "C_candidates.csv").
 *  - shows "Existing candidate: <name> (<email>)" and a "Pending" badge.
 *  - sections: "Email (always kept from existing)", "Profile Fields"
 *    (radio-group-item controls to pick which value to keep per field), "Skills".
 *  - the two action controls are the buttons "Skip" and "Merge"
 *    (both `button[data-slot="button"]`). "Merge" applies the merge (the
 *    "approve" equivalent); "Skip" dismisses the request (the "reject"
 *    equivalent). Both consume real data on the shared dev environment, so the
 *    spec only verifies they exist + are enabled and never clicks them.
 */
export class MergeRequestsPage extends BasePage {
  constructor() {
    super('/talent-base/merge-requests');
  }

  // A request-item link is one whose href ends in a UUID.
  static REQUEST_LINK = 'a[href*="/talent-base/merge-requests/"]';
  static UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  waitUntilReady() {
    cy.url().should('include', '/talent-base/merge-requests');
    cy.contains('h1, h2, h3', 'Merge Requests').should('be.visible');
    return this;
  }

  /** All list rows that point at an individual merge request (href ends in a uuid). */
  requestItems() {
    return cy
      .get(MergeRequestsPage.REQUEST_LINK)
      .filter((_i, el) => {
        const href = el.getAttribute('href') || '';
        return MergeRequestsPage.UUID_RE.test(href.split('/').pop());
      });
  }

  assertListHeading() {
    cy.contains('h1, h2, h3', 'Merge Requests').should('be.visible');
    return this;
  }

  assertHasPendingRequests() {
    this.requestItems().should('have.length.greaterThan', 0);
    return this;
  }

  /** Open the first request and land on its detail route. */
  openFirstRequest() {
    this.requestItems().first().click();
    cy.location('pathname').should('match', /\/talent-base\/merge-requests\/[0-9a-f-]{36}$/);
    return this;
  }

  // ─── Detail page ──────────────────────────────────────────────────────────

  assertOnDetailPage() {
    cy.location('pathname').should('match', /\/talent-base\/merge-requests\/[0-9a-f-]{36}$/);
    return this;
  }

  /** The "Merge" button — applies the merge (approve equivalent). */
  mergeButton() {
    return cy.contains('button[data-slot="button"]', /^merge$/i);
  }

  /** The "Skip" button — dismisses the request (reject equivalent). */
  skipButton() {
    return cy.contains('button[data-slot="button"]', /^skip$/i);
  }

  assertActionControlsPresent() {
    this.mergeButton().should('be.visible').and('be.enabled');
    this.skipButton().should('be.visible').and('be.enabled');
    return this;
  }

  assertProfileFieldResolution() {
    cy.contains('Profile Fields').should('be.visible');
    cy.get('button[data-slot="radio-group-item"]').should('have.length.greaterThan', 0);
    return this;
  }
}
