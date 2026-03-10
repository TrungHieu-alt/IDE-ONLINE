# ENTITY RELATIONSHIP DIAGRAM
## Online Code Editor Platform

**Version:** 2.0  
**Date:** March 2026  
**Status:** Ready for Review

---

## 1. ER DIAGRAM

```mermaid
erDiagram
    users ||--o{ submissions : "submits"
    users ||--o{ sessions : "creates (as coder)"
    users ||--o{ session_viewers : "joins (as viewer)"
    questions ||--o{ test_cases : "has"
    questions ||--o{ submissions : "receives"
    submissions ||--o{ execution_results : "contains"
    test_cases ||--o{ execution_results : "evaluated in"
    sessions ||--o{ session_viewers : "has"
    sessions }o--|| users : "hosted by"
    sessions }o--o| questions : "optionally linked to"

    users {
        uuid id PK
        varchar email UK "NOT NULL, lowercase, unique"
        varchar password_hash "NOT NULL, bcrypt"
        varchar display_name "max 50 chars"
        enum role "ADMIN | CODER | VIEWER, default CODER"
        boolean is_verified "default false"
        varchar verification_token "nullable"
        timestamp verification_expires_at "nullable"
        boolean is_active "default true"
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    questions {
        uuid id PK
        varchar title "NOT NULL, 5-200 chars"
        text description "NOT NULL, markdown, max 5000 chars, includes sample I/O"
        enum difficulty "EASY | MEDIUM | HARD"
        integer time_limit "1-10 seconds, default 1"
        integer memory_limit "32-256 MB, default 64"
        boolean is_published "default false"
        uuid created_by FK "→ users.id"
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    test_cases {
        uuid id PK
        uuid question_id FK "→ questions.id, NOT NULL"
        text input "NOT NULL, max 10000 chars"
        text expected_output "NOT NULL, max 10000 chars"
        boolean is_hidden "default false"
        integer display_order "for sorting"
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    submissions {
        uuid id PK
        uuid user_id FK "→ users.id, NOT NULL"
        uuid question_id FK "→ questions.id, nullable (null for free run, ON DELETE SET NULL)"
        enum type "RUN | SUBMIT"
        text source_code "NOT NULL, max 1MB"
        integer language_id "NOT NULL, Judge0 language ID"
        enum overall_status "PENDING | ACCEPTED | WRONG_ANSWER | COMPILATION_ERROR | RUNTIME_ERROR | TIME_LIMIT_EXCEEDED | MEMORY_LIMIT_EXCEEDED | SYSTEM_ERROR"
        integer passed_count "nullable, for SUBMIT type"
        integer total_count "nullable, for SUBMIT type"
        timestamp created_at "NOT NULL"
    }

    execution_results {
        uuid id PK
        uuid submission_id FK "→ submissions.id, NOT NULL"
        uuid test_case_id FK "→ test_cases.id, nullable (null for free run)"
        text stdin "nullable, custom input for free run"
        text stdout "nullable"
        text stderr "nullable"
        enum status "PENDING | ACCEPTED | WRONG_ANSWER | COMPILATION_ERROR | RUNTIME_ERROR | TIME_LIMIT_EXCEEDED | MEMORY_LIMIT_EXCEEDED | SYSTEM_ERROR"
        decimal execution_time "seconds, nullable"
        decimal memory_used "MB, nullable"
        varchar judge0_token "Judge0 submission token"
        timestamp created_at "NOT NULL"
    }

    sessions {
        uuid id PK
        uuid coder_id FK "→ users.id, NOT NULL"
        uuid question_id FK "→ questions.id, nullable"
        enum status "ACTIVE | CLOSED"
        text current_code "latest code snapshot"
        integer current_language_id "current language"
        timestamp created_at "NOT NULL"
        timestamp ended_at "nullable"
    }

    session_viewers {
        uuid id PK
        uuid session_id FK "→ sessions.id, NOT NULL"
        uuid user_id FK "→ users.id, NOT NULL"
        timestamp joined_at "NOT NULL"
        timestamp left_at "nullable"
    }
```

---

## 2. TABLE DEFINITIONS

### 2.1 `users`

Stores all registered accounts. Role determines access level across the platform.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, default gen_random_uuid() | Primary key |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Normalized to lowercase |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash (salt rounds ≥ 10) |
| `display_name` | VARCHAR(50) | nullable | Display name |
| `role` | ENUM | NOT NULL, default `'CODER'` | `ADMIN` \| `CODER` \| `VIEWER` |
| `is_verified` | BOOLEAN | NOT NULL, default `false` | Email verification status |
| `verification_token` | VARCHAR(255) | nullable | Token for email verification |
| `verification_expires_at` | TIMESTAMP | nullable | Token expiry (24h from creation) |
| `is_active` | BOOLEAN | NOT NULL, default `true` | Account lock status |
| `created_at` | TIMESTAMP | NOT NULL, default NOW() | Registration time |
| `updated_at` | TIMESTAMP | NOT NULL, default NOW() | Last profile update |

**Indexes:**
- `UNIQUE INDEX idx_users_email ON users(email)`
- `INDEX idx_users_role ON users(role)`
- `INDEX idx_users_verification_token ON users(verification_token)` — for email verification lookup

**User Story Mapping:** US01, US02, US03

---

### 2.2 `questions`

Admin-managed coding problems. Only `is_published = true` questions are visible to Coder/Viewer.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `title` | VARCHAR(200) | NOT NULL | Question title (5-200 chars) |
| `description` | TEXT | NOT NULL | Markdown body (max 5000 chars). Includes sample input/output embedded as markdown code blocks |
| `difficulty` | ENUM | NOT NULL | `EASY` \| `MEDIUM` \| `HARD` |
| `time_limit` | INTEGER | NOT NULL, default `1` | Seconds (1-10) |
| `memory_limit` | INTEGER | NOT NULL, default `64` | MB (32-256) |
| `is_published` | BOOLEAN | NOT NULL, default `false` | Visibility flag |
| `created_by` | UUID | FK → users.id | Author (admin) |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last edit time |

**Indexes:**
- `INDEX idx_questions_published ON questions(is_published)`
- `INDEX idx_questions_difficulty ON questions(difficulty)`

**User Story Mapping:** US10

---

### 2.3 `test_cases`

Input/output pairs for auto-grading. Hidden test cases are used for grading but their expected output is never exposed to Coder/Viewer.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `question_id` | UUID | FK → questions.id, NOT NULL, ON DELETE CASCADE | Parent question |
| `input` | TEXT | NOT NULL | Test input (max 10,000 chars) |
| `expected_output` | TEXT | NOT NULL | Expected output (max 10,000 chars) |
| `is_hidden` | BOOLEAN | NOT NULL, default `false` | If true, output hidden from coder |
| `display_order` | INTEGER | NOT NULL, default `0` | Sort order |
| `created_at` | TIMESTAMP | NOT NULL | Creation time |
| `updated_at` | TIMESTAMP | NOT NULL | Last edit time |

**Indexes:**
- `INDEX idx_test_cases_question ON test_cases(question_id)`

**Constraints:**
- ON DELETE CASCADE from `questions` — deleting a question removes all its test cases

**User Story Mapping:** US11

---

### 2.4 `submissions`

The **parent record** for both free runs and graded submits. Stores the source code **once**.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `user_id` | UUID | FK → users.id, NOT NULL | Who submitted |
| `question_id` | UUID | FK → questions.id, nullable, ON DELETE SET NULL | NULL for free run, set for submit |
| `type` | ENUM | NOT NULL | `RUN` \| `SUBMIT` |
| `source_code` | TEXT | NOT NULL | Code snapshot (max 1MB) |
| `language_id` | INTEGER | NOT NULL | Judge0 language ID |
| `overall_status` | ENUM | NOT NULL, default `'PENDING'` | Aggregated status |
| `passed_count` | INTEGER | nullable | Test cases passed (SUBMIT only) |
| `total_count` | INTEGER | nullable | Total test cases (SUBMIT only) |
| `created_at` | TIMESTAMP | NOT NULL | Submission time |

**Enums for `overall_status`:**

| Value | Meaning |
|-------|---------|
| `PENDING` | Queued / executing |
| `ACCEPTED` | All test cases passed (or run output received) |
| `WRONG_ANSWER` | Some test cases failed |
| `COMPILATION_ERROR` | Code failed to compile |
| `RUNTIME_ERROR` | Runtime crash (segfault, etc.) |
| `TIME_LIMIT_EXCEEDED` | Exceeded time limit |
| `MEMORY_LIMIT_EXCEEDED` | Exceeded memory limit |
| `SYSTEM_ERROR` | Judge0 down / internal error |

**Indexes:**
- `INDEX idx_submissions_user ON submissions(user_id, created_at DESC)` — user history listing
- `INDEX idx_submissions_question ON submissions(question_id)` — filter by question
- `INDEX idx_submissions_status ON submissions(overall_status)` — filter by status
- `INDEX idx_submissions_type ON submissions(type)` — separate RUN vs SUBMIT queries

**How it works:**

| Scenario | `type` | `question_id` | `passed_count` / `total_count` | `execution_results` count |
|----------|--------|---------------|-------------------------------|--------------------------|
| User clicks **Run** with custom input | `RUN` | `NULL` | `NULL` / `NULL` | **1** (custom stdin) |
| User clicks **Run** on a question page | `RUN` | set (optional) | `NULL` / `NULL` | **1** (custom stdin) |
| User clicks **Submit** against question | `SUBMIT` | set (required) | e.g. `5` / `8` | **N** (1 per test case) |

**User Story Mapping:** US06, US09, US12

---

### 2.5 `execution_results`

Individual execution results. One row per run against custom input or per test case.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `submission_id` | UUID | FK → submissions.id, NOT NULL, ON DELETE CASCADE | Parent submission |
| `test_case_id` | UUID | FK → test_cases.id, nullable | NULL for free run (custom input) |
| `stdin` | TEXT | nullable | Custom input (free run only, max 100KB) |
| `stdout` | TEXT | nullable | Program output (max 100KB) |
| `stderr` | TEXT | nullable | Error output |
| `status` | ENUM | NOT NULL, default `'PENDING'` | Same enum as `overall_status` |
| `execution_time` | DECIMAL(10,4) | nullable | Seconds |
| `memory_used` | DECIMAL(10,2) | nullable | MB |
| `judge0_token` | VARCHAR(255) | nullable | Judge0 submission token for polling |
| `created_at` | TIMESTAMP | NOT NULL | Execution time |

**Indexes:**
- `INDEX idx_exec_results_submission ON execution_results(submission_id)`
- `INDEX idx_exec_results_test_case ON execution_results(test_case_id)`

**Relationship Rules:**
- If `type = RUN` → exactly **1** execution_result with `test_case_id = NULL`, `stdin = custom input`
- If `type = SUBMIT` → **N** execution_results with `test_case_id = set`, `stdin = NULL` (input comes from test_case)

**User Story Mapping:** US06, US07, US12, US12.1

---

### 2.6 `sessions`

Realtime coding sessions. Coder creates, Viewers join. Stores latest code snapshot for late-joining viewers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Session ID (shared as join link) |
| `coder_id` | UUID | FK → users.id, NOT NULL | Session host |
| `question_id` | UUID | FK → questions.id, nullable | Linked question (optional) |
| `status` | ENUM | NOT NULL, default `'ACTIVE'` | `ACTIVE` \| `CLOSED` |
| `current_code` | TEXT | nullable | Latest code snapshot for sync |
| `current_language_id` | INTEGER | nullable | Current language in editor |
| `created_at` | TIMESTAMP | NOT NULL | Session start |
| `ended_at` | TIMESTAMP | nullable | Session end (when closed) |

**Indexes:**
- `INDEX idx_sessions_coder ON sessions(coder_id)`
- `INDEX idx_sessions_status ON sessions(status)`

**Lifecycle:**
1. Coder creates → `status = ACTIVE`
2. Viewers join via link
3. Coder disconnects → auto-close after 5 min idle
4. Coder clicks "End Session" → `status = CLOSED`, `ended_at = NOW()`

**User Story Mapping:** US14

---

### 2.7 `session_viewers`

Join table tracking which viewers are/were in a session. Supports viewer count and history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `session_id` | UUID | FK → sessions.id, NOT NULL, ON DELETE CASCADE | Session |
| `user_id` | UUID | FK → users.id, NOT NULL | Viewer |
| `joined_at` | TIMESTAMP | NOT NULL | When viewer joined |
| `left_at` | TIMESTAMP | nullable | When viewer left (NULL = still watching) |

**Indexes:**
- `UNIQUE INDEX idx_session_viewer ON session_viewers(session_id, user_id)` — prevent duplicate join records
- `INDEX idx_session_viewers_session ON session_viewers(session_id)`

**User Story Mapping:** US14.1

---

## 3. LANGUAGE ID MAPPING (Reference)

Reference table for the `language_id` field (not stored in DB — hardcoded/config):

| Language | Judge0 ID |
|----------|-----------|
| C | 50 |
| C++ | 54 |
| C# | 51 |
| Java | 62 |
| JavaScript | 63 |
| TypeScript | 74 |
| Python | 71 |
| PHP | 68 |
| Dart | 90 |

---

## 4. KEY DESIGN DECISIONS

### 4.1 Why `submissions` + `execution_results` (not a single flat table)?

| Concern | Single Table | Two Tables (chosen) |
|---------|-------------|-------------------|
| Code duplication | Code stored N times (once per test case) | Code stored **once** in `submissions` |
| Free run vs submit | Awkward `type` field with many nullable columns | Clean separation: `RUN` has 1 result, `SUBMIT` has N |
| History query | Need GROUP BY to aggregate | Simple query on `submissions` table |
| Detail view | Already have everything | JOIN to `execution_results` when needed |

### 4.2 Why `question_id` is nullable on `submissions`?

A free **Run** doesn't require a question — the user just wants to test code with custom input. Making `question_id` nullable allows:
- Free run from the editor (no question context)
- Free run on a question page (question_id set for reference, but not graded)
- Submit always requires question_id

### 4.3 Why `stdin` is on `execution_results` (not `submissions`)?

For a **Run**, the custom input belongs to the individual execution. For a **Submit**, each test case has its own input (from `test_cases.input`). Keeping `stdin` on `execution_results` makes both cases consistent.

### 4.4 Why `current_code` on `sessions`?

When a viewer joins late, they need the latest code snapshot. Instead of replaying all WebSocket events, the server stores the latest snapshot in `sessions.current_code` and sends it on join.

---

## 5. EXAMPLE DATA FLOWS

### Flow 1: Free Run (Click "Run")
```
1. INSERT submissions (type=RUN, question_id=NULL, source_code=..., language_id=71)
2. Send to Judge0 → get token
3. INSERT execution_results (submission_id=..., test_case_id=NULL, stdin="5 10", judge0_token=...)
4. Poll Judge0 → get result
5. UPDATE execution_results (stdout="15", status=ACCEPTED, execution_time=0.05)
6. UPDATE submissions (overall_status=ACCEPTED)
```

### Flow 2: Submit (Click "Submit")
```
1. INSERT submissions (type=SUBMIT, question_id=q1, source_code=..., language_id=71)
2. Fetch test_cases WHERE question_id=q1 → [tc1, tc2, tc3, tc4, tc5]
3. For EACH test case:
   a. Send to Judge0 (stdin = test_case.input) → get token
   b. INSERT execution_results (submission_id=..., test_case_id=tc.id, judge0_token=...)
4. Poll Judge0 for all tokens → get results
5. UPDATE each execution_results (stdout, status, time, memory)
6. Compare: actual_output vs test_case.expected_output
7. Aggregate: passed_count=4, total_count=5
8. UPDATE submissions (overall_status=WRONG_ANSWER, passed_count=4, total_count=5)
```

---

**Document Owner:** Project Team  
**Last Updated:** March 2026  
**Review Date:** TBD
