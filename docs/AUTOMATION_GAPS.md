# Automation Gaps

This document tracks automation gaps — scenarios that are technically feasible but not yet covered, or scenarios blocked by application/environment constraints.

---

## Priority Definitions

| Priority | Description |
|----------|-------------|
| P0 | Critical — must be covered immediately |
| P1 | High — cover in next sprint |
| P2 | Medium — cover when stable |
| P3 | Low — nice to have |

---

## Current Gaps

### Authentication
| Gap | Reason | Priority |
|-----|--------|----------|
| MFA / 2FA flow | Not confirmed active on dev environment | P2 |
| Password reset flow | Requires email access in automation | P1 |
| Account lockout after N failures | Rate limiting behavior unknown | P2 |
| Token expiry handling | Requires time manipulation | P3 |

---

### Jobs / Business Units
| Gap | Reason | Priority |
|-----|--------|----------|
| Update (edit) BU name/description | Edit UI not yet confirmed via selectors | P1 |
| Delete BU | Delete confirmation flow needs selector confirmation | P1 |
| BU-level job listing pagination | Requires seed data with >1 page | P2 |
| Job create full form fields | Full job form selectors not yet captured | P1 |
| Job update/delete | CRUD parity pending selector discovery | P1 |
| Job status transitions | Status change workflow unknown | P2 |

---

### Pipelines
| Gap | Reason | Priority |
|-----|--------|----------|
| Pipeline stage add/remove | Drag-and-drop UI may need special handling | P1 |
| Pipeline rename/delete | Selectors not confirmed for edit row action | P1 |
| Stage reordering | Drag-and-drop not yet covered | P2 |

---

### Templates
| Gap | Reason | Priority |
|-----|--------|----------|
| Template body rich text editor | Rich text editor (WYSIWYG) requires special Cypress commands | P1 |
| Template update/delete | Selectors pending discovery | P1 |
| Folder rename/delete | Selectors pending | P2 |
| Template move to folder | Drag-and-drop or menu action — not yet confirmed | P2 |

---

### Candidates
| Gap | Reason | Priority |
|-----|--------|----------|
| Candidate detail page full coverage | Requires opening a candidate — selectors pending | P1 |
| Candidate update/edit | Edit form selectors not captured | P1 |
| Candidate delete | Delete confirmation flow unknown | P1 |
| Candidate pipeline assignment | Pipeline dropdown selectors pending | P1 |
| Candidate filter by stage | Filter UI not yet explored | P2 |
| Bulk actions | Multi-select + bulk action bar selectors pending | P2 |
| Resume upload in add candidate | File input selector not confirmed | P1 |

---

### Imports
| Gap | Reason | Priority |
|-----|--------|----------|
| Import multi-step wizard full flow | Step 2+ selectors not yet confirmed | P1 |
| Invalid file type upload rejection | Requires negative file upload test | P1 |
| File size limit test | Max file size boundary not documented | P2 |
| Import status polling | Async status polling requires intercept patterns | P2 |
| Import delete | Delete action selectors pending | P2 |

---

### Merge Requests
| Gap | Reason | Priority |
|-----|--------|----------|
| Create merge request flow | How merge requests are triggered is unclear | P1 |
| Full approve flow with data | Requires two duplicate candidates in system | P1 |
| Full reject flow with data | Same dependency | P1 |
| Merge request search with live data | Requires seed data | P2 |

---

### Settings - Members
| Gap | Reason | Priority |
|-----|--------|----------|
| Invite member (send email) | Email delivery not testable in automation | P1 |
| Remove member | Confirmation dialog selectors pending | P1 |
| Change member role | Role change dropdown selectors pending | P2 |

---

### Settings - Roles
| Gap | Reason | Priority |
|-----|--------|----------|
| Create custom role with permissions | Permission matrix selectors not captured | P1 |
| Edit role permissions | Same as above | P1 |
| Delete custom role | Confirmation flow unknown | P2 |

---

### Settings - Buckets
| Gap | Reason | Priority |
|-----|--------|----------|
| Full bucket create form | Button label and field selectors not confirmed | P1 |
| Bucket edit/delete | Selectors pending | P1 |
| Bucket assign candidate | Cross-module workflow | P2 |

---

### Cross-Module / E2E
| Gap | Reason | Priority |
|-----|--------|----------|
| Candidate → Pipeline stage progression | Requires full pipeline + candidate setup | P1 |
| Interview scheduling workflow | Calendar/scheduler integration not yet explored | P2 |
| Email template send in workflow | Email delivery verification not in scope | P3 |
| Role-based access control (RBAC) tests | Requires multiple test users with different roles | P1 |
| Accessibility (a11y) tests | Not in initial scope — requires `cypress-axe` | P2 |
| Visual regression tests | Not in scope — requires `cypress-image-diff` or similar | P3 |
| API contract tests | Out of scope for UI automation framework | P3 |

---

## How to Resolve Gaps

1. **Selector discovery**: Navigate to the relevant page, right-click → Inspect, identify stable selectors (prefer IDs, aria-labels, titles).
2. **Update helpers.js**: Add new selectors to `SELECTORS` constant in `cypress/support/utils/helpers.js`.
3. **Update Page Object**: Add actions/assertions to the relevant page object.
4. **Write the test**: Add a spec in the appropriate `cypress/e2e/<module>/` folder.
5. **Update COVERAGE_MATRIX.md**: Mark the scenario as Automated = Yes.
6. **Remove from this gap list**.
