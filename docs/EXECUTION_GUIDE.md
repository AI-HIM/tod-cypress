# Execution Guide

## Quick Start

```bash
# Install
npm install

# Open Cypress interactive runner
npm run cy:open

# Run all tests headlessly
npm run cy:run
```

## Run by Tag

```bash
# Smoke tests only
npm run test:smoke

# Sanity tests
npx cypress run --env tags=@sanity

# Regression suite
npx cypress run --env tags=@regression

# Critical tests only
npx cypress run --env tags=@critical

# E2E workflow tests
npx cypress run --env tags=@e2e

# Multiple tags (AND)
npx cypress run --env "tags=@smoke+@critical"

# Multiple tags (OR)
npx cypress run --env "tags=@smoke,@sanity"
```

## Run by Environment

```bash
# Development (default)
npm run test:dev

# QA
npm run test:qa

# Staging
npm run test:staging

# UAT
npm run test:uat
```

## Run Specific Spec

```bash
npx cypress run --spec "cypress/e2e/auth/login.cy.js"
npx cypress run --spec "cypress/e2e/jobs/**"
npx cypress run --spec "cypress/e2e/settings/**"
```

## Run by Browser

```bash
# Chrome (default)
npx cypress run --browser chrome

# Firefox
npx cypress run --browser firefox

# Electron (built-in Chromium — no install required)
npx cypress run --browser electron

# WebKit (Safari engine — experimental)
npx cypress run --browser webkit

# Run smoke suite on a specific browser
npm run test:smoke:chrome
npm run test:smoke:firefox
npm run test:smoke:electron
npm run test:smoke:webkit

# Run regression suite on a specific browser
npm run test:regression:chrome
npm run test:regression:firefox
npm run test:regression:electron
npm run test:regression:webkit

# Run smoke across all four browsers sequentially
npm run test:cross-browser
```

> **Note on WebKit:** WebKit requires `experimentalWebKitSupport: true` in `cypress.config.js` (already set) and the `@cypress/webkit` package. Install it with `npm install @cypress/webkit --save-dev` if prompted at runtime.

> **Note on Electron:** Electron is Cypress's built-in browser (Chromium-based) and requires no separate installation. It runs headlessly by default and is ideal for CI pipelines.

## Report Generation

```bash
# Merge JSON reports from parallel runs
npm run report:merge

# Generate HTML from merged JSON
npm run report:generate
```

HTML report is written to `cypress/reports/html/report.html`.

## Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run cy:open` | Open interactive Cypress runner |
| `npm run cy:run` | Run all tests headlessly |
| `npm run test:smoke` | Run `@smoke` tagged tests |
| `npm run test:dev` | Run all tests against dev env |
| `npm run test:qa` | Run all tests against qa env |
| `npm run test:staging` | Run all tests against staging env |
| `npm run test:uat` | Run all tests against uat env |
| `npm run report:merge` | Merge Mochawesome JSON reports |
| `npm run report:generate` | Generate HTML from merged report |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |

## CI/CD Workflows

| Workflow | Trigger | Scope | Browsers |
|----------|---------|-------|----------|
| `pr-validation.yml` | Pull request to main/develop | `@smoke` | Chrome + Firefox (matrix) |
| `smoke.yml` | Push to main/develop + manual | `@smoke` | Selectable (default: Chrome) |
| `regression.yml` | Manual dispatch | `@regression` (parallel 3×) | Selectable (default: all 4) |
| `nightly.yml` | 1 AM UTC daily + manual | Full suite | All 4 browsers (matrix) |

## Retries

Tests are configured with:
- `runMode: 2` — retry failed tests up to 2 times in CI
- `openMode: 0` — no retries in interactive mode

## Session Caching

`cy.login()` uses `cy.session()` with `cacheAcrossSpecs: true`. The session is keyed by user email. If a session is stale, Cypress re-logs in automatically via the validate function.

## Debugging Failures

1. Check screenshots: `cypress/screenshots/`
2. Check videos: `cypress/videos/`
3. Open HTML report: `cypress/reports/html/report.html`
4. Re-run with `--headed` to watch the browser
5. Add `cy.pause()` in the test to pause execution
