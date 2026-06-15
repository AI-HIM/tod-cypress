# Framework Setup Guide

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20.x LTS |
| npm | 10.x |
| Chrome | Latest stable |
| Git | 2.x |

## Installation

```bash
# Clone repository
git clone <repo-url>
cd TOD_Cypress

# Install dependencies
npm install

# Verify Cypress installation
npx cypress verify
```

## Environment Configuration

Copy the example env file and fill in credentials:

```bash
cp .env.example .env.dev
```

Environment files by target:

| File | Environment |
|------|-------------|
| `.env.dev` | Development (default) |
| `.env.qa` | QA |
| `.env.staging` | Staging |
| `.env.uat` | UAT |
| `.env.local` | Local development |

Each file contains:

```env
BASE_URL=https://todapp-dev.tynybay.com
USER_EMAIL=your@email.com
USER_PASSWORD=YourPassword
TEST_ENV=dev
```

## GitHub Actions Secrets

Configure these in `Settings > Secrets and variables > Actions`:

| Secret | Description |
|--------|-------------|
| `CYPRESS_USER_EMAIL` | Test user email |
| `CYPRESS_USER_PASSWORD` | Test user password |

## Key Design Decisions

### Session Management
Tests use `cy.session()` with `cacheAcrossSpecs: true` to avoid redundant logins. Each spec calls `cy.login()` in `beforeEach` — Cypress reuses the cached session.

### No Hardcoded Waits
All waiting is done through assertions (`cy.url().should()`, element visibility checks) or `cy.intercept()` + `cy.wait('@alias')`. The `cy.wait(ms)` form is banned by ESLint.

### Selector Strategy
The app has minimal `data-testid` attributes. Selectors in priority order:
1. Element IDs (`#email`, `#bu-name`)
2. Button titles (`button[title="New BU"]`)
3. ARIA labels (`[aria-label="Next page"]`)
4. Placeholders (`[placeholder="Search business units"]`)
5. href attributes (`a[href="/jobs"]`)
6. Text content (`cy.contains('button', /save/i)`)

### SPA Error Suppression
React SPA errors (`ResizeObserver`, `ChunkLoadError`, Hydration) are suppressed in `cypress/support/e2e.js` — they are framework artifacts, not test failures.

### Sidebar Navigation
The sidebar starts collapsed. `cy.expandSidebar()` checks for `button[title="Expand sidebar"]` and clicks it before navigating.

## Folder Structure

See [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) for the complete tree.
