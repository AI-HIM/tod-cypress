// ─── Routes ──────────────────────────────────────────────────────────────────

export const ROUTES = {
  login: '/login',
  home: '/',
  dashboard: '/dashboard',
  jobs: '/jobs',
  pipelines: '/pipelines',
  templates: '/templates',
  candidates: '/talent-base/candidates',
  imports: '/talent-base/imports',
  mergeRequests: '/talent-base/merge-requests',
  feedback: '/feedback',
  settings: '/settings/profile',
  settingsBuckets: '/settings/buckets',
  settingsMembers: '/settings/members',
  settingsRoles: '/settings/roles',
  chats: '/chats',
};

// ─── Selectors ────────────────────────────────────────────────────────────────

export const SELECTORS = {
  login: {
    emailInput: '#email',
    passwordInput: '#password',
    submitButton: 'button[type="submit"]',
    errorMessage: '[role="alert"]',
  },

  sidebar: {
    expandBtn: 'button[title="Expand sidebar"]',
    collapseBtn: 'button[title="Collapse sidebar"]',
    homeLink: 'a[href="/"]',
    dashboardLink: 'a[href="/dashboard"]',
    jobsLink: 'a[href="/jobs"]',
    pipelinesLink: 'a[href="/pipelines"]',
    templatesLink: 'a[href="/templates"]',
    candidatesLink: 'a[href="/talent-base/candidates"]',
    importsLink: 'a[href="/talent-base/imports"]',
    mergeRequestsLink: 'a[href="/talent-base/merge-requests"]',
    feedbackLink: 'a[href="/feedback"]',
    settingsLink: 'a[href="/settings/profile"]',
    chatsLink: 'a[href="/chats"]',
    userMenuBtn: '[id^="headlessui-menu-button"]',
    signOutMenuItem: '[role="menuitem"]',
  },

  jobs: {
    searchInput: '[placeholder="Search business units"]',
    newBuBtn: 'button[title="New BU"]',
    newJobBtn: 'button[title="New Job"]',
    buNameInput: '#bu-name',
    buDescriptionInput: '#bu-description',
  },

  modals: {
    buNameInput: '#bu-name',
    buDescriptionInput: '#bu-description',
    pipelineNameInput: '#pipeline-name',
    pipelineDescriptionInput: '#pipeline-description',
    templateNameInput: '#template-name',
    templateSubjectInput: '#template-subject',
    templateDescriptionInput: '#template-description',
    folderNameInput: '#folder-name',
    importNameInput: '#import-name-input',
    importDescriptionInput: '#import-description-input',
    dialog: '[role="dialog"]',
    cancelBtn: 'button:contains("Cancel")',
    closeBtn: '[aria-label="Close"], [aria-label="Dismiss"], button[title="Close"]',
  },

  candidates: {
    searchInput: '[placeholder="Search"]',
    addCandidateBtn: 'button[title="Add a candidate"]',
    firstNameInput: '[placeholder="First name"]',
    lastNameInput: '[placeholder="Last name"]',
    emailInput: '[placeholder="Email"]',
    phoneInput: '[placeholder="Phone"]',
  },

  imports: {
    searchInput: '[placeholder="Search"]',
    newImportBtn: 'button[title="New Import"]',
    importNameInput: '#import-name-input',
    importDescriptionInput: '#import-description-input',
  },

  settings: {
    nameInput: '#name-input',
    emailInput: '#email-input',
    careerSiteTagline: '#career-site-tagline',
    saveBtn: 'button[type="submit"]',
  },

  table: {
    rows: 'table tbody tr',
    headers: 'table thead th',
    noResults: '[data-testid="empty-state"], .empty-state, :contains("No results")',
  },

  pagination: {
    prevBtn: '[aria-label="Previous page"]',
    nextBtn: '[aria-label="Next page"]',
  },

  toast: {
    success: '[role="status"], [data-sonner-toast][data-type="success"], .toast-success',
    error: '[role="alert"], [data-sonner-toast][data-type="error"], .toast-error',
    any: '[role="status"], [role="alert"], [data-sonner-toast], .toast',
  },
};

// ─── Import / Export Statuses ─────────────────────────────────────────────────

export const IMPORT_STATUSES = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

// ─── Utility Functions ────────────────────────────────────────────────────────

/** Generate a unique string with an optional prefix. */
export const unique = (prefix = 'AUTO') =>
  `${prefix}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

/** Return the base URL for the current TEST_ENV from Cypress config. */
export const getBaseUrl = () => Cypress.config('baseUrl');

/** Return the current TEST_ENV (dev / qa / staging / uat / local). */
export const getTestEnv = () => Cypress.env('TEST_ENV') || 'dev';

/** Format a JS Date to YYYY-MM-DD. */
export const formatDate = (date = new Date()) =>
  date.toISOString().split('T')[0];

/** Truncate a string to maxLen characters. */
export const truncate = (str, maxLen = 50) =>
  str.length > maxLen ? `${str.substring(0, maxLen - 3)}...` : str;

/** Build a cy.intercept alias name for an API route. */
export const apiAlias = (method, path) =>
  `${method.toUpperCase()}_${path.replace(/\//g, '_').replace(/^_/, '')}`;

/** Build a string of exactly `len` characters. */
export const maxLengthString = (len = 255) => 'A'.repeat(len);

/** Common special characters for boundary/validation tests. */
export const specialChars = `!@#$%^&*()_+-=[]{}|;':",.<>?/\`~`;

/** Boundary test: empty string */
export const EMPTY = '';

/** Boundary test: whitespace only */
export const WHITESPACE = '   ';

/** SQL injection probe */
export const SQL_INJECTION = `' OR '1'='1`;

/** XSS probe */
export const XSS_PROBE = `<script>alert('xss')</script>`;
