# Functional Coverage Requirements

## Coverage Goal

The objective is to achieve the highest possible automation coverage for every application module, page, workflow, and user-accessible feature.

Claude must identify, design, implement, and maintain automation for every valid business scenario that can be executed through the application UI.

Coverage should not be limited to happy paths.

The framework must include:

* Happy Path Scenarios
* Negative Scenarios
* Boundary Value Scenarios
* Validation Scenarios
* Security Validation Scenarios
* Role-Based Scenarios
* CRUD Scenarios
* Workflow Scenarios
* End-to-End Scenarios
* Regression Scenarios

A page is considered fully automated only when all feasible user actions have automated test coverage.

---

# Mandatory CRUD Coverage

For every module that supports data management, Claude must automatically create and maintain test cases for:

## Create

Validate:

* Successful creation
* Required field validations
* Optional field validations
* Duplicate record prevention
* Invalid data handling
* Boundary values
* Special characters
* Maximum length
* Minimum length

## Read

Validate:

* Search functionality
* Global search
* Filters
* Sorting
* Pagination
* View details
* Grid display
* Record visibility
* Data accuracy

## Update

Validate:

* Successful update
* Partial update
* Full update
* Field-level update
* Validation during update
* Data persistence
* Audit trail visibility (if applicable)

## Delete

Validate:

* Single record deletion
* Bulk deletion
* Soft delete
* Hard delete
* Delete confirmation popup
* Permission validation
* Record removal verification

---

# Scenario Discovery Rules

For every discovered page, Claude must automatically identify:

## Forms

Generate tests for:

* Required fields
* Optional fields
* Invalid inputs
* Boundary values
* Field dependencies
* Field visibility
* Dynamic fields
* Conditional fields

## Tables

Generate tests for:

* Search
* Filter
* Sort
* Pagination
* Export
* Column visibility
* Row actions
* Bulk actions

## Dropdowns

Generate tests for:

* Selection
* Search
* Multi-select
* Default values
* Dependency handling

## Upload Components

Generate tests for:

* Valid files
* Invalid files
* File size limits
* File type restrictions
* Multiple file upload

## Download Components

Generate tests for:

* Successful download
* File integrity
* File naming conventions
* Export formats

## Modals

Generate tests for:

* Open
* Close
* Validation
* Submit
* Cancel

## Notifications

Generate tests for:

* Success messages
* Error messages
* Warning messages
* Information messages

---

# Workflow Coverage Requirements

Claude must identify and automate:

* Complete user journeys
* Multi-page workflows
* Approval flows
* Rejection flows
* State transitions
* Status changes
* Assignment flows
* Escalation flows
* Role-based workflows

Every workflow must have:

* Happy path coverage
* Failure path coverage
* Recovery path coverage

---

# Coverage Completeness Validation

Before considering a page complete, Claude must verify:

✓ All buttons tested

✓ All links tested

✓ All forms tested

✓ All validations tested

✓ All CRUD operations tested

✓ All workflows tested

✓ All business rules tested

✓ All role permissions tested

✓ All notifications tested

✓ All page actions tested

✓ All table operations tested

✓ All filters tested

✓ All exports tested

✓ All uploads tested

✓ All downloads tested

✓ All navigation paths tested

---

# Automation Coverage Matrix

Claude must generate and maintain:

docs/COVERAGE_MATRIX.md

Structure:

Module
→ Page
→ Feature
→ Scenario
→ Automated (Yes/No)
→ Priority
→ Execution Tag

The objective is to continuously move coverage toward 100% of all automatable scenarios.

---

# Coverage Enforcement

When a new page is discovered:

Claude must automatically:

1. Create Page Object.
2. Discover all elements.
3. Identify all business actions.
4. Generate CRUD tests where applicable.
5. Generate validation tests.
6. Generate negative tests.
7. Generate workflow tests.
8. Update coverage matrix.
9. Update documentation.

A page must not be marked complete until all feasible scenarios have automation coverage.
