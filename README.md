# Fleet Studio Git Commit & Diff Viewer

A production-quality full-stack web application designed for Fleet Studio Technologies to display Git commit metadata and file-level unified diffs from any public GitHub repository.

---

## Overview

The **Git Commit & Diff Viewer** allows developers and technical reviewers to inspect any Git commit across public open-source repositories. The application adheres strictly to the **Fleet Studio OpenAPI specification** and reproduces the exact visual design specified in the **Figma design mockups**.

### Visual Design & Aesthetics
- **Accurate Typography & Color Palette**: Styled using the exact design tokens specified in the Figma file (`#39496A` body, `#6D727C` muted, `#1C7CD6` link blue, `#D8FFCB` diff addition green, `#FFE4E9` diff deletion red, `#F8FDFF` page background).
- **Collapsible File Cards**: Click the chevron or file path to toggle individual file diffs.
- **Side-by-Side Dual Line Numbers**: Dedicated Base (old) and Head (new) line number columns with right-aligned monospace numbers.
- **Horizontal Code Scrolling**: Monospace code blocks preserve indentation and whitespace without wrapping, allowing smooth horizontal scrolling on smaller viewports.
- **Conditional Committer Display**: Displays committer information only when it differs from the author or author timestamp.
- **Syntax Highlighting**: Language-aware syntax highlighting using Prism.js that never alters diff semantics, prefixes (`+`, `-`, ` `), or line numbers.

---

## Features

- **Public Repository Commit Inspection**: Queries commit metadata and patches from GitHub's REST API.
- **OpenAPI Schema Compliance**: Implements the exact Fleet Studio backend specification for `/repositories/:owner/:repository/commits/:oid` and `/repositories/:owner/:repository/commits/:oid/diff`.
- **Unified Diff Parsing**: Accurately parses multiple hunks, added lines, deleted lines, context lines, and file renames while preserving line numbering.
- **Robust Error Handling**: Handles 400 (invalid 40-character SHA), 404 (repository/commit not found), 429 (GitHub rate limiting), and network errors gracefully with user-friendly alerts.
- **Responsive Layout**: Fluid experience across desktop, tablet, and mobile with stacked metadata and isolated horizontal code scrolling.
- **Zero Database Architecture**: Operates as a stateless API adapter and caching-ready gateway.

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18, React Router v6, Axios, Prism.js | Component-driven UI, client-side routing, and syntax highlighting |
| **Tooling & Bundler** | Vite 5 | Instant HMR, fast production bundling |
| **Backend** | Node.js, Express.js | Lightweight, interview-explainable HTTP server |
| **Styling** | Vanilla CSS with CSS Custom Properties | Pixel-perfect Figma design implementation without framework bloat |
| **Testing** | Jest, Supertest (Backend), Vitest, React Testing Library (Frontend) | Comprehensive unit and integration test coverage |

---

## Project Structure

```
├── package.json                   # Root scripts for development, testing, and building
├── .env.example                   # Root environment template
├── .gitignore                     # Git ignore rules
├── README.md                      # Project documentation and guide
├── SOLUTION.md                    # Technical review document (WHAT, HOW, WHY)
├── swagger.json                   # Fleet Studio OpenAPI specification
│
├── server/                        # Express Backend (Port 5000)
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── controllers/
│   │   │   └── commit.controller.js
│   │   ├── routes/
│   │   │   └── commit.routes.js
│   │   ├── services/
│   │   │   ├── github.service.js
│   │   │   └── commit.service.js
│   │   ├── mappers/
│   │   │   ├── commit.mapper.js
│   │   │   └── diff.mapper.js
│   │   ├── middleware/
│   │   │   ├── error.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── utils/
│   │   │   ├── diff.parser.js
│   │   │   └── errors.js
│   │   ├── app.js
│   │   └── server.js
│   └── tests/
│       ├── commit.api.test.js
│       ├── commit.mapper.test.js
│       ├── diff.mapper.test.js
│       ├── diff.parser.test.js
│       └── validation.middleware.test.js
│
└── client/                        # React Frontend (Port 1234)
    ├── package.json
    ├── vite.config.js             # Port 1234 and backend proxy configuration
    ├── index.html
    └── src/
        ├── components/
        │   ├── AuthorInfo.jsx
        │   ├── CommitHeader.jsx
        │   ├── CommitMetadata.jsx
        │   ├── DiffHunk.jsx
        │   ├── DiffLine.jsx
        │   ├── EmptyDiffState.jsx
        │   ├── ErrorState.jsx
        │   ├── FileDiff.jsx
        │   ├── FileHeader.jsx
        │   └── LoadingState.jsx
        ├── pages/
        │   └── CommitPage.jsx
        ├── services/
        │   └── api.js
        ├── styles/
        │   ├── commit.css
        │   ├── global.css
        │   └── variables.css
        ├── utils/
        │   ├── date.js
        │   ├── diff.js
        │   └── language.js
        ├── App.jsx
        └── main.jsx
```

---

## Environment Variables

Copy `.env.example` to `.env` or set in your environment:

```bash
# Server Port (default: 5000)
PORT=5000

# Optional GitHub Token to increase rate limits (60 req/hr unauthenticated vs 5000 req/hr authenticated)
GITHUB_TOKEN=
```

> **Security Note**: `GITHUB_TOKEN` is only accessed by the Express server and is **never** exposed to the React frontend.

---

## Installation

Install all dependencies for root, server, and client:

```bash
# From the project root
npm run setup
```

Or install individually:

```bash
cd server && npm install
cd ../client && npm install
```

---

## Running the Application

### Option A: Run Both Concurrently (Recommended)

From the project root:

```bash
npm run dev
```

This starts:
- Express backend at **http://localhost:5000**
- Vite frontend at **http://localhost:1234**

### Option B: Run Individually

**Backend Server:**
```bash
cd server
npm run dev
# or: npm start
```

**Frontend Client:**
```bash
cd client
npm run dev
```

---

## Example URL

Navigate in your browser to:

```
http://localhost:1234/repositories/golemfactory/clay/commit/a1bf367b3af680b1182cc52bb77ba095764a11f9
```

Navigating to `http://localhost:1234/` automatically redirects to this default example commit.

---

## API Endpoints

The Express server exposes the following endpoints matching the Fleet Studio OpenAPI contract:

### 1. Get Commit Metadata
```http
GET /repositories/:owner/:repository/commits/:oid
```
**Example**:
```http
GET http://localhost:5000/repositories/golemfactory/clay/commits/a1bf367b3af680b1182cc52bb77ba095764a11f9
```
**Response** (JSON Array with Commit object):
```json
[
  {
    "oid": "a1bf367b3af680b1182cc52bb77ba095764a11f9",
    "subject": "New blender 2.82",
    "body": "",
    "author": {
      "name": "Dariusz Rybi",
      "email": "jiivanq@gmail.com",
      "date": "2020-04-23T14:33:50Z",
      "avatarUrl": "https://avatars.githubusercontent.com/u/293058?v=4"
    },
    "committer": {
      "name": "Dariusz Rybi",
      "email": "jiivanq@gmail.com",
      "date": "2020-04-23T14:33:50Z",
      "avatarUrl": "https://avatars.githubusercontent.com/u/293058?v=4"
    },
    "parents": [
      {
        "oid": "aaea9e8d6bfa84e60dd4ca5ec968c5c463302258"
      }
    ]
  }
]
```

### 2. Get Commit Diff
```http
GET /repositories/:owner/:repository/commits/:oid/diff
```
**Example**:
```http
GET http://localhost:5000/repositories/golemfactory/clay/commits/a1bf367b3af680b1182cc52bb77ba095764a11f9/diff
```
**Response** (JSON Array of CombinedFileDifference objects):
```json
[
  {
    "changeKind": "MODIFIED",
    "baseFile": { "path": "scripts/node_integration_tests/tasks/__init__.py" },
    "headFile": { "path": "scripts/node_integration_tests/tasks/__init__.py" },
    "hunks": [
      {
        "header": "@@ -1,8 +1,6 @@",
        "lines": [
          { "baseLineNumber": 1, "headLineNumber": 1, "content": " import copy" },
          { "baseLineNumber": 4, "headLineNumber": null, "content": "-from golem.apps.default import BlenderAppDefinition" },
          { "baseLineNumber": null, "headLineNumber": 7, "content": "+# new import" }
        ]
      }
    ]
  }
]
```

---

## Testing

Run all unit and integration test suites:

```bash
# Run both backend and frontend tests
npm test

# Run backend tests only (Jest + Supertest)
npm run test:server

# Run frontend tests only (Vitest + RTL)
npm run test:client
```

### Test Coverage Highlights
- **Backend Tests (26 tests)**:
  - Route validation (`oid` 40-character hex pattern enforcement, invalid parameters).
  - Commit mapper logic (message splitting, signature mapping, fallback avatars).
  - Diff mapper logic (`ADDED`, `DELETED`, `MODIFIED`, `RENAMED`, binary changes).
  - Diff parser (hunk headers, line numbering, context normalization, `\ No newline` stripping).
  - API endpoint integration tests (HTTP 200, 400, 404, 429).
- **Frontend Tests (13 tests)**:
  - `CommitHeader` rendering (author, committer conditionality, parent commit navigation).
  - `FileDiff` collapsible toggling and empty/binary state.
  - `DiffLine` line numbers and addition/deletion/context styles.
  - `CommitPage` loading, success, and error state transitions.

---

## Production Build

To build the optimized client bundle:

```bash
npm run build
```

Bundle output will be generated in `client/dist/`.

---

## Packaging

To package the solution for submission (without `node_modules`):

```bash
npm pack
```

This creates a lightweight distribution archive: `fleet-studio-git-diff-viewer-1.0.0.tgz`.
