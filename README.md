# Cypress – Edit User

End-to-end test suite for the **Edit User** functionality of [OrangeHRM](https://opensource-demo.orangehrmlive.com), built with Cypress using the **Page Object Model** pattern.

---

## Application Under Test

| Field | Value |
|---|---|
| Application | OrangeHRM (open-source demo) |
| URL | https://opensource-demo.orangehrmlive.com |
| Feature tested | Admin > User Management > Edit User |

---

## Project Structure

```
cypress/
├── e2e/
│   └── editUser.cy.js       # Test suite (7 test cases)
├── pages/
│   └── adminPage.js         # Page Object — selectors and methods
└── support/
    ├── commands.js           # Custom command: cy.login()
    └── e2e.js               # Global support file
cypress.config.js
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher

---

## Installation

```bash
npm install
```

---

## Running the Tests

Open Cypress Test Runner (interactive mode):

```bash
npm run cy:open
```

Run in headless mode (CI):

```bash
npm run cy:run
```

---

## Test Cases

| ID | Description | Type |
|---|---|---|
| TC01 | Access the edit user page successfully | Happy path |
| TC02 | Validate the user's current data | Happy path |
| TC03 | Edit User's Role successfully | Happy path |
| TC04 | Edit User's Status successfully | Happy path |
| TC05 | Edit the User's Password successfully | Happy path |
| TC06 | Don't allow saving with required fields empty | Negative |
| TC07 | Don't allow saving if passwords don't match | Negative |

---

## Test Design Notes

- **API setup/teardown** — the test user (`testuser001`) is created via API in `before()` and deleted in `after()`, so no manual data preparation is required.
- **Custom login command** — `cy.login()` handles cookie clearing, navigation, and authentication, keeping each test isolated.
- **Resilient selectors** — form fields are located via their labels rather than positional indexes, reducing flakiness caused by DOM changes.
- **Autocomplete stability** — `cy.intercept()` is used to wait for the employee search API response before interacting with the suggestion list.
