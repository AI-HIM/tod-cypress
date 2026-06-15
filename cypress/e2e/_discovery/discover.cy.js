/*
 * DISCOVERY SPEC — not part of the regular suite.
 * Logs in once, walks every known route, and dumps a real DOM "selector
 * inventory" per page to cypress/discovery/<name>.json. Also opens the primary
 * create flow on each CRUD page and captures the dialog's form fields.
 *
 * Run with:  npx cypress run --spec "cypress/e2e/_discovery/discover.cy.js" --browser electron
 * This is excluded from normal runs via excludeSpecPattern in cypress.config.js.
 */

const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  jobs: '/jobs',
  pipelines: '/pipelines',
  templates: '/templates',
  candidates: '/talent-base/candidates',
  imports: '/talent-base/imports',
  mergeRequests: '/talent-base/merge-requests',
  feedback: '/feedback',
  settingsProfile: '/settings/profile',
  settingsPreferences: '/settings/preferences',
  settingsNotifications: '/settings/notifications',
  settingsApiKeys: '/settings/api-keys',
  settingsBuckets: '/settings/buckets',
  settingsIntegrations: '/settings/integrations',
  settingsMembers: '/settings/members',
  settingsTeam: '/settings/team-structure',
  settingsRoles: '/settings/roles',
};

// Pages where we should try to open the primary "create" flow and capture the form.
const CREATE_TRIGGERS = {
  jobs: /new bu|new job|new business unit|add/i,
  pipelines: /new pipeline|create pipeline|add/i,
  templates: /new template|new folder|create/i,
  candidates: /add candidate|new candidate|\+ ?add/i,
  imports: /new import|import|add/i,
  settingsBuckets: /new bucket|add bucket|create/i,
  settingsMembers: /invite|add member|new/i,
};

function inventory(win) {
  const doc = win.document;
  const txt = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  const attrs = (el, names) => {
    const o = {};
    names.forEach((n) => {
      const v = el.getAttribute(n);
      if (v !== null && v !== '') o[n] = v;
    });
    return o;
  };

  const buttons = [...doc.querySelectorAll('button, [role="button"], a[role="button"]')]
    .map((el) => ({ text: txt(el), ...attrs(el, ['id', 'title', 'aria-label', 'type', 'name', 'data-slot']) }))
    .filter((b) => b.text || b.title || b['aria-label']);

  const inputs = [...doc.querySelectorAll('input, textarea, select')].map((el) => ({
    tag: el.tagName.toLowerCase(),
    ...attrs(el, ['id', 'name', 'placeholder', 'type', 'aria-label', 'role', 'required', 'data-slot']),
  }));

  const links = [...doc.querySelectorAll('a[href]')]
    .map((el) => ({ href: el.getAttribute('href'), text: txt(el), ...attrs(el, ['aria-label', 'data-slot']) }))
    .filter((l) => l.href && !l.href.startsWith('http'));

  const headings = [...doc.querySelectorAll('h1, h2, h3')].map((el) => txt(el)).filter(Boolean);

  const tableHeaders = [...doc.querySelectorAll('table thead th, [role="columnheader"]')]
    .map((el) => txt(el))
    .filter(Boolean);

  const placeholders = [...new Set([...doc.querySelectorAll('[placeholder]')].map((el) => el.getAttribute('placeholder')))];

  const dataSlots = [...new Set([...doc.querySelectorAll('[data-slot]')].map((el) => el.getAttribute('data-slot')))];

  const roles = [...new Set([...doc.querySelectorAll('[role]')].map((el) => el.getAttribute('role')))];

  const ids = [...new Set([...doc.querySelectorAll('[id]')].map((el) => el.getAttribute('id')))]
    .filter((id) => !/^radix-|^headlessui|^:r/.test(id));

  return {
    url: win.location.pathname,
    headings,
    tableHeaders,
    placeholders,
    dataSlots,
    roles,
    stableIds: ids,
    buttons,
    inputs,
    links,
  };
}

function dialogInventory(win) {
  const doc = win.document;
  const dialog = doc.querySelector('[role="dialog"], [data-slot="dialog-content"], .modal');
  if (!dialog) return { found: false };
  const txt = (el) => (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  const attrs = (el, names) => {
    const o = {};
    names.forEach((n) => {
      const v = el.getAttribute(n);
      if (v !== null && v !== '') o[n] = v;
    });
    return o;
  };
  return {
    found: true,
    heading: [...dialog.querySelectorAll('h1,h2,h3,[data-slot="dialog-title"]')].map(txt).filter(Boolean),
    inputs: [...dialog.querySelectorAll('input, textarea, select')].map((el) => ({
      tag: el.tagName.toLowerCase(),
      ...attrs(el, ['id', 'name', 'placeholder', 'type', 'aria-label', 'required', 'data-slot']),
    })),
    buttons: [...dialog.querySelectorAll('button, [role="button"]')]
      .map((el) => ({ text: txt(el), ...attrs(el, ['id', 'title', 'aria-label', 'type', 'data-slot']) }))
      .filter((b) => b.text || b['aria-label']),
  };
}

describe('App discovery', { tags: ['@discovery'] }, () => {
  before(() => {
    cy.login();
  });

  beforeEach(() => {
    cy.login();
  });

  Object.entries(ROUTES).forEach(([name, path]) => {
    it(`inventory: ${name} (${path})`, () => {
      cy.visit(path, { failOnStatusCode: false });
      cy.wait(2500); // let SPA render; discovery only
      cy.window().then((win) => {
        const data = inventory(win);
        cy.writeFile(`cypress/discovery/${name}.json`, data, { log: false });
      });
    });
  });

  Object.entries(CREATE_TRIGGERS).forEach(([name, pattern]) => {
    it(`create-form: ${name}`, () => {
      cy.visit(ROUTES[name], { failOnStatusCode: false });
      cy.wait(2000);
      cy.get('body').then(($body) => {
        const btn = [...$body[0].querySelectorAll('button, [role="button"], a')].find((el) =>
          pattern.test((el.textContent || '') + ' ' + (el.getAttribute('title') || '') + ' ' + (el.getAttribute('aria-label') || ''))
        );
        if (btn) {
          cy.wrap(btn).click({ force: true });
          cy.wait(1500);
          cy.window().then((win) => {
            cy.writeFile(`cypress/discovery/_create-${name}.json`, dialogInventory(win), { log: false });
          });
        } else {
          cy.writeFile(`cypress/discovery/_create-${name}.json`, { found: false, note: 'trigger button not found' }, { log: false });
        }
      });
    });
  });
});
