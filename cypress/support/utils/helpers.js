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
// element ids (settings/login + modal forms), title attributes on icon buttons,
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
  },

  dashboard: {
    chart: '[data-slot="chart"]',
    needsAttention: 'Needs Attention',
  },

  jobs: {
    heading: 'Business Units',
    searchInput: '[placeholder="Search business units"]',
    newBuBtn: 'button[title="New BU"]',
    newJobBtn: 'button[title="New Job"]',
    gridToggle: 'button:contains("Grid")',
    listToggle: 'button:contains("List")',
    buCard: 'a[aria-label^="Open "]',
    rowMoreBtn: '[aria-label="More"]',
    // New Business Unit dialog
    buNameInput: '#bu-name',
    buDescriptionInput: '#bu-description',
    createBuBtn: 'button:contains("Create BU")',
  },

  pipelines: {
    heading: 'Pipelines',
    // "New Pipeline" is a link to a full-page form, not a modal.
    newPipelineLink: 'a[href="/pipelines/new"]',
    card: 'a[aria-label^="Open "]',
    deleteBtn: 'button[title="Delete pipeline"]',
  },

  templates: {
    heading: 'Message Templates',
    searchInput: '[placeholder="Search templates and folders..."]',
    newTemplateLink: 'a[href="/templates/new"]',
    newFolderLink: 'a[href="/templates/folders/new"]',
    deleteFolderBtn: 'button[title="Delete folder"]',
    syncWhatsappBtn: 'button:contains("Sync WhatsApp")',
  },

  candidates: {
    // The candidates page has no h1/h2; identify it by its table headers + URL.
    tableHeaders: ['Candidate Name', 'Email', 'Phone', 'Title', 'Location', 'Experience', 'Added'],
    searchInput: '[placeholder="Search"]',
    addCandidateBtn: 'button[title="Add a candidate"]',
    refreshBtn: 'button[title="Refresh"]',
    rowCheckbox: 'input[type="checkbox"][aria-label^="Select "]',
    // Add Candidate dialog (resume-upload flow — no name/email text fields)
    resumeInput: '[role="dialog"] input[type="file"]',
    searchJobsInput: '[placeholder="Search jobs..."]',
    searchBucketsInput: '[placeholder="Search buckets..."]',
    submitBtn: '[role="dialog"] button:contains("Add Candidate")',
  },

  imports: {
    tableHeaders: ['Name', 'Type', 'Progress', 'Created', 'Status', 'Creator'],
    searchInput: '[placeholder="Search"]',
    newImportBtn: 'button[title="New Import"]',
    refreshBtn: 'button[title="Refresh"]',
  },

  mergeRequests: {
    heading: 'Merge Requests',
    requestLink: 'a[href*="/talent-base/merge-requests/"]',
  },

  settings: {
    // Profile
    nameInput: '#name-input',
    emailInput: '#email-input',
    careerSiteTagline: '#career-site-tagline',
    careerSiteAbout: '#career-site-about',
    careerSiteLogoInput: '#career-site-logo-input',
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
    // Create Bucket dialog
    nameInput: '#bucket-name',
    descriptionInput: '#bucket-description',
    submitBtn: '[role="dialog"] button:contains("Create")',
  },

  members: {
    heading: 'Members',
    tableHeaders: ['Member', 'Role', 'Reports To', 'Joined', 'Actions'],
    inviteBtn: 'button:contains("Invite Member")',
    editBtn: 'button[title="Edit"]',
    removeBtn: 'button[title="Remove"]',
    // Invite Member dialog
    emailInput: '#invite-email',
    nameInput: '#invite-name',
    roleSelect: '[data-slot="select-trigger"]',
    submitBtn: '[role="dialog"] button:contains("Invite Member")',
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
