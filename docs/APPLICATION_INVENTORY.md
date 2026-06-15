# Application Inventory

## Application: TOD (Talent On Demand)

**Type:** ATS (Applicant Tracking System)
**URL:** https://todapp-dev.tynybay.com
**Auth:** Email + Password (session-based)

---

## Module Inventory

### 1. Authentication
| Route | Description |
|-------|-------------|
| `/login` | Login page with email/password form |

**Key Elements:**
- `#email` — email input
- `#password` — password input
- `button[type="submit"]` — Log in button

---

### 2. Home / Root
| Route | Description |
|-------|-------------|
| `/` | Home / landing page post-login |

---

### 3. Dashboard
| Route | Description |
|-------|-------------|
| `/dashboard` | Analytics dashboard with charts/metrics |

---

### 4. Jobs
| Route | Description |
|-------|-------------|
| `/jobs` | Business units and jobs listing |

**Key Elements:**
- `[placeholder="Search business units"]` — BU search
- `button[title="New BU"]` — Create business unit
- `button[title="New Job"]` — Create job
- `#bu-name`, `#bu-description` — BU form fields

---

### 5. Pipelines
| Route | Description |
|-------|-------------|
| `/pipelines` | Hiring pipeline templates |

**Key Elements:**
- `button` matching `/new pipeline/i`
- `#pipeline-name`, `#pipeline-description`

---

### 6. Templates
| Route | Description |
|-------|-------------|
| `/templates` | Email templates and folders |

**Key Elements:**
- `button` matching `/new template/i`
- `button` matching `/new folder/i`
- `#template-name`, `#template-subject`, `#template-description`
- `#folder-name`

---

### 7. Candidates (Talent Base)
| Route | Description |
|-------|-------------|
| `/talent-base/candidates` | Candidate list, search, filters |

**Key Elements:**
- `[placeholder="Search"]` — candidate search
- `button[title="Add a candidate"]`
- `[placeholder="First name"]`, `[placeholder="Last name"]`, `[placeholder="Email"]`, `[placeholder="Phone"]`

---

### 8. Imports (Talent Base)
| Route | Description |
|-------|-------------|
| `/talent-base/imports` | Bulk import management |

**Key Elements:**
- `button[title="New Import"]`
- `#import-name-input`, `#import-description-input`

---

### 9. Merge Requests (Talent Base)
| Route | Description |
|-------|-------------|
| `/talent-base/merge-requests` | Duplicate candidate merge review |

---

### 10. Settings - Profile
| Route | Description |
|-------|-------------|
| `/settings/profile` | User profile and org settings |

**Key Elements:**
- `#name-input`, `#email-input`, `#career-site-tagline`
- `button[type="submit"]`

---

### 11. Settings - Members
| Route | Description |
|-------|-------------|
| `/settings/members` | Team member management |

---

### 12. Settings - Roles
| Route | Description |
|-------|-------------|
| `/settings/roles` | Role and permission management |

---

### 13. Settings - Buckets
| Route | Description |
|-------|-------------|
| `/settings/buckets` | Talent pool bucket management |

---

## Sidebar Navigation

The sidebar is an icon-rail (collapsed by default):
- Expand: `button[title="Expand sidebar"]`
- Collapse: `button[title="Collapse sidebar"]`
- Nav links: `a[href="/<route>"]`
- User menu: `[id^="headlessui-menu-button"]` (last in DOM)

---

## Common UI Patterns

| Pattern | Selector |
|---------|---------|
| Modal dialog | `[role="dialog"]` |
| Toast success | `[role="status"]`, `[data-sonner-toast]` |
| Toast error | `[role="alert"]` |
| Pagination next | `[aria-label="Next page"]` |
| Pagination prev | `[aria-label="Previous page"]` |
