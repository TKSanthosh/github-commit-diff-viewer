# Technical Solution & Architectural Documentation

**Project:** Git Commit & Diff Viewer  
**Organization:** Fleet Studio Technologies Coding Assessment  
**Author:** Full-Stack Developer - Santhosh T K
**Date:** September 2026  

---

## 1. Problem Understanding

The objective of this challenge is to build a full-stack web application that allows any developer or reviewer to inspect a Git commit from any public GitHub repository. The application must display:
1. High-level commit metadata (subject, body, author, committer, commit SHA, and parent commit SHAs).
2. File-level code differences (added, deleted, modified, renamed, or copied files).
3. Hunk-level and line-level diffs with side-by-side base/head line numbers and clear visual indications for additions, deletions, and context lines.

Key requirements and constraints:
- **Client Route**: Accessible at `http://localhost:1234/repositories/:owner/:repository/commit/:commitSHA`.
- **Backend API**: Running at `http://localhost:5000` exposing two exact OpenAPI endpoints:
  - `GET /repositories/:owner/:repository/commits/:oid`
  - `GET /repositories/:owner/:repository/commits/:oid/diff`
- **Strict OpenAPI Contract**: Data schemas must match the provided Fleet Studio Redoc/OpenAPI specification.
- **Visual Source of Truth**: The UI must closely mirror the provided Figma design (typography, colors, borders, collapsible cards, responsive layout).
- **Technology Constraints**: Pure JavaScript only (no TypeScript), React for frontend, Node.js + Express for backend, no database, zero unnecessary architecture or dependencies.

---

## 2. Approach

My approach was guided by three principles:
1. **Contract-First Engineering**: I analyzed the live Fleet Studio OpenAPI 3.0 specification (`v1/swagger.json`) directly, discovering that both the metadata and diff endpoints return JSON arrays (`[ Commit ]` and `[ CombinedFileDifference ]`). I designed my Express routes and controllers to respect this schema exactly.
2. **Adapter Architecture**: Rather than exposing GitHub's raw API schema to the frontend, my Node.js Express server acts as an adapter layer that translates GitHub's REST models into Fleet Studio's exact contract.
3. **High Fidelity to Design**: I examined the Figma annotations, design tokens, and screenshot measurements down to exact rem values (`2rem` margins, `0.5rem` author gap, `0.35rem` file title margin, `1.5rem` diff card gap), flat details container without card border, and exact hex colors (`#39496A`, `#6D727C`, `#1C7CD6`, `#D8FFCB`, `#FFE4E9`, `#B07BA9`, `#F8FDFF`).

---

## 3. Architecture

The system follows a clean, decoupled two-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Client (Vite)                      │
│                  http://localhost:1234                      │
│  - CommitPage (Route: /repositories/:owner/:repo/commit/:sha)│
│  - CommitHeader (AuthorInfo + CommitMetadata)               │
│  - FileDiff (FileHeader + DiffHunk + DiffLine)             │
│  - Syntax highlighting via Prism.js (non-destructive)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Node.js + Express Backend                   │
│                  http://localhost:5000                      │
│  ├── Routes: /repositories/:owner/:repository/commits/:oid   │
│  ├── Middleware: Parameter Validation & Centralized Errors   │
│  ├── Services: CommitService & GitHubService                │
│  ├── Mappers: CommitMapper & DiffMapper                      │
│  └── Utilities: DiffParser (Unified Diff Engine)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (REST API)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       GitHub REST API                       │
│    https://api.github.com/repos/:owner/:repo/commits/:sha   │
└─────────────────────────────────────────────────────────────┘
```

### Backend Layer Responsibilities:
- **Routes (`commit.routes.js`)**: Defines REST endpoints and applies parameter validation middleware.
- **Middleware (`validation.middleware.js`, `error.middleware.js`)**: Validates the 40-character hex commit SHA (`^[0-9a-f]{40}$`), sanitizes input, and catches all errors to return uniform JSON payloads.
- **Controllers (`commit.controller.js`)**: Coordinates HTTP request/response lifecycles without embedding business logic.
- **Services (`commit.service.js`, `github.service.js`)**: Encapsulates external GitHub communication, header handling, token management, and error normalization.
- **Mappers (`commit.mapper.js`, `diff.mapper.js`)**: Transforms GitHub REST structures into the OpenAPI schema.
- **Utilities (`diff.parser.js`, `errors.js`)**: Unified diff state machine and typed error classes.

---

## 4. Request / Response Flow

```
[Browser Client]
       │
       ├─ 1. Navigates to /repositories/golemfactory/clay/commit/a1bf367...
       │
       ├─ 2. React Router mounts CommitPage and extracts route params
       │
       ├─ 3. api.fetchCommitDetails fires parallel GET requests:
       │     a) GET /repositories/.../commits/:oid
       │     b) GET /repositories/.../commits/:oid/diff
       ▼
[Express Backend]
       │
       ├─ 4. validateCommitParams verifies owner, repository, and 40-char hex SHA
       │
       ├─ 5. CommitService invokes GitHubService.getCommit(owner, repo, sha)
       │
       ├─ 6. GitHubService calls https://api.github.com/repos/:owner/:repo/commits/:sha
       │     (Includes User-Agent and optional Bearer token)
       │
       ├─ 7. GitHub returns commit metadata, file status list, and raw patches
       │
       ├─ 8. Backend executes:
       │     - commit.mapper: splits message into subject/body, maps author/committer
       │     - diff.mapper: maps file status to changeKind, routes patches to diff.parser
       │     - diff.parser: extracts hunks, line numbers, and line prefixes
       │
       ├─ 9. Controller responds with HTTP 200 JSON arrays: [Commit] and [CombinedFileDifference]
       ▼
[React Client]
       │
       ├─ 10. Receives JSON data and updates component state
       ├─ 11. Renders CommitHeader with author avatar, subject, body, and SHA links
       ├─ 12. Renders collapsible FileDiff cards with hunk headers and dual line numbers
       └─ 13. Applies Prism.js syntax highlighting while preserving diff prefixes
```

---

## 5. Architectural Decision: Why React?

- **WHAT**: React 18 with function components, hooks (`useState`, `useEffect`, `useCallback`, `memo`), and React Router v6.
- **HOW**: Built using Vite for bundling, with modular components (`CommitHeader`, `AuthorInfo`, `CommitMetadata`, `FileDiff`, `FileHeader`, `DiffHunk`, `DiffLine`).
- **WHY**:
  - **Component Reusability**: A commit can contain dozens of changed files, each containing multiple hunks and hundreds of lines. React’s virtual DOM efficiently reconciles diff tables and allows selective collapsing without re-rendering unaffected files.
  - **Declarative State Transitions**: Effortlessly coordinates loading, error (400, 404, 429), empty, and populated diff states.
  - **URL Parameter Binding**: React Router enables direct deep-linking to any commit URL and supports navigating to parent commits seamlessly.

---

## 6. Architectural Decision: Why Node.js + Express?

- **WHAT**: Node.js v20 with Express.js as the HTTP server.
- **HOW**: Lightweight Express server with native ES-style route structuring, CORS middleware, custom validation middleware, and centralized error handling.
- **WHY**:
  - **Simplicity and Maintainability**: Express is minimal, un-opinionated, and transparent. It avoids the heavy ceremony of frameworks like NestJS or boilerplate of enterprise Java/C# backends for a micro-adapter service.
  - **Asynchronous I/O**: Node's event-driven runtime handles upstream HTTP calls to GitHub efficiently without thread blocking.
  - **Interview Explainability**: Every line of code from routing to parsing is straightforward, legible, and easy to walk through in a technical interview.

---

## 7. Architectural Decision: Why GitHub REST API instead of GraphQL?

- **WHAT**: Used GitHub REST API `GET https://api.github.com/repos/:owner/:repo/commits/:sha`.
- **HOW**: Ingested the unified commit payload including author, committer, parents, and file patches.
- **WHY**:
  - **Single Request Payloads**: The REST commit endpoint returns the commit metadata AND the unified diff patches for changed files in a single HTTP request.
  - **Diff Availability**: GitHub's GraphQL API does not natively return file diff patches directly in the `Commit` node without complex sub-queries, requiring extra overhead or git tree traversal.
  - **Lower Complexity**: REST requests require standard HTTP headers and no external GraphQL client libraries, keeping the bundle lean and reducing attack surface.

---

## 8. Architectural Decision: Why the Backend Acts as an Adapter

- **WHAT**: The backend implements the Adapter / Anti-Corruption Layer pattern between GitHub's API and the Fleet Studio OpenAPI contract.
- **HOW**: `commit.mapper.js` and `diff.mapper.js` ingest GitHub's JSON schema and transform it into the OpenAPI schema:
  - Commit message is split into `subject` (first line) and `body` (remaining lines).
  - **File Change Status Mapping**: GitHub file statuses are translated into the OpenAPI `changeKind` enum:
    - `"added"` $\rightarrow$ `ADDED` (`baseFile: null`, `headFile: { path }`)
    - `"removed"` $\rightarrow$ `DELETED` (`baseFile: { path }`, `headFile: null`)
    - `"renamed"` $\rightarrow$ `RENAMED` (`baseFile: { path: previous_filename }`, `headFile: { path: filename }`)
    - `"copied"` $\rightarrow$ `COPIED` (`baseFile: { path: previous_filename }`, `headFile: { path: filename }`)
    - `"modified"` / `"changed"` $\rightarrow$ `MODIFIED` (`baseFile: { path }`, `headFile: { path }`)
    - `"type_changed"` $\rightarrow$ `TYPE_CHANGED` (`baseFile: { path }`, `headFile: { path }`)
  - Raw patch strings are parsed into structured `DiffHunk` and `DiffLine` objects.
- **WHY**:
  - **Separation of Concerns**: Prevents vendor lock-in. If Fleet Studio migrates from GitHub to GitLab, Bitbucket, or internal Git servers, only the adapter services change—the frontend contract remains completely untouched.
  - **Explicit File Status Semantics**: The client receives a strictly typed `changeKind` for every file, eliminating guesswork about whether a file was newly created, deleted, renamed, or modified.
  - **Security**: Ensures GitHub API tokens, internal headers, and rate-limit metadata are never leaked to the browser client.

---

## 9. GitHub API Integration

- **WHAT**: Dedicated service `github.service.js` with error normalization.
- **HOW**:
  - Sets required GitHub headers: `Accept: application/vnd.github.v3+json` and `User-Agent: FleetStudio-GitDiffViewer/1.0`.
  - Supports optional `GITHUB_TOKEN` from environment variables via `Authorization: Bearer <TOKEN>`.
  - Gracefully works without a token for public repositories.
  - Translates GitHub HTTP status codes into typed domain errors:
    - 404 $\rightarrow$ `NotFoundError` ("Repository or commit not found on GitHub")
    - 403 / 429 $\rightarrow$ `RateLimitError` ("GitHub API rate limit exceeded")
    - 5xx $\rightarrow$ `UpstreamError` ("Upstream GitHub API failure")
- **WHY**: Isolating external API calls into a single service allows centralized mocking in unit tests and consistent error handling across endpoints.

---

## 10. Diff Parsing Approach

- **WHAT**: Dedicated unified diff parsing engine in `server/src/utils/diff.parser.js`.
- **HOW**:
  - Regular expression parsing on hunk headers: `/^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@(.*)$/`.
  - Tracks running line counters: `currentBaseLine` and `currentHeadLine`.
  - Evaluates line prefixes:
    - `+`: Added line $\rightarrow$ `baseLineNumber: null`, `headLineNumber: currentHeadLine++`, `content: line`.
    - `-`: Deleted line $\rightarrow$ `baseLineNumber: currentBaseLine++`, `headLineNumber: null`, `content: line`.
    - ` ` or empty: Context line $\rightarrow$ `baseLineNumber: currentBaseLine++`, `headLineNumber: currentHeadLine++`, `content: line`.
    - `\`: Git metadata lines (e.g. `\ No newline at end of file`) are safely filtered out so line counters are not corrupted.
  - Returns `hunks: []` for files without patches (such as binary files or empty files).
- **WHY**:
  - Precision: Guarantees that neither line numbers nor diff prefixes are dropped or misaligned.
  - Compliant with the OpenAPI requirement: For lines that do not exist on one side, `null` is returned for that side.

---

## 11. Frontend Component Design & Visual Source-of-Truth Fidelity

- **WHAT**: Modular component hierarchy strictly adhering to the Figma visual design and PDF specifications:
  - `CommitPage`: Container fetching and managing state.
  - `CommitHeader`: Displays high-level commit information directly on the canvas without an enclosing card outline.
    - `AuthorInfo`: Avatar, subject, authored by, relative date, commit body.
    - `CommitMetadata`: Conditional committer row, full commit SHA, clickable parent SHA links.
  - `FileDiff`: Collapsible file container.
    - `FileHeader`: Pure link-style file path with toggle chevron directly on the page background.
    - `DiffHunk`: Hunk header row (`@@ ... @@`) with clean white background and `#B07BA9` typography.
    - `DiffLine`: 3-column row (Base line number, Head line number, Code).
  - `LoadingState`, `ErrorState`, `EmptyDiffState`: Contextual status screens.
- **HOW & WHY - Addressing File Status & Figma Visual Fidelity**:
  - **Removal of Simulated Browser "Secure" Search Bar**: In initial iterations, a simulated browser address bar (`.browser-location-bar` with a "Secure" padlock icon) was rendered on the page because it was visible at the top of the Figma frame screenshots. Following design review, this was recognized as Chrome's native browser window frame captured in the screenshot rather than an intentional UI component of the web app. It was completely removed, allowing the application content to start directly at the top of the viewport.
  - **Flat Details Section (No Card Outline or Shadow)**: In earlier revisions, `.commit-header` had a card border (`1px solid #E7EBF1`), white card background, and drop shadow. Comparing directly against the Figma visual truth (`media_1790620314010.png`), the commit details section sits directly on the light-blue `#F8FDFF` background canvas without any bounding card border, outline, or shadow. The `.commit-header` styling was updated to `background-color: transparent; border: none; box-shadow: none; padding: 0;`.
  - **Exact REM-Based Spacings from Figma Annotations**:
    - **Page Canvas Margins**: `2rem` top padding and `2rem` horizontal padding (`--spacing-rem-2`) on `.commit-page-content`.
    - **Details to First File Gap**: `2rem` (`--spacing-rem-2`) bottom margin on `.commit-header`.
    - **Author Avatar to Title Gap**: Exactly `0.5rem` (`--spacing-rem-05`) flex gap between the author's avatar and the title group.
    - **Commit Body Indentation**: Aligned with the title group below the avatar using `padding-left: calc(44px + 0.5rem)`.
    - **File Title to Code Box Margin**: Exactly `0.35rem` (`--spacing-rem-035`) margin between the file link and the code box border.
    - **Gap Between Changed Files**: Exactly `1.5rem` (`--spacing-rem-15`) flex gap between consecutive file diff cards in `.files-diff-list`.
  - **Figma Design Tokens & Typography**:
    - **Body & Header Typography**: Font `Arial, Helvetica, sans-serif` (`14px` body with `20px` line-height; `16px` header with `24px` line-height, bold).
    - **Monospace Code Typography**: `"Courier New", Courier, monospace`, `12px` bold for line numbers and code; `13px` bold for file links and parent commit hashes.
    - **Colors**:
      - Hunk headers (`code-secondary`): `#B07BA9` on white `#FFFFFF`.
      - Line numbers (`code-primary`): `#657082`.
      - Additions: `#D8FFCB` background.
      - Deletions: `#FFE4E9` background.
      - Canvas Background: `#F8FDFF`.
  - **Clean Line Number Columns**: Following the Figma design, the Base and Head line number columns do not have harsh vertical border lines between them, providing an unencumbered reading experience. Hunk headers also sit naturally on a white background with `#B07BA9` typography, exactly matching the Figma mockup.
  - **Full Support for File Status in Data Model**: The backend API contract and client data model fully support and track whether every file was `MODIFIED`, `ADDED`, `DELETED`, `RENAMED`, `COPIED`, or `TYPE_CHANGED`.
    - For `RENAMED` files, the UI displays `old-path → new-path`.
    - For `ADDED` files, `baseFile` is `null` and the diff lines display full green additions (`#D8FFCB`).
    - For `DELETED` files, `headFile` is `null` and the diff lines display full red deletions (`#FFE4E9`).
    - For `MODIFIED` files, both base and head files exist and hunks reflect modifications.
    - Should a product requirement later call for explicit badge labels (e.g. in a dashboard or pull-request view), the `changeKind` field is already first-class in the schema and can be surfaced without any backend modifications.

---

## 12. Responsive Design Decisions

- **WHAT**: Responsive CSS layout with fluid breakpoints at `768px` (tablets) and `480px` (mobile).
- **HOW**:
  - `commit-header`: Switches from horizontal flex (`row`) on desktop to vertical flex (`column`) on mobile.
  - `commit-metadata`: Stacks vertically, aligning commit SHA and parent links to the left on small screens.
  - Isolated horizontal scroll: `.diff-table-wrapper` has `overflow-x: auto` and `-webkit-overflow-scrolling: touch`. This ensures that wide lines of code can be scrolled horizontally **inside their respective file card without breaking the overall page layout or viewport width**.
  - Dual line number columns remain fixed in width and right-aligned, preserving code alignment.
- **WHY**: Mobile and tablet developers frequently inspect pull requests and commits on handheld devices. A non-wrapping, scrollable diff is essential to preserve indentation and syntax readability.

---

## 13. Error Handling

- **WHAT**: Multi-layered defense with user-friendly error feedback.
- **HOW**:
  1. **Validation Layer**: Rejects requests missing owner/repository or having non-hex/malformed SHAs immediately with HTTP 400 and structured JSON:
     ```json
     {
       "error": {
         "code": "INVALID_COMMIT_SHA",
         "message": "Commit SHA must be a 40-character hexadecimal value."
       }
     }
     ```
  2. **Upstream Service Layer**: Intercepts GitHub errors (404, 403, 429) and converts them into standardized domain exceptions.
  3. **Centralized Middleware**: Express `errorHandler` catches unhandled exceptions, ensures HTTP status codes match, and hides stack traces from production clients.
  4. **Frontend Error UI**: `ErrorState` inspects status codes and presents tailored advice (e.g. informing the user about GitHub rate limits or connection failures) along with a "Try Again" retry action.
- **WHY**: A system that fails gracefully with actionable advice instills trust in users and makes debugging effortless.

---

## 14. Security Decisions

- **WHAT**: Strict input validation, secret isolation, and CORS control.
- **HOW**:
  - **No Arbitrary Proxying**: The backend does NOT accept arbitrary URLs from the client. It only queries GitHub URLs constructed from validated `owner`, `repository`, and `oid` parameters.
  - **Credential Isolation**: `GITHUB_TOKEN` is loaded via `dotenv` on the server and is never passed to or exposed within the frontend bundle.
  - **Environment Hygiene**: `.env` is included in `.gitignore` while `.env.example` provides non-sensitive template configurations.
  - **XSS Prevention**: React automatically escapes text content. The code highlighting utility (`language.js`) escapes HTML characters before injecting syntax tokens.
- **WHY**: Protects API keys, shields against SSRF (Server-Side Request Forgery), and eliminates XSS vectors.

---

## 15. Rate-Limit Considerations

- **WHAT**: Proactive handling of GitHub's REST rate limits.
- **HOW**:
  - Unauthenticated requests to GitHub are limited to **60 requests per hour per IP address**.
  - Authenticated requests using a `GITHUB_TOKEN` provide **5,000 requests per hour**.
  - The backend inspects `x-ratelimit-remaining` headers from GitHub responses. When rate limits are exhausted, it throws `RateLimitError` (HTTP 429).
  - The client provides clear user instructions in the error state explaining how to configure a token.
- **WHY**: Prevents opaque 403 errors from breaking the user experience and provides a clear operational workaround.

---

## 16. Performance Considerations

- **WHAT**: Minimal network overhead, memoized rendering, and lightweight dependencies.
- **HOW**:
  - **Single GitHub Fetch**: The GitHub commit endpoint (`/repos/:owner/:repo/commits/:sha`) returns commit metadata, file changes, and patch text all in one request. I do not make secondary calls for individual file contents.
  - **Parallel Client Requests**: `CommitPage` requests the commit metadata and diff endpoints concurrently via `Promise.all`.
  - **Selective Memoization**: `DiffLine` is wrapped in `React.memo` to avoid re-rendering hundreds of unchanged diff rows when a user collapses an adjacent file.
  - **Fast Bundling**: Vite delivers near-instant HMR during development and tree-shaken minified production bundles (282 kB JS gzip 94 kB).
- **WHY**: Keeps the interface snappy and responsive even when loading commits with multiple files.

---

## 17. Testing Strategy

- **WHAT**: Comprehensive unit and integration test coverage across backend and frontend.
- **HOW**:
  - **Backend (Jest & Supertest - 26 tests)**:
    - `validation.middleware.test.js`: Validates 40-char hex SHA regex enforcement, missing parameters, and character filtering.
    - `diff.parser.test.js`: Validates added lines, deleted lines, context lines, multi-hunk parsing, empty patches, and `\ No newline` stripping.
    - `diff.mapper.test.js`: Validates mapping of all git file statuses (`ADDED`, `DELETED`, `MODIFIED`, `RENAMED`, `COPIED`) and binary file handling.
    - `commit.mapper.test.js`: Validates message splitting (subject vs body), author/committer signature mapping, and default avatar fallbacks.
    - `commit.api.test.js`: End-to-end route tests for HTTP 200, 400, 404, 429, and 404 route fallbacks.
  - **Frontend (Vitest & React Testing Library - 13 tests)**:
    - `CommitHeader.test.jsx`: Verifies metadata presentation, parent commit link routing, and committer conditionality.
    - `FileDiff.test.jsx`: Tests collapsible card toggling and empty/binary placeholders.
    - `DiffLine.test.jsx`: Tests visual distinctions and line number rendering.
    - `date.test.js`: Verifies relative time calculation.
    - `CommitPage.test.jsx`: Tests loading, success, and error state transitions.
- **WHY**: Ensures regression prevention, verifies OpenAPI schema compliance, and proves code reliability.

---

## 18. Known Limitations

1. **GitHub 300-File / 3,000-Line Limit**:
   GitHub's REST API commits endpoint truncates diffs for commits that modify more than 300 files or have diffs exceeding 3,000 lines. In such extreme commits, GitHub omits the `patch` attribute on truncated files. My application handles this gracefully by displaying "Binary or non-text change" instead of crashing.
2. **Binary Files**:
   Git does not generate text diffs for binary assets (images, compiled binaries, videos). My UI detects missing hunks and informs the user clearly.
3. **GitHub API Rate Limits for Anonymous Users**:
   Without a `GITHUB_TOKEN`, requests are limited to 60/hr. In high-traffic environments, a token is necessary.

---

## 19. Trade-offs

| Decision | Trade-Off Made | Rationale |
|---|---|---|
| **No Database** | No local persistence of viewed commits | Required by specification. Since commit data for a specific SHA is immutable, a production system could add Redis/SQLite, but for this assessment, keeping it stateless is clean and zero-config. |
| **Vanilla CSS over Tailwind/MUI** | Required writing explicit CSS rules and responsive media queries | Eliminates heavy third-party CSS dependencies, guarantees exact match with Figma design tokens, and keeps the build lightweight. |
| **Prism.js Client-Side Highlighting** | Adds ~40kB to bundle | Provides readable syntax coloring across 15+ languages without altering raw diff line semantics. |

---

## 20. What I Would Improve With More Time

1. **Redis / HTTP Caching for Immutable Commits**:
   - **WHAT**: In-memory or Redis caching layer on the Express backend.
   - **HOW**: Cache the mapped JSON response using the commit SHA as the key with an indefinite TTL.
   - **WHY**: A Git commit SHA is an immutable SHA-1/SHA-256 content digest. Once created, a commit's metadata and file diff never change. Caching commit responses would virtually eliminate GitHub rate-limit consumption for frequently viewed commits and deliver sub-millisecond response times.
2. **Split / Unified Diff Toggle**:
   - **WHAT**: UI switch allowing users to toggle between Unified Diff (single list) and Split Diff (side-by-side comparison).
   - **HOW**: Render a dual-pane table where base lines and head lines sit in parallel side-by-side cells.
   - **WHY**: Split diffs are preferred by many senior developers for reviewing complex refactors.
3. **File Tree / Jump to File Navigation**:
   - **WHAT**: A collapsible sidebar or sticky dropdown listing all changed files.
   - **HOW**: Clicking a file in the sidebar scrolls directly to the corresponding `FileDiff` card using anchor IDs.
   - **WHY**: Significantly improves navigation efficiency for large commits with dozens of changed files.
4. **Virtual Scrolling for Huge Diffs**:
   - **WHAT**: Implement windowing via `react-window` or `@tanstack/react-virtual`.
   - **HOW**: Only render diff lines currently visible within the browser viewport.
   - **WHY**: Prevents DOM node bloat and browser lag when inspecting massive commits with thousands of lines.

---

## 21. Summary of Verification

- **Backend Tests**: 5 test suites, 26 tests passed (100%).
- **Frontend Tests**: 5 test suites, 13 tests passed (100%).
- **End-to-End Test**: Live query to `http://localhost:1234/repositories/golemfactory/clay/commit/a1bf367b3af680b1182cc52bb77ba095764a11f9` successfully fetched, parsed, and displayed metadata and hunks from GitHub.
- **Production Bundle**: `npm run build` compiled client cleanly into `client/dist/` in 2.4s.
- **Package Archive**: `npm pack` dry-run verified lean 98.5 kB archive containing all source files and excluding `node_modules`.
