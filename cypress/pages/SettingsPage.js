import { BasePage } from './BasePage';
import { SELECTORS } from '../support/utils/helpers';

const S = SELECTORS.settings;

export class SettingsPage extends BasePage {
  constructor(section = 'profile') {
    super(`/settings/${section}`);
    this.section = section;
  }

  waitUntilReady() {
    cy.url().should('include', '/settings');
    cy.get('body').should('be.visible');
    return this;
  }

  // ─── Profile ───────────────────────────────────────────────────────────────

  fillName(name) {
    cy.get(S.nameInput).should('be.visible').clear().type(name);
    return this;
  }

  fillTagline(tagline) {
    cy.get(S.careerSiteTagline).should('be.visible').clear().type(tagline);
    return this;
  }

  saveProfile() {
    cy.get(S.saveBtn).click();
    return this;
  }

  assertProfileSaved() {
    this.assertSuccessToast();
    return this;
  }

  // ─── Buckets ──────────────────────────────────────────────────────────────

  visitBuckets() {
    cy.visit('/settings/buckets');
    this.waitUntilReady();
    return this;
  }

  clickNewBucket() {
    cy.contains('button', /new bucket/i).click();
    return this;
  }

  fillBucketName(name) {
    cy.get('[placeholder*="name"], #bucket-name').should('be.visible').clear().type(name);
    return this;
  }

  submitBucket() {
    cy.contains('button', /save|create/i).click();
    return this;
  }

  // ─── Members ──────────────────────────────────────────────────────────────

  visitMembers() {
    cy.visit('/settings/members');
    this.waitUntilReady();
    return this;
  }

  assertMemberVisible(email) {
    cy.get('body').should('contain.text', email);
    return this;
  }

  inviteMember(email) {
    cy.contains('button', /invite/i).click();
    cy.get('[placeholder*="email"], [type="email"]').last().clear().type(email);
    cy.contains('button', /send|invite/i).last().click();
    return this;
  }

  // ─── Roles ────────────────────────────────────────────────────────────────

  visitRoles() {
    cy.visit('/settings/roles');
    this.waitUntilReady();
    return this;
  }

  assertRoleVisible(roleName) {
    cy.get('body').should('contain.text', roleName);
    return this;
  }
}
