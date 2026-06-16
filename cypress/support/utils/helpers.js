// ─── Routes ──────────────────────────────────────────────────────────────────
// All routes verified live via the discovery spec (cypress/e2e/_discovery).

export const ROUTES = {
  login: '/login',
  home: '/',
  dashboard: '/dashboard',
  jobs: '/jobs',
  pipelines: '/pipelines',
  pipelineNew: '/pipelines/new',
  templates: '/templates',
  templateNew: '/templates/new',
  folderNew: '/templates/folders/new',
  candidates: '/talent-base/candidates',
  imports: '/talent-base/imports',
  mergeRequests: '/talent-base/merge-requests',
  feedback: '/feedback',
  settings: '/settings/profile',
  settingsProfile: '/settings/profile',
  settingsPreferences: '/settings/preferences',
  settingsNotifications: '/settings/notifications',
  settingsApiKeys: '/settings/api-keys',
  settingsBuckets: '/settings/buckets',
  settingsIntegrations: '/settings/integrations',
  settingsVoice: '/settings/voice',
  settingsMembers: '/settings/members',
  settingsTeamStructure: '/settings/org-chart',
  settingsRoles: '/settings/roles',
};

// ─── Selectors ────────────────────────────────────────────────────────────────
// Verified against the live DOM (discovery spec, 2026-06-15). The TOD SPA is built
// with Radix UI and exposes almost no data-testid attributes; stable hooks are
// element ids (settings/login + form pages), title attributes on icon buttons,
// data-slot attributes, ARIA roles/labels, and href values.

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
    // Sidebar nav links are ICON-ONLY (empty text) — always select by href.
    homeLink: 'a[href="/"]',
    dashboardLink: 'a[href="/dashboard"]',
    jobsLink: 'a[href="/jobs"]',
    pipelinesLink: 'a[href="/pipelines"]',
    templatesLink: 'a[href="/templates"]',
    candidatesLink: 'a[href="/talent-base/candidates"]',
    importsLink: 'a[href="/talent-base/imports"]',
    mergeRequestsLink: 'a[href="/talent-base/merge-requests"]',
    feedbackLink: 'a[href="/feedback"]',
    settingsLink: 'a[href="/settings"]',
    // Radix dropdown trigger for the user/account menu — it is the LAST such
    // trigger on the page (content-area dropdowns appear earlier in the DOM).
    userMenuBtn: '[data-slot="dropdown-menu-trigger"]',
    // Sign out / Profile render as [role="menuitem"] inside the Radix dropdown.
    menuItem: '[role="menuitem"]',
  },

  // Shared Radix dialog/modal conventions.
  modal: {
    dialog: '[role="dialog"]',
    title: '[data-slot="dialog-title"]',
    closeBtn: '[data-slot="dialog-close"]',
    // Destructive confirmations (e.g. pipeline delete) render as an ARIA
    // alertdialog, not a plain dialog — confirmed live (2026-06-16). Matches
    // both so it works whether a given confirmation has been migrated or not.
    confirmDialog: '[role="dialog"], [role="alertdialog"]',
  },

  dashboard: {
    // Greeting matches "Good morning/afternoon/evening, <Name>" dynamically.
    greetingPattern: /good (morning|afternoon|evening)/i,
    chart: '[data-slot="chart"]',
    needsAttention: 'Needs Attention',
  },

  jobs: {
    heading: 'Business Units',
    searchInput: '[placeholder="Search business units"]',
    newBuBtn: 'button[title="New BU"]',
    newJobBtn: 'button[title="New Job"]',
    buCard: 'a[aria-label^="Open "]',
    rowMoreBtn: '[aria-label="More"]',
    // New Business Unit dialog fields (verified live).
    buNameInput: '#bu-name',
    buDescriptionInput: '#bu-description',
    createBuBtn: 'button:contains("Create BU")',
  },

  // Pipelines list page (/pipelines).
  // "New Pipeline" is a LINK that navigates to a full-page form — not a modal.
  pipelines: {
    heading: 'Pipelines',
    newPipelineLink: 'a[href="/pipelines/new"]',
    card: 'a[aria-label^="Open "]',
    deleteBtn: 'button[title="Delete pipeline"]',
  },

  // Pipeline creation form (full page at /pipelines/new, not a modal).
  // Same caveat as templateForm/folderForm — the save button has no
  // type="submit" attribute (confirmed live); select it by visible text.
  // Confirmed live (2026-06-16): saving requires at least one stage, and
  // every stage requires a name — "Save Pipeline" rejects with a toast
  // ("Please add at least one stage" / "Please name stage N") otherwise.
  pipelineForm: {
    nameInput: '#pipeline-name',
    descriptionInput: '#pipeline-description',
    saveBtn: 'button:contains("Save Pipeline")',
    addStageBtn: 'button:contains("Add Stage")',
    stageNameInput: 'input[placeholder="Stage name"]',
  },

  // Templates list page (/templates).
  // "New Template" and "New Folder" are LINKS to full-page forms — not modals.
  templates: {
    heading: 'Message Templates',
    searchInput: '[placeholder="Search templates and folders..."]',
    newTemplateLink: 'a[href="/templates/new"]',
    newFolderLink: 'a[href="/templates/folders/new"]',
    card: 'a[href^="/templates/"]:not([href="/templates/new"])',
    folderCard: 'a[href^="/templates/folders/"]:not([href="/templates/folders/new"])',
    deleteFolderBtn: 'button[title="Delete folder"]',
    syncWhatsappBtn: 'button[title="Pull approved WhatsApp templates from icpaas"]',
  },

  // Template creation form (full page at /templates/new, not a modal).
  // The save button is a plain <button data-slot="button"> with NO type
  // attribute (confirmed live) — select by visible text, not button[type=submit].
  templateForm: {
    nameInput: '#template-name',
    descriptionInput: '#template-description',
    subjectInput: '#template-subject',
    bodyTextarea: 'textarea[placeholder*="Write your message template"]',
    saveBtn: 'button:contains("Save Template")',
  },

  // Folder creation form (full page at /templates/folders/new, not a modal).
  // Same as templateForm.saveBtn — no type="submit" attribute on the button.
  folderForm: {
    nameInput: '#folder-name',
    descriptionInput: '#folder-description',
    saveBtn: 'button:contains("Create Folder")',
  },

  candidates: {
    tableHeaders: ['Candidate Name', 'Email', 'Phone', 'Title', 'Location', 'Experience', 'Added'],
    searchInput: '[placeholder="Search"]',
    addCandidateBtn: 'button[title="Add a candidate"]',
    refreshBtn: 'button[title="Refresh"]',
    rowCheckbox: 'input[type="checkbox"][aria-label^="Select "]',
    filterBtn: 'button[data-slot="popover-trigger"]:contains("No filters")',
    dateFilterBtn: 'button[data-slot="popover-trigger"]:contains("Created Date")',
    // Add Candidate dialog — resume-upload flow only (no name/email/phone text inputs).
    resumeInput: '[role="dialog"] input[type="file"]',
    searchJobsInput: '[placeholder="Search jobs..."]',
    searchBucketsInput: '[placeholder="Search buckets..."]',
    submitBtn: '[role="dialog"] button[data-slot="button"]:contains("Add Candidate")',
    cancelBtn: '[role="dialog"] button[data-slot="button"]:contains("Cancel")',
  },

  imports: {
    tableHeaders: ['Name', 'Type', 'Progress', 'Created', 'Status', 'Creator'],
    searchInput: '[placeholder="Search"]',
    newImportBtn: 'button[title="New Import"]',
    refreshBtn: 'button[title="Refresh"]',
    // Import creation dialog fields (verified live).
    importNameInput: '#import-name-input',
    importDescriptionInput: '#import-description-input',
  },

  mergeRequests: {
    heading: 'Merge Requests',
    requestLink: 'a[href*="/talent-base/merge-requests/"]',
  },

  settings: {
    // Profile — IDs are stable (discovered live).
    nameInput: '#name-input',
    emailInput: '#email-input',
    careerSiteTagline: '#career-site-tagline',
    careerSiteAbout: '#career-site-about',
    careerSiteLogoInput: '#career-site-logo-input',
    // Save button starts disabled; edit a field to enable it.
    saveBtn: 'button:contains("Save changes")',
    // Sub-nav links
    profileLink: 'a[href="/settings/profile"]',
    bucketsLink: 'a[href="/settings/buckets"]',
    membersLink: 'a[href="/settings/members"]',
    rolesLink: 'a[href="/settings/roles"]',
  },

  buckets: {
    heading: 'Buckets',
    createBucketBtn: 'button:contains("Create Bucket")',
    // Create Bucket dialog (verified live).
    nameInput: '#bucket-name',
    descriptionInput: '#bucket-description',
    submitBtn: '[role="dialog"] button:contains("Create")',
    cancelBtn: '[role="dialog"] button:contains("Cancel")',
  },

  members: {
    heading: 'Members',
    tableHeaders: ['Member', 'Role', 'Reports To', 'Joined', 'Actions'],
    inviteBtn: 'button:contains("Invite Member")',
    editBtn: 'button[title="Edit"]',
    removeBtn: 'button[title="Remove"]',
    // Invite Member dialog (verified live).
    emailInput: '#invite-email',
    nameInput: '#invite-name',
    roleSelect: '[data-slot="select-trigger"]',
    submitBtn: '[role="dialog"] button[data-slot="button"]:contains("Invite Member")',
    cancelBtn: '[role="dialog"] button[data-slot="button"]:contains("Cancel")',
  },

  roles: {
    heading: 'Roles',
    createRoleBtn: 'button:contains("Create Role")',
    editBtn: 'button[title="Edit"]',
    deleteBtn: 'button[title="Delete"]',
  },

  table: {
    rows: 'table tbody tr',
    headers: 'table thead th',
  },

  pagination: {
    prevBtn: '[aria-label="Previous page"]',
    nextBtn: '[aria-label="Next page"]',
  },

  toast: {
    success: '[data-sonner-toast][data-type="success"], [role="status"]',
    error: '[data-sonner-toast][data-type="error"], [role="alert"]',
    any: '[data-sonner-toast], [role="status"], [role="alert"]',
  },
};

// ─── Utility Functions ────────────────────────────────────────────────────────

/** Generate a unique string with an optional prefix. */
export const unique = (prefix = 'AUTO') =>
  `${prefix}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

/** Return the base URL for the current TEST_ENV from Cypress config. */
export const getBaseUrl = () => Cypress.config('baseUrl');

/** Return the current TEST_ENV (dev / qa / staging / uat / local). */
export const getTestEnv = () => Cypress.env('TEST_ENV') || 'dev';

/** Format a JS Date to a local YYYY-MM-DD (not UTC). */
export const formatDate = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Truncate a string to maxLen characters. */
export const truncate = (str, maxLen = 50) =>
  str.length > maxLen ? `${str.substring(0, Math.max(0, maxLen - 3))}...` : str;

/** Build a string of exactly `len` characters. */
export const maxLengthString = (len = 255) => 'A'.repeat(len);

/**
 * Escape `\` and `"` so a value can be safely interpolated inside a
 * double-quoted CSS attribute-selector string (CSS string-escaping rules).
 */
const escapeAttrValue = (value) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/**
 * Find an "Open <name>" card link by exact aria-label match. Escapes the
 * name before interpolating it into the CSS attribute selector — names
 * containing a literal `"` (e.g. special-character test data) would
 * otherwise break the selector's quoting and throw a CSS syntax error.
 *
 * Deliberately kept as a single cy.get() (not cy.get().filter()) so it stays
 * natively retry-able: a `.filter()` chained off a query that currently
 * matches zero elements throws immediately instead of retrying, which broke
 * create/delete flows that assert existence right after a DOM update.
 */
export const cardByOpenLabel = (name) => cy.get(`a[aria-label="Open ${escapeAttrValue(name)}"]`);

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

/**
 * Assert an element matching `selector` is either hidden or entirely absent
 * from the DOM. Cypress's Chainable has no `.or()` combinator — `.should(x).or(y)`
 * throws at runtime — so this expresses the OR inside a single retry-able `.should()`.
 */
export const assertHiddenOrAbsent = (selector) => {
  cy.get('body').should(($body) => {
    const $el = $body.find(selector);
    expect($el.length === 0 || !$el.is(':visible')).to.be.true;
  });
};

/**
 * Assert a button matching `selector` (optionally filtered by visible text)
 * is either disabled or entirely absent from the DOM.
 */
export const assertDisabledOrAbsent = (selector, text) => {
  cy.get('body').should(($body) => {
    const $matches = $body.find(selector);
    const $el = text
      ? $matches.filter((_, el) => el.textContent.toLowerCase().includes(text.toLowerCase()))
      : $matches;
    expect($el.length === 0 || $el.is(':disabled') || $el.attr('aria-disabled') === 'true').to.be.true;
  });
};
