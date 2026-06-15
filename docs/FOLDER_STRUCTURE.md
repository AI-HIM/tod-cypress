# Folder Structure

```
TOD_Cypress/
├── .github/
│   └── workflows/
│       ├── pr-validation.yml       # Smoke on every PR
│       ├── smoke.yml               # Smoke on push to main/develop
│       ├── regression.yml          # Parallel regression (manual / tag-based)
│       └── nightly.yml             # Full suite — 1 AM UTC daily
│
├── cypress/
│   ├── e2e/                        # Test specifications
│   │   ├── auth/
│   │   │   └── login.cy.js
│   │   ├── home/
│   │   │   └── home.cy.js
│   │   ├── dashboard/
│   │   │   └── dashboard.cy.js
│   │   ├── jobs/
│   │   │   └── business-units.cy.js
│   │   ├── pipelines/
│   │   │   └── pipelines.cy.js
│   │   ├── templates/
│   │   │   └── templates.cy.js
│   │   ├── candidates/
│   │   │   ├── candidates.cy.js
│   │   │   └── add-candidate.cy.js
│   │   ├── imports/
│   │   │   └── imports.cy.js
│   │   ├── merge-requests/
│   │   │   └── merge-requests.cy.js
│   │   ├── settings/
│   │   │   ├── settings-profile.cy.js
│   │   │   ├── settings-members.cy.js
│   │   │   ├── settings-roles.cy.js
│   │   │   └── settings-buckets.cy.js
│   │   └── workflows/
│   │       └── full-workflow.cy.js
│   │
│   ├── fixtures/                   # Static test data (JSON)
│   │   ├── users.json
│   │   ├── candidates.json
│   │   ├── business-units.json
│   │   ├── jobs.json
│   │   ├── templates.json
│   │   ├── pipelines.json
│   │   ├── imports.json
│   │   └── files/
│   │       └── sample-resume.pdf
│   │
│   ├── pages/                      # Page Object Model
│   │   ├── BasePage.js             # Abstract base — shared utilities
│   │   ├── LoginPage.js
│   │   ├── HomePage.js
│   │   ├── DashboardPage.js
│   │   ├── JobsPage.js
│   │   ├── PipelinesPage.js
│   │   ├── TemplatesPage.js
│   │   ├── CandidatesPage.js
│   │   ├── ImportsPage.js
│   │   ├── MergeRequestsPage.js
│   │   ├── SettingsPage.js
│   │   ├── index.js                # Barrel export
│   │   └── components/
│   │       ├── Sidebar.js
│   │       ├── Modal.js
│   │       ├── Toast.js
│   │       └── Table.js
│   │
│   ├── reports/                    # Auto-generated (gitignored)
│   │   ├── json/
│   │   └── html/
│   │
│   ├── screenshots/                # Auto-generated on failure (gitignored)
│   ├── videos/                     # Auto-generated (gitignored)
│   │
│   └── support/
│       ├── commands.js             # All custom cy.* commands
│       ├── e2e.js                  # Global hooks, error suppression
│       └── utils/
│           ├── dataFactory.js      # Faker-based runtime test data
│           └── helpers.js          # ROUTES, SELECTORS constants + utilities
│
├── docs/
│   ├── FRAMEWORK_SETUP.md
│   ├── FOLDER_STRUCTURE.md
│   ├── EXECUTION_GUIDE.md
│   ├── COVERAGE_MATRIX.md
│   ├── APPLICATION_INVENTORY.md
│   └── AUTOMATION_GAPS.md
│
├── .env.dev                        # Dev environment (BASE_URL, credentials)
├── .env.qa
├── .env.staging
├── .env.uat
├── .env.local
├── .env.example                    # Template — commit this, not the others
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── cypress.config.js
└── package.json
```

## Naming Conventions

| Artifact | Convention | Example |
|----------|-----------|---------|
| Spec files | `<module>.cy.js` | `business-units.cy.js` |
| Page objects | `<Module>Page.js` (PascalCase) | `JobsPage.js` |
| Components | `<Component>.js` (PascalCase) | `Modal.js` |
| Custom commands | `cy.camelCase()` | `cy.expandSidebar()` |
| Fixtures | `kebab-case.json` | `business-units.json` |
| Test tags | `@kebab-case` | `@smoke`, `@regression` |
