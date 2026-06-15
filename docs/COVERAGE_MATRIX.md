# Automation Coverage Matrix

> Last updated: 2026-06-15
> Target: 100% of automatable scenarios

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Automated |
| ⚠️ | Partial |
| ❌ | Not Automated |
| 🚫 | Not Automatable (external dependency) |

---

## Module: Authentication

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Login | Form | Happy path login | ✅ | P0 | @smoke |
| Login | Form | Redirect after login | ✅ | P0 | @smoke |
| Login | Form | Session persistence on reload | ✅ | P1 | @regression |
| Login | Form | Invalid password | ✅ | P0 | @regression |
| Login | Form | Non-existent email | ✅ | P1 | @regression |
| Login | Form | Empty email | ✅ | P1 | @regression |
| Login | Form | Empty password | ✅ | P1 | @regression |
| Login | Form | Both fields empty | ✅ | P1 | @regression |
| Login | Validation | Malformed email | ✅ | P1 | @regression |
| Login | Validation | Whitespace-only email | ✅ | P1 | @regression |
| Login | Security | Password type=password | ✅ | P0 | @regression |
| Login | Security | SQL injection in email | ✅ | P0 | @regression |
| Login | Security | XSS probe in email | ✅ | P0 | @regression |
| Login | Logout | Logout redirects to login | ✅ | P0 | @smoke |
| Login | Logout | Cannot access routes after logout | ✅ | P0 | @regression |
| Login | Auth | MFA / 2FA | ❌ | P2 | — |
| Login | Auth | Password reset | ❌ | P1 | — |
| Login | Auth | Account lockout | ❌ | P2 | — |

---

## Module: Home

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Home | Load | Page loads after login | ✅ | P0 | @smoke |
| Home | Navigation | Sidebar visible | ✅ | P0 | @sanity |
| Home | Navigation | Sidebar expand | ✅ | P0 | @sanity |
| Home | Navigation | Navigate to Jobs | ✅ | P1 | @regression |
| Home | Navigation | Navigate to Dashboard | ✅ | P1 | @regression |
| Home | Navigation | Navigate to Candidates | ✅ | P1 | @regression |
| Home | Navigation | Navigate to Pipelines | ✅ | P1 | @regression |
| Home | Navigation | Navigate to Templates | ✅ | P1 | @regression |
| Home | Navigation | Navigate to Imports | ✅ | P1 | @regression |
| Home | Navigation | Navigate to Settings | ✅ | P1 | @regression |
| Home | Security | Unauthenticated redirect to login | ✅ | P0 | @critical |

---

## Module: Dashboard

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Dashboard | Load | Page loads | ✅ | P0 | @smoke |
| Dashboard | Display | Content visible | ✅ | P1 | @sanity |
| Dashboard | Charts | Charts/widgets render | ✅ | P1 | @regression |
| Dashboard | Navigation | Navigate back to Jobs | ✅ | P2 | @regression |
| Dashboard | Security | Unauthenticated redirect | ✅ | P0 | @critical |

---

## Module: Jobs — Business Units

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Jobs | Read | Page loads | ✅ | P0 | @smoke |
| Jobs | Read | New BU button visible | ✅ | P0 | @sanity |
| Jobs | Read | Search input visible | ✅ | P0 | @regression |
| Jobs | Read | Search BU | ✅ | P1 | @regression |
| Jobs | Read | Empty state for no match | ✅ | P1 | @regression |
| Jobs | Read | Clear search | ✅ | P1 | @regression |
| Jobs | Create | Open New BU modal | ✅ | P0 | @smoke |
| Jobs | Create | Create BU (name + desc) | ✅ | P0 | @critical |
| Jobs | Create | Create BU (name only) | ✅ | P1 | @regression |
| Jobs | Create | Reject empty name | ✅ | P1 | @regression |
| Jobs | Create | Whitespace-only name | ✅ | P1 | @regression |
| Jobs | Create | Special chars in name | ✅ | P2 | @regression |
| Jobs | Create | Max length name | ✅ | P2 | @regression |
| Jobs | Create | SQL injection | ✅ | P0 | @regression |
| Jobs | Create | XSS probe | ✅ | P0 | @regression |
| Jobs | Modal | Cancel closes modal | ✅ | P1 | @regression |
| Jobs | Update | Edit BU name/description | ❌ | P1 | — |
| Jobs | Delete | Delete BU | ❌ | P1 | — |
| Jobs | Create Job | New Job button | ✅ | P0 | @smoke |
| Jobs | Create Job | Full job form | ❌ | P1 | — |
| Jobs | Update Job | Edit job | ❌ | P1 | — |
| Jobs | Delete Job | Delete job | ❌ | P1 | — |

---

## Module: Pipelines

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Pipelines | Read | Page loads | ✅ | P0 | @smoke |
| Pipelines | Read | New Pipeline button | ✅ | P0 | @sanity |
| Pipelines | Read | Search | ✅ | P1 | @regression |
| Pipelines | Read | No match empty state | ✅ | P1 | @regression |
| Pipelines | Create | Open modal | ✅ | P0 | @smoke |
| Pipelines | Create | Create pipeline (name + desc) | ✅ | P0 | @critical |
| Pipelines | Create | Create pipeline (name only) | ✅ | P1 | @regression |
| Pipelines | Create | Reject empty name | ✅ | P1 | @regression |
| Pipelines | Create | Max length name | ✅ | P2 | @regression |
| Pipelines | Create | SQL injection | ✅ | P0 | @regression |
| Pipelines | Create | XSS probe | ✅ | P0 | @regression |
| Pipelines | Modal | Cancel closes modal | ✅ | P1 | @regression |
| Pipelines | Detail | Click to open pipeline | ✅ | P2 | @regression |
| Pipelines | Update | Edit pipeline | ❌ | P1 | — |
| Pipelines | Update | Add/remove stages | ❌ | P1 | — |
| Pipelines | Delete | Delete pipeline | ❌ | P1 | — |

---

## Module: Templates

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Templates | Read | Page loads | ✅ | P0 | @smoke |
| Templates | Read | New Template button | ✅ | P0 | @sanity |
| Templates | Read | Search | ✅ | P1 | @regression |
| Templates | Create | Open modal | ✅ | P0 | @smoke |
| Templates | Create | Create with all fields | ✅ | P0 | @critical |
| Templates | Create | Create name+subject only | ✅ | P1 | @regression |
| Templates | Create | Reject empty name | ✅ | P1 | @regression |
| Templates | Create | Max length name | ✅ | P2 | @regression |
| Templates | Create | SQL injection | ✅ | P0 | @regression |
| Templates | Create | Cancel | ✅ | P1 | @regression |
| Templates | Folder | Open New Folder | ✅ | P0 | @smoke |
| Templates | Folder | Create folder | ✅ | P0 | @critical |
| Templates | Folder | Reject empty folder name | ✅ | P1 | @regression |
| Templates | Folder | Cancel folder creation | ✅ | P1 | @regression |
| Templates | Update | Edit template | ❌ | P1 | — |
| Templates | Update | Rich text body editor | ❌ | P1 | — |
| Templates | Delete | Delete template | ❌ | P1 | — |
| Templates | Delete | Delete folder | ❌ | P2 | — |

---

## Module: Candidates

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Candidates | Read | Page loads | ✅ | P0 | @smoke |
| Candidates | Read | Add button visible | ✅ | P0 | @sanity |
| Candidates | Read | Search input visible | ✅ | P0 | @sanity |
| Candidates | Read | Search candidates | ✅ | P1 | @regression |
| Candidates | Read | Clear search | ✅ | P1 | @regression |
| Candidates | Read | No match state | ✅ | P1 | @regression |
| Candidates | Read | Pagination controls | ✅ | P2 | @regression |
| Candidates | Create | Open add form | ✅ | P0 | @smoke |
| Candidates | Create | Add with required fields | ✅ | P0 | @critical |
| Candidates | Create | Add with phone | ✅ | P1 | @regression |
| Candidates | Create | Reject missing first name | ✅ | P1 | @regression |
| Candidates | Create | Reject missing email | ✅ | P1 | @regression |
| Candidates | Create | Invalid email format | ✅ | P1 | @regression |
| Candidates | Create | Special chars in name | ✅ | P2 | @regression |
| Candidates | Create | Max length fields | ✅ | P2 | @regression |
| Candidates | Create | SQL injection | ✅ | P0 | @regression |
| Candidates | Create | XSS probe | ✅ | P0 | @regression |
| Candidates | Create | Cancel modal | ✅ | P1 | @regression |
| Candidates | Update | Edit candidate | ❌ | P1 | — |
| Candidates | Delete | Delete candidate | ❌ | P1 | — |
| Candidates | Workflow | Pipeline assignment | ❌ | P1 | — |
| Candidates | Workflow | Bulk actions | ❌ | P2 | — |

---

## Module: Imports

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Imports | Read | Page loads | ✅ | P0 | @smoke |
| Imports | Read | New Import button | ✅ | P0 | @sanity |
| Imports | Read | Search | ✅ | P1 | @regression |
| Imports | Read | No match state | ✅ | P1 | @regression |
| Imports | Create | Open modal | ✅ | P0 | @smoke |
| Imports | Create | Create (name + desc) | ✅ | P0 | @critical |
| Imports | Create | Create (name only) | ✅ | P1 | @regression |
| Imports | Create | Reject empty name | ✅ | P1 | @regression |
| Imports | Create | Max length name | ✅ | P2 | @regression |
| Imports | Create | SQL injection | ✅ | P0 | @regression |
| Imports | Create | XSS probe | ✅ | P0 | @regression |
| Imports | Upload | Upload valid PDF | ✅ | P1 | @regression |
| Imports | Upload | Invalid file type | ❌ | P1 | — |
| Imports | Upload | File size limit | ❌ | P2 | — |
| Imports | Modal | Cancel | ✅ | P1 | @regression |
| Imports | Status | Import status polling | ❌ | P2 | — |
| Imports | Delete | Delete import | ❌ | P2 | — |

---

## Module: Merge Requests

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Merge Requests | Read | Page loads | ✅ | P0 | @smoke |
| Merge Requests | Read | List or empty state | ✅ | P1 | @regression |
| Merge Requests | Read | Search | ✅ | P2 | @regression |
| Merge Requests | Workflow | Open a request | ✅ | P2 | @regression |
| Merge Requests | Workflow | Approve action visible | ✅ | P2 | @regression |
| Merge Requests | Workflow | Full approve flow | ❌ | P1 | — |
| Merge Requests | Workflow | Full reject flow | ❌ | P1 | — |

---

## Module: Settings — Profile

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Profile | Read | Page loads | ✅ | P0 | @smoke |
| Profile | Read | Name input visible | ✅ | P0 | @sanity |
| Profile | Read | Email input visible | ✅ | P0 | @sanity |
| Profile | Read | Pre-filled values | ✅ | P1 | @regression |
| Profile | Update | Update name | ✅ | P0 | @critical |
| Profile | Update | Update tagline | ✅ | P1 | @regression |
| Profile | Update | Reject empty name | ✅ | P1 | @regression |
| Profile | Update | Max length name | ✅ | P2 | @regression |
| Profile | Update | SQL injection in name | ✅ | P0 | @regression |
| Profile | Update | XSS in name | ✅ | P0 | @regression |
| Profile | Email | Field exists | ✅ | P1 | @regression |
| Profile | Email | Invalid format if editable | ✅ | P1 | @regression |

---

## Module: Settings — Members

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Members | Read | Page loads | ✅ | P0 | @smoke |
| Members | Read | Current user visible | ✅ | P1 | @regression |
| Members | Read | Search | ✅ | P2 | @regression |
| Members | Invite | Invite button visible | ✅ | P1 | @regression |
| Members | Invite | Email validation | ✅ | P1 | @regression |
| Members | Invite | Send email | 🚫 | — | — |
| Members | Remove | Remove member | ❌ | P1 | — |
| Members | Role | Change member role | ❌ | P2 | — |

---

## Module: Settings — Roles

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Roles | Read | Page loads | ✅ | P0 | @smoke |
| Roles | Read | Default roles visible | ✅ | P1 | @regression |
| Roles | Create | Create role button | ✅ | P2 | @regression |
| Roles | Detail | Click role to view permissions | ✅ | P2 | @regression |
| Roles | Create | Create custom role | ❌ | P1 | — |
| Roles | Update | Edit permissions | ❌ | P1 | — |
| Roles | Delete | Delete custom role | ❌ | P2 | — |

---

## Module: Settings — Buckets

| Page | Feature | Scenario | Automated | Priority | Tag |
|------|---------|----------|-----------|----------|-----|
| Buckets | Read | Page loads | ✅ | P0 | @smoke |
| Buckets | Read | Existing buckets | ✅ | P1 | @regression |
| Buckets | Create | New Bucket button | ✅ | P1 | @smoke |
| Buckets | Create | Create with valid name | ✅ | P0 | @critical |
| Buckets | Create | Reject empty name | ✅ | P1 | @regression |
| Buckets | Create | SQL injection | ✅ | P0 | @regression |
| Buckets | Delete | Delete confirmation | ✅ | P1 | @regression |
| Buckets | Update | Edit bucket | ❌ | P1 | — |

---

## E2E / Workflow Coverage

| Workflow | Scenario | Automated | Priority | Tag |
|----------|----------|-----------|----------|-----|
| Full Hiring | Login → BU → Pipeline → Template → Candidate → Import → Logout | ✅ | P0 | @e2e |
| Candidate Search | Search → View detail | ✅ | P1 | @e2e |
| Template Org | Create folder → Create template | ✅ | P1 | @e2e |
| Pipeline Progression | Move candidate through stages | ❌ | P1 | — |
| Merge Candidates | Create duplicates → Merge | ❌ | P1 | — |
| RBAC Workflow | Different roles see different features | ❌ | P1 | — |

---

## Summary

| Module | Total Scenarios | Automated | Gap |
|--------|----------------|-----------|-----|
| Authentication | 18 | 15 | 3 |
| Home | 11 | 11 | 0 |
| Dashboard | 5 | 5 | 0 |
| Jobs / BU | 22 | 16 | 6 |
| Pipelines | 16 | 13 | 3 |
| Templates | 18 | 14 | 4 |
| Candidates | 21 | 17 | 4 |
| Imports | 17 | 13 | 4 |
| Merge Requests | 7 | 5 | 2 |
| Settings - Profile | 12 | 12 | 0 |
| Settings - Members | 8 | 5 | 3 |
| Settings - Roles | 7 | 4 | 3 |
| Settings - Buckets | 8 | 7 | 1 |
| E2E Workflows | 6 | 3 | 3 |
| **Total** | **176** | **140** | **36** |

**Current coverage: ~80% of automatable scenarios**
