# API SPECIFICATION

**Base URL:** `/api`  
**Auth:** Bearer access token (JWT). Refresh token handled via dedicated auth endpoints.  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Conventions & Common Patterns](#1-conventions--common-patterns)
2. [Authentication](#2-authentication)
3. [User Profile](#3-user-profile)
4. [Admin — User Management](#4-admin--user-management)
5. [Questions](#5-questions)
6. [Test Cases](#6-test-cases)
7. [Code Execution](#7-code-execution)
8. [Submissions & History](#8-submissions--history)
9. [Sessions (Realtime)](#9-sessions-realtime)
10. [WebSocket Events](#10-websocket-events)
11. [Internal - Judge0 Callback](#11-internal---judge0-callback)

---

## 1. Conventions & Common Patterns

### Authentication Header

All protected endpoints require:
```
Authorization: Bearer <access_token>
```
Public endpoints are marked with 🔓. All others require 🔒.

### Protected-Route Auth Validation

For every protected request, auth middleware must:
1. Verify access token signature and expiry
2. Load current user auth state (`is_active`, `deleted_at`, `auth_version`) from DB or a trusted cache backed by DB
3. Reject if user is locked, soft-deleted, or token `auth_version` does not match the current stored value

This makes role changes, password changes, and account deactivation effective immediately.

### Pagination

Query params for paginated endpoints:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | `1` | Page number (1-indexed) |
| `limit` | integer | `20` | Items per page (max 100) |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | `asc` or `desc` |

Paginated response wrapper:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 150,
    "total_pages": 8
  }
}
```

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  },
  "request_id": "req_abc123xyz789"
}
```

### Common Error Codes

| HTTP Status | Code | Meaning |
|-------------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid input |
| 401 | `UNAUTHORIZED` | Not logged in / token expired |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate resource |
| 422 | `UNPROCESSABLE_ENTITY` | Business rule violated |
| 429 | `TOO_MANY_REQUESTS` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Judge0 / external service down |

### Role Legend

| Role | Description |
|------|-------------|
| `ADMIN` | Full system access |
| `USER` | Standard product user: write code, run, submit, create/join sessions |

### Language ID Mapping

| Language | `language_id` |
|----------|---------------|
| C | 50 |
| C# | 51 |
| C++ | 54 |
| Java | 62 |
| JavaScript | 63 |
| PHP | 68 |
| Python | 71 |
| TypeScript | 74 |
| Dart | 90 |

---

## 2. Authentication

### 2.1 Register

🔓 **Public**

```
POST /api/auth/register
```

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | ✅ | Valid email format, unique |
| `password` | string | ✅ | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char |
| `display_name` | string | ❌ | Max 50 chars |

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1",
  "display_name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "USER",
    "created_at": "2025-03-10T12:00:00Z"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Invalid email or weak password |
| 409 | `EMAIL_EXISTS` | Email already registered |

**Notes:**
- Email normalized to lowercase before saving
- Password hashed with bcrypt (salt rounds ≥ 10)
- Verification email sent with 24h token
- Default role: `USER`

**User Story:** US01

---

### 2.2 Verify Email

🔓 **Public**

```
GET /api/auth/verify?token=<verification_token>
```

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `token` | string | ✅ | Verification token from email |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 400 | `INVALID_TOKEN` | Token malformed |
| 410 | `TOKEN_EXPIRED` | Token older than 24h |

**User Story:** US01

---

### 2.3 Resend Verification Email

🔓 **Public**

```
POST /api/auth/resend-verification
```

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | ✅ |

```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Verification email sent"
  }
}
```

**Notes:**
- Always returns 200 even if email doesn't exist (prevent enumeration)
- Rate limited: max 3 requests per 15 minutes per email

**User Story:** US01

---

### 2.4 Login

🔓 **Public**

```
POST /api/auth/login
```

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | ✅ |
| `password` | string | ✅ |

```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "rft_opaque_token_here",
    "token_type": "Bearer",
    "expires_in": 900,
    "refresh_expires_in": 2592000,
    "user": {
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "display_name": "John Doe",
      "role": "USER"
    }
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 403 | `EMAIL_NOT_VERIFIED` | Account not verified yet |
| 403 | `ACCOUNT_LOCKED` | Account deactivated by admin |
| 429 | `TOO_MANY_REQUESTS` | 5+ failed attempts in 5 min |

**Notes:**
- Does NOT reveal if email exists (same error for wrong email / wrong password)
- Access token payload: `{ user_id, email, role, auth_version, iat, exp }`
- Access token expiry: 15 minutes
- Refresh token expiry: 30 days
- Refresh token is rotated on every successful refresh
- Rate limit: max 5 failed attempts per 5 minutes per IP

**User Story:** US02

---

### 2.5 Refresh Access Token

🔓 **Public**

```
POST /api/auth/refresh
```

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `refresh_token` | string | ✅ |

```json
{
  "refresh_token": "rft_opaque_token_here"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "rft_rotated_token_here",
    "token_type": "Bearer",
    "expires_in": 900,
    "refresh_expires_in": 2592000
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 401 | `INVALID_REFRESH_TOKEN` | Token invalid, revoked, or expired |
| 403 | `ACCOUNT_LOCKED` | Account disabled |

**Notes:**
- Refresh token rotation invalidates the previous token after use
- Calling `/api/auth/refresh` is allowed even if the caller's current access token has not expired yet; the endpoint decision is based only on the refresh token state
- If refresh token reuse is detected, all active refresh tokens for that user are revoked
- Refresh handler also checks current user `auth_version`, `is_active`, and `deleted_at`

**User Story:** US02

---

### 2.6 Logout

🔒 **All Roles**

```
POST /api/auth/logout
```

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `refresh_token` | string | ✅ |

```json
{
  "refresh_token": "rft_rotated_token_here"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Notes:**
- Revokes the provided refresh token
- Frontend should also discard the current access token

**User Story:** US02

---

## 3. User Profile

### 3.1 Get My Profile

🔒 **All Roles**

```
GET /api/me
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "display_name": "John Doe",
    "role": "USER",
    "is_verified": true,
    "created_at": "2025-03-10T12:00:00Z",
    "updated_at": "2025-03-10T12:00:00Z"
  }
}
```

**User Story:** US01

---

### 3.2 Update My Profile

🔒 **All Roles**

```
PATCH /api/me
```

**Request Body:** (all fields optional)

| Field | Type | Validation |
|-------|------|------------|
| `display_name` | string | Max 50 chars |
| `current_password` | string | Required if `new_password` is provided |
| `new_password` | string | Same rules as register |

```json
{
  "display_name": "Jane Doe"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-...",
    "email": "user@example.com",
    "display_name": "Jane Doe",
    "role": "USER",
    "updated_at": "2025-03-10T13:00:00Z"
  }
}
```

**Notes:**
- Cannot change email or role through this endpoint
- Password change requires current password verification
- Successful password change increments `auth_version` and revokes all active refresh tokens for the user

**User Story:** US01

---

## 4. Admin — User Management

### 4.1 List All Users

🔒 **Admin**

```
GET /api/admin/users
```

**Query Params:** Standard pagination + filters

| Param | Type | Description |
|-------|------|-------------|
| `role` | string | Filter by role: `ADMIN`, `USER` |
| `search` | string | Search by email or display_name |
| `is_active` | boolean | Filter by account status |

**Response:** `200 OK` (paginated)
```json
{
  "success": true,
  "data": [
    {
      "user_id": "550e8400-...",
      "email": "user@example.com",
      "display_name": "John Doe",
      "role": "USER",
      "is_verified": true,
      "is_active": true,
      "created_at": "2025-03-10T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 45,
    "total_pages": 3
  }
}
```

**User Story:** US03

---

### 4.2 Assign Role

🔒 **Admin**

```
PATCH /api/admin/users/:user_id/role
```

**Path Params:**

| Param | Type | Description |
|-------|------|-------------|
| `user_id` | UUID | Target user ID |

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `role` | string | ✅ | `ADMIN` \| `USER` |

```json
{
  "role": "USER"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-...",
    "email": "user@example.com",
    "role": "USER",
    "updated_at": "2025-03-10T13:00:00Z"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 404 | `USER_NOT_FOUND` | User ID doesn't exist |
| 422 | `CANNOT_DEMOTE_SELF` | Admin trying to remove own admin role |

**Notes:**
- Changing role increments the user's `auth_version`
- Existing refresh tokens for that user are revoked so permissions take effect immediately

**User Story:** US03

---

### 4.3 Toggle Account Status (Lock/Unlock)

🔒 **Admin**

```
PATCH /api/admin/users/:user_id/status
```

**Request Body:**

| Field | Type | Required |
|-------|------|----------|
| `is_active` | boolean | ✅ |

```json
{
  "is_active": false
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user_id": "550e8400-...",
    "is_active": false,
    "updated_at": "2025-03-10T13:00:00Z"
  }
}
```

**Notes:**
- Locking an account revokes all active refresh tokens for that user
- Access tokens become invalid after the next auth check because `auth_version` changes

**User Story:** US03

---

### 4.4 Delete User

🔒 **Admin**

```
DELETE /api/admin/users/:user_id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "User deleted successfully"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 404 | `USER_NOT_FOUND` | User ID doesn't exist |
| 422 | `CANNOT_DELETE_SELF` | Admin trying to delete own account |

**Notes:**
- This endpoint performs a logical delete: sets `deleted_at`, sets `is_active=false`, increments `auth_version`, and revokes all active refresh tokens
- Historical submissions, authored questions, and session history remain intact
- Active sessions owned by the deleted user must be closed immediately by the backend

**User Story:** US03

---

## 5. Questions

### 5.1 List Questions

🔒 **All Roles**

```
GET /api/questions
```

**Query Params:** Standard pagination + filters

| Param | Type | Description |
|-------|------|-------------|
| `difficulty` | string | `EASY`, `MEDIUM`, `HARD` |
| `search` | string | Search by title |

**Notes:**
- User/Admin joiners: only see `is_published = true` outside admin endpoints
- Admin: sees all questions (published + unpublished)

**Response:** `200 OK` (paginated)
```json
{
  "success": true,
  "data": [
    {
      "question_id": "a1b2c3d4-...",
      "title": "Two Sum",
      "difficulty": "EASY",
      "is_published": true,
      "created_at": "2025-03-10T12:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

**User Story:** US10

---

### 5.2 Get Question Detail

🔒 **All Roles**

```
GET /api/questions/:question_id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "question_id": "a1b2c3d4-...",
    "title": "Two Sum",
    "description": "## Problem\nGiven two integers...\n\n## Example 1\n**Input:** `5 10`\n**Output:** `15`",
    "difficulty": "EASY",
    "time_limit": 1,
    "memory_limit": 64,
    "is_published": true,
    "created_by": "admin-uuid-...",
    "created_at": "2025-03-10T12:00:00Z"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 404 | `QUESTION_NOT_FOUND` | ID doesn't exist or unpublished (for non-admin) |

**User Story:** US10

---

### 5.3 Create Question

🔒 **Admin**

```
POST /api/admin/questions
```

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | ✅ | 5-200 chars |
| `description` | string | ✅ | Markdown, max 5000 chars |
| `difficulty` | string | ✅ | `EASY` \| `MEDIUM` \| `HARD` |
| `time_limit` | integer | ❌ | 1-10, default 1 |
| `memory_limit` | integer | ❌ | 32-256, default 64 |

```json
{
  "title": "Two Sum",
  "description": "## Problem\nGiven two integers...\n\n## Example 1\n**Input:** `5 10`\n**Output:** `15`",
  "difficulty": "EASY",
  "time_limit": 2,
  "memory_limit": 128
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "question_id": "a1b2c3d4-...",
    "title": "Two Sum",
    "difficulty": "EASY",
    "is_published": false,
    "created_at": "2025-03-10T12:00:00Z"
  }
}
```

**Notes:**
- Always created with `is_published: false`
- Admin must explicitly publish via update

**User Story:** US10

---

### 5.4 Update Question

🔒 **Admin**

```
PUT /api/admin/questions/:question_id
```

**Request Body:** Same fields as create (all optional) + additional:

| Field | Type | Description |
|-------|------|-------------|
| `is_published` | boolean | Publish/unpublish |

```json
{
  "is_published": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "question_id": "a1b2c3d4-...",
    "title": "Two Sum",
    "is_published": true,
    "updated_at": "2025-03-10T13:00:00Z"
  }
}
```

**User Story:** US10

---

### 5.5 Delete Question

🔒 **Admin**

```
DELETE /api/admin/questions/:question_id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Question deleted successfully"
  }
}
```

**Notes:**
- CASCADE deletes all related test_cases
- If submissions exist referencing this question, `question_id` is set to `NULL` (keep submission records for history)

**User Story:** US10

---

## 6. Test Cases

### 6.1 List Test Cases (Public — for Users)

🔒 **All Roles**

```
GET /api/questions/:question_id/test_cases
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "test_case_id": "tc-uuid-1",
      "input": "5 10",
      "expected_output": "15",
      "is_hidden": false,
      "display_order": 1
    },
    {
      "test_case_id": "tc-uuid-2",
      "input": "[hidden]",
      "expected_output": "[hidden]",
      "is_hidden": true,
      "display_order": 2
    }
  ]
}
```

**Notes:**
- Hidden test cases: `input` and `expected_output` are masked as `"[hidden]"`
- Only shows existence + order (so user knows how many hidden tests exist)

**User Story:** US11

---

### 6.2 List Test Cases (Admin — full access)

🔒 **Admin**

```
GET /api/admin/questions/:question_id/test_cases
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "test_case_id": "tc-uuid-1",
      "input": "5 10",
      "expected_output": "15",
      "is_hidden": false,
      "display_order": 1
    },
    {
      "test_case_id": "tc-uuid-2",
      "input": "100 200",
      "expected_output": "300",
      "is_hidden": true,
      "display_order": 2
    }
  ]
}
```

**Notes:**
- Exposes full input/output for ALL test cases (including hidden)

**User Story:** US11

---

### 6.3 Create Test Case

🔒 **Admin**

```
POST /api/admin/questions/:question_id/test_cases
```

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `input` | string | ✅ | Max 10,000 chars |
| `expected_output` | string | ✅ | Max 10,000 chars |
| `is_hidden` | boolean | ❌ | Default `false` |
| `display_order` | integer | ❌ | Default `0` |

```json
{
  "input": "5 10",
  "expected_output": "15",
  "is_hidden": false,
  "display_order": 1
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "test_case_id": "tc-uuid-...",
    "question_id": "a1b2c3d4-...",
    "is_hidden": false,
    "display_order": 1,
    "created_at": "2025-03-10T12:00:00Z"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 404 | `QUESTION_NOT_FOUND` | Question ID doesn't exist |

**User Story:** US11

---

### 6.4 Update Test Case

🔒 **Admin**

```
PUT /api/admin/test_cases/:test_case_id
```

**Request Body:** Same as create (all optional)

**Response:** `200 OK`

**User Story:** US11

---

### 6.5 Delete Test Case

🔒 **Admin**

```
DELETE /api/admin/test_cases/:test_case_id
```

**Response:** `200 OK`

**User Story:** US11

---

## 7. Code Execution

### 7.1 Run Code (Free Run)

🔒 **User, Admin**

```
POST /api/submissions/run
```

**Description:** Execute code with custom input. No grading. Results not counted as formal submission against a question. Execution is asynchronous.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `source_code` | string | ✅ | Max 1MB |
| `language_id` | integer | ✅ | Must be valid Judge0 ID |
| `stdin` | string | ❌ | Custom input, max 100KB |

```json
{
  "source_code": "a, b = map(int, input().split())\nprint(a + b)",
  "language_id": 71,
  "stdin": "5 10"
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "submission_id": "sub-uuid-...",
    "type": "RUN",
    "status": "PENDING",
    "ws_event": "execution_completed"
  }
}
```

**HTTP Errors:**

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Empty code, invalid language_id |
| 409 | `SUBMISSION_ALREADY_PENDING` | User already has a `PENDING` run/submit in progress |
| 429 | `TOO_MANY_REQUESTS` | Per-user/IP run quota exceeded |
| 503 | `JUDGE0_UNAVAILABLE` | Judge0 down after 3 retries |

**Notes:**
- Creates a `submissions` record (type=RUN) + 1 `execution_results` record
- Per-user concurrency guard is server-side: only 1 `PENDING` submission (`RUN` or `SUBMIT`) is allowed per user at a time
- Judge0 constraints: wall-time 10s, memory 256MB, output 100KB
- Client receives final result via WebSocket event `execution_completed`
- Rate limit: `30` requests / minute / authenticated user and `60` requests / minute / IP

**User Story:** US06, US07

---

### 7.2 Submit Code (Auto-Grade)

🔒 **User, Admin**

```
POST /api/submissions/submit
```

**Description:** Submit code against a question. Runs all test cases (public + hidden), compares output, and returns aggregated result asynchronously.

**Request Body:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `question_id` | UUID | ✅ | Must exist and be published |
| `source_code` | string | ✅ | Max 1MB |
| `language_id` | integer | ✅ | Must be valid Judge0 ID |

```json
{
  "question_id": "a1b2c3d4-...",
  "source_code": "a, b = map(int, input().split())\nprint(a + b)",
  "language_id": 71
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "submission_id": "sub-uuid-...",
    "type": "SUBMIT",
    "overall_status": "PENDING",
    "ws_events": ["grading_progress", "grading_completed"]
  }
}
```

**Notes on hidden test cases:**
- `status` is always visible (ACCEPTED / WRONG_ANSWER / etc.)
- `expected_output` and `actual_output` are masked as `"[hidden]"`
- User can see pass/fail but NOT the actual test data

**Overall status determination:**

| Condition | `overall_status` |
|-----------|-----------------|
| All test cases pass | `ACCEPTED` |
| Any compile error | `COMPILATION_ERROR` |
| Any runtime error | `RUNTIME_ERROR` |
| Any timeout | `TIME_LIMIT_EXCEEDED` |
| Any memory limit exceeded (and no higher-priority error) | `MEMORY_LIMIT_EXCEEDED` |
| Some wrong output | `WRONG_ANSWER` |

Priority: COMPILATION_ERROR > RUNTIME_ERROR > TIME_LIMIT_EXCEEDED > MEMORY_LIMIT_EXCEEDED > WRONG_ANSWER > ACCEPTED

**HTTP Errors:**

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Empty code, invalid language_id |
| 404 | `QUESTION_NOT_FOUND` | Question doesn't exist or unpublished |
| 409 | `SUBMISSION_ALREADY_PENDING` | User already has a `PENDING` run/submit in progress |
| 422 | `NO_TEST_CASES` | Question has no test cases |
| 429 | `TOO_MANY_REQUESTS` | Per-user/IP submit quota exceeded |
| 503 | `JUDGE0_UNAVAILABLE` | Judge0 down |

**Notes:**
- Creates 1 `submissions` record (type=SUBMIT) + N `execution_results` records
- Uses question's `time_limit` and `memory_limit` (not global defaults)
- Output comparison: trim trailing whitespace/newlines
- Client receives progress via `grading_progress` and final detail via `grading_completed`
- Submission stores question/test snapshots so old history remains stable after content edits or deletes
- Rate limit: `10` requests / minute / authenticated user and `20` requests / minute / IP

**User Story:** US12, US12.1

## 8. Submissions & History

### 8.1 List My Submissions

🔒 **User**

```
GET /api/submissions
```

**Query Params:** Standard pagination + filters

| Param | Type | Description |
|-------|------|-------------|
| `question_id` | UUID | Filter by question |
| `type` | string | `RUN` or `SUBMIT` |
| `status` | string | Filter by overall_status |
| `search` | string | Search by question title |

**Response:** `200 OK` (paginated)
```json
{
  "success": true,
  "data": [
    {
      "submission_id": "sub-uuid-...",
      "type": "SUBMIT",
      "question": {
        "question_id": "a1b2c3d4-...",
        "title": "Two Sum"
      },
      "language_id": 71,
      "overall_status": "ACCEPTED",
      "passed_count": 8,
      "total_count": 8,
      "created_at": "2025-03-10T12:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

**Notes:**
- Only returns current user's submissions
- Returns both `RUN` and `SUBMIT`; callers can filter by `type`
- Default sort: `created_at DESC` (newest first)
- `question` is null for free runs without question context
- If the original question was later deleted, `question.title` is served from submission snapshot data

**User Story:** US09

---

### 8.2 Get Submission Detail

🔒 **User** (own submissions), **Admin** (any submission)

```
GET /api/submissions/:submission_id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "submission_id": "sub-uuid-...",
    "type": "SUBMIT",
    "source_code": "a, b = map(int, input().split())\nprint(a + b)",
    "language_id": 71,
    "overall_status": "ACCEPTED",
    "passed_count": 8,
    "total_count": 8,
    "question": {
      "question_id": "a1b2c3d4-...",
      "title": "Two Sum"
    },
    "execution_results": [
      {
        "test_case_id": "tc-uuid-1",
        "is_hidden": false,
        "status": "ACCEPTED",
        "stdin": "5 10",
        "stdout": "15",
        "expected_output": "15",
        "execution_time": "0.032",
        "memory_used": "3.2"
      }
    ],
    "created_at": "2025-03-10T12:00:00Z",
    "started_at": "2025-03-10T12:00:01Z",
    "completed_at": "2025-03-10T12:00:03Z"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 403 | `FORBIDDEN` | User trying to view another user's submission |
| 404 | `SUBMISSION_NOT_FOUND` | ID doesn't exist |

**Notes:**
- For `type=RUN`: `execution_results` has 1 item with `stdin` = stored custom input snapshot, no `expected_output`
- For `type=SUBMIT`: backend stores `stdin_snapshot` internally for audit/debug, but hidden test case results return masked `stdin`, `stdout`, `expected_output`
- Historical detail is based on snapshot data stored at grading time, so edits/deletes to questions or test cases do not alter old submissions

**User Story:** US09, US12.1

---

### 8.3 List All Submissions (Admin)

🔒 **Admin**

```
GET /api/admin/submissions
```

**Query Params:** Standard pagination + filters

| Param | Type | Description |
|-------|------|-------------|
| `user_id` | UUID | Filter by user |
| `question_id` | UUID | Filter by question |
| `type` | string | `RUN` or `SUBMIT` |
| `status` | string | Filter by overall_status |
| `search` | string | Search by user email or question title |

**Response:** `200 OK` (paginated)
```json
{
  "success": true,
  "data": [
    {
      "submission_id": "sub-uuid-...",
      "type": "SUBMIT",
      "user": {
        "user_id": "550e8400-...",
        "email": "user@example.com",
        "display_name": "John Doe"
      },
      "question": {
        "question_id": "a1b2c3d4-...",
        "title": "Two Sum"
      },
      "language_id": 71,
      "overall_status": "ACCEPTED",
      "passed_count": 8,
      "total_count": 8,
      "created_at": "2025-03-10T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total_items": 1234,
    "total_pages": 25
  }
}
```

**Notes:**
- Default limit: 50/page (higher than user-facing)
- Includes `user` object with each submission

**User Story:** US16

---

## 9. Sessions (Realtime)

### 9.1 Create Session

🔒 **User**

```
POST /api/sessions
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question_id` | UUID | ❌ | Link session to a question |

```json
{
  "question_id": "a1b2c3d4-..."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "session_id": "ses-uuid-...",
    "owner_id": "550e8400-...",
    "status": "ACTIVE",
    "sharing_enabled": false,
    "join_code": null,
    "current_version": 0,
    "websocket_url": "wss://api.example.com/ws/session/ses-uuid-...",
    "created_at": "2025-03-10T12:00:00Z"
  }
}
```

**User Story:** US14

---

### 9.2 Open Sharing / Rotate Join Code

🔒 **Owner** (own session), **Admin**

```
POST /api/sessions/:session_id/sharing/open
```

**Request Body:** optional

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rotate_code` | boolean | ❌ | Force generate a new join code even if sharing is already on |
| `expires_in_minutes` | integer | ❌ | Optional expiry for the join code |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session_id": "ses-uuid-...",
    "sharing_enabled": true,
    "join_code": "ABCD-EFGH",
    "join_link": "/join/ABCD-EFGH",
    "join_code_expires_at": "2025-03-10T12:30:00Z"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 403 | `FORBIDDEN` | User is not the owner/admin of this session |
| 404 | `SESSION_NOT_FOUND` | Session ID doesn't exist |
| 410 | `SESSION_CLOSED` | Session has ended |

**Notes:**
- Opening sharing generates a join code if one does not already exist
- Share link simply embeds the join code; there is no separate sharing architecture beyond that
- Owner may rotate the code at any time to invalidate old links

**User Story:** US14

---

### 9.3 Disable Sharing

🔒 **Owner** (own session), **Admin**

```
POST /api/sessions/:session_id/sharing/close
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session_id": "ses-uuid-...",
    "sharing_enabled": false,
    "join_code": null,
    "disconnected_viewer_count": 3
  }
}
```

**Notes:**
- Blocks new joins immediately
- Disconnects all currently connected viewers immediately
- Existing pending join requests remain in history, but no new requests may be created until sharing is opened again

**User Story:** US14

---

### 9.4 Request to Join Session by Code

🔒 **All Roles**

```
POST /api/sessions/join
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `join_code` | string | ✅ | Format `XXXX-YYYY` |

```json
{
  "join_code": "ABCD-EFGH"
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "request_id": "req-join-uuid-...",
    "session_id": "ses-uuid-...",
    "owner": {
      "user_id": "550e8400-...",
      "display_name": "Alice"
    },
    "status": "PENDING",
    "requested_at": "2025-03-10T12:05:00Z"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 403 | `FORBIDDEN` | Sharing disabled or user is already the owner |
| 404 | `JOIN_CODE_NOT_FOUND` | Join code doesn't exist |
| 410 | `SESSION_CLOSED` | Session has ended |
| 410 | `JOIN_CODE_EXPIRED` | Join code expired |
| 409 | `JOIN_REQUEST_ALREADY_PENDING` | User already has an unresolved pending request for this session |
| 429 | `JOIN_REQUEST_RATE_LIMITED` | User exceeded join-request rate limit for this session |

**Notes:**
- Creates a join request instead of granting access immediately
- Session is requestable only when owner has opened sharing and the join code is still valid
- Authenticated `USER` or `ADMIN` may request to join as `VIEWER`
- Rate limit recommendation: max `5` join requests / 10 minutes / user / session
- The share link just pre-fills the same `join_code`

**User Story:** US14.1

---

### 9.5 List Pending Join Requests

🔒 **Owner** (own session), **Admin**

```
GET /api/sessions/:session_id/join-requests
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "request_id": "req-join-uuid-...",
      "user": {
        "user_id": "viewer-uuid-...",
        "display_name": "Bob"
      },
      "status": "PENDING",
      "requested_at": "2025-03-10T12:05:00Z"
    }
  ]
}
```

**Notes:**
- By default returns only `PENDING` requests; optional query filtering may be added later for history

**User Story:** US14.1

---

### 9.6 Approve Join Request

🔒 **Owner** (own session), **Admin**

```
POST /api/sessions/:session_id/join-requests/:request_id/approve
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "request_id": "req-join-uuid-...",
    "session_id": "ses-uuid-...",
    "user_id": "viewer-uuid-...",
    "status": "APPROVED",
    "websocket_url": "wss://api.example.com/ws/session/ses-uuid-...",
    "approved_at": "2025-03-10T12:06:00Z"
  }
}
```

**Errors:**

| Status | Code | When |
|--------|------|------|
| 404 | `JOIN_REQUEST_NOT_FOUND` | Request does not exist for this session |
| 409 | `JOIN_REQUEST_ALREADY_RESOLVED` | Request already approved/rejected |

**Notes:**
- Approval authorizes the viewer to attach via WebSocket and receive the initial session snapshot
- Frontend should notify the requester in real time if they are online

**User Story:** US14.1

---

### 9.7 Reject Join Request

🔒 **Owner** (own session), **Admin**

```
POST /api/sessions/:session_id/join-requests/:request_id/reject
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "request_id": "req-join-uuid-...",
    "session_id": "ses-uuid-...",
    "user_id": "viewer-uuid-...",
    "status": "REJECTED",
    "rejected_at": "2025-03-10T12:06:00Z"
  }
}
```

**Notes:**
- Rejection does not permanently block the viewer; they may submit a new request later if sharing is still open and rate limits allow

**User Story:** US14.1

---

### 9.8 List Session Participants

🔒 **Owner** (own session), **Admin**

```
GET /api/sessions/:session_id/participants
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "user_id": "550e8400-...",
      "display_name": "Alice",
      "session_role": "OWNER",
      "joined_at": "2025-03-10T12:00:00Z"
    },
    {
      "user_id": "viewer-uuid-...",
      "display_name": "Bob",
      "session_role": "VIEWER",
      "joined_at": "2025-03-10T12:05:00Z"
    }
  ]
}
```

**User Story:** US14.1

---

### 9.9 Kick Session Participant

🔒 **Owner** (own session), **Admin**

```
POST /api/sessions/:session_id/participants/:user_id/kick
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session_id": "ses-uuid-...",
    "user_id": "viewer-uuid-...",
    "removed_at": "2025-03-10T12:10:00Z"
  }
}
```

**Notes:**
- Owner cannot kick themselves through this endpoint
- Kicking removes the viewer from active participants immediately
- Kicked viewers are not persistently blocked; they may submit a new join request again if sharing is still open and rate limits allow
- Server emits `removed_from_session` to the target viewer and updates participant list for the owner

**User Story:** US14.1

---

### 9.10 Close Session

🔒 **Owner** (own session), **Admin**

```
PATCH /api/sessions/:session_id/close
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session_id": "ses-uuid-...",
    "status": "CLOSED",
    "ended_at": "2025-03-10T13:00:00Z"
  }
}
```

**Notes:**
- Broadcasts `session_closed` event to all connected viewers
- Also auto-triggered 5 minutes after owner disconnects

**User Story:** US14

---

## 10. WebSocket Events

**Connection URL:** `wss://api.example.com/ws/session/:session_id`  
**Auth:** Query param `?token=<access_token>`  
**Protocol:** Socket.IO

This same WebSocket connection is also used to stream execution and grading events for the active session.

**Security note:**
- Query-param token auth is accepted for MVP browser compatibility, but it leaks more easily into proxy/server logs than header-based auth
- Deployments must redact query strings from access logs and avoid logging raw connection URLs
- Preferred hardening path is exchanging the regular access token for a short-lived WebSocket ticket and passing that ephemeral token in the query param

### 10.1 Client → Server Events

#### `join_session`

Sent after a participant has been authorized to attach to the live session.

```json
{
  "event": "join_session",
  "data": {
    "session_id": "ses-uuid-..."
  }
}
```

**Server responds with:** `viewer_joined` broadcast + current code snapshot

**Authorization rules:**
- Session owner may attach to their own hosted session directly
- Viewer may attach only after their join request was approved and the session is still active
- If sharing was closed after approval but before socket attach, the server rejects the join because all viewer access is revoked

**If forbidden:** server emits an error event and closes/refuses the join for that socket.

```json
{
  "event": "error",
  "data": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to join this session."
  }
}
```

---

#### `leave_session`

Sent when viewer intentionally disconnects.

```json
{
  "event": "leave_session",
  "data": {
    "session_id": "ses-uuid-..."
  }
}
```

---

#### `code_changed`

Sent by **Owner only** when code is modified. Debounced at 300ms on client side.

```json
{
  "event": "code_changed",
  "data": {
    "session_id": "ses-uuid-...",
    "code_content": "a, b = map(int, input().split())\nprint(a + b)",
    "language_id": 71,
    "version": 42,
    "timestamp": "2025-03-10T12:00:00.123Z"
  }
}
```

**Notes:**
- Server updates `sessions.current_code`, `sessions.current_language_id`, `sessions.current_version`, and `sessions.last_activity_at`
- Server appends the event to the short-lived session event buffer for reconnect catch-up
- Server broadcasts `code_updated` to all viewers
- If sender is not the session's owner → server ignores (read-only enforcement)

---

### 10.2 Server → Client Events

#### `viewer_joined`

Broadcast to all clients when a new viewer joins.

```json
{
  "event": "viewer_joined",
  "data": {
    "user_id": "viewer-uuid-...",
    "display_name": "Bob",
    "viewer_count": 3
  }
}
```

---

#### `viewer_left`

Broadcast when a viewer disconnects.

```json
{
  "event": "viewer_left",
  "data": {
    "user_id": "viewer-uuid-...",
    "display_name": "Bob",
    "viewer_count": 2
  }
}
```

---

#### `code_updated`

Broadcast to **Viewers** when owner's code changes.

```json
{
  "event": "code_updated",
  "data": {
    "code_content": "a, b = map(int, input().split())\nprint(a + b)",
    "language_id": 71,
    "version": 42,
    "timestamp": "2025-03-10T12:00:00.123Z"
  }
}
```

**Notes:**
- Viewer's Monaco Editor updates in read-only mode
- Version number used for ordering (discard out-of-order events)

---

#### `code_executing`

Broadcast when owner clicks Run or Submit.

```json
{
  "event": "code_executing",
  "data": {
    "type": "RUN",
    "timestamp": "2025-03-10T12:00:00Z"
  }
}
```

---

#### `execution_completed`

Broadcast when Run execution finishes.

```json
{
  "event": "execution_completed",
  "data": {
    "submission_id": "sub-uuid-...",
    "status": "ACCEPTED",
    "stdout": "15\n",
    "stderr": "",
    "execution_time": "0.032",
    "memory_used": "3.2"
  }
}
```

**Notes:**
- Sent to the owner and all viewers in the session
- Frontend uses `submission_id` to match the pending run request

---

#### `grading_progress`

Broadcast during Submit — sent after each test case completes.

```json
{
  "event": "grading_progress",
  "data": {
    "submission_id": "sub-uuid-...",
    "completed": 5,
    "total": 8
  }
}
```

---

#### `grading_completed`

Broadcast when all test cases finish.

```json
{
  "event": "grading_completed",
  "data": {
    "submission_id": "sub-uuid-...",
    "overall_status": "WRONG_ANSWER",
    "passed_count": 5,
    "total_count": 8
  }
}
```

**Notes:**
- Final grading payload is delivered over WebSocket; `GET /api/submissions/:submission_id` remains available for history/detail views

---

#### `removed_from_session`

Broadcast to a viewer when owner/admin removes them from the session or closes sharing.

```json
{
  "event": "removed_from_session",
  "data": {
    "session_id": "ses-uuid-...",
    "reason": "kicked_by_owner",
    "removed_at": "2025-03-10T12:10:00Z"
  }
}
```

`reason` values: `kicked_by_owner` | `sharing_closed` | `admin_removed`

---

#### `session_closed`

Broadcast when session ends (owner or admin closes, or auto-timeout).

```json
{
  "event": "session_closed",
  "data": {
    "session_id": "ses-uuid-...",
    "reason": "owner_closed",
    "ended_at": "2025-03-10T13:00:00Z"
  }
}
```

`reason` values: `owner_closed` | `admin_closed` | `idle_timeout`

---

#### `sync_check`

Periodic checksum verification (every 10 seconds). Ensures viewer's local state matches server.

```json
{
  "event": "sync_check",
  "data": {
    "checksum": "a1b2c3d4e5f6...",
    "version": 42
  }
}
```

**Client logic:**
- Compute checksum of local code
- If mismatch → request full snapshot via `join_session` event

---

## 11. Internal - Judge0 Callback

### 11.1 Judge0 Webhook

🔒 Internal only (không expose ra internet)

```
POST /internal/judge0/callback
```

**Description:** Judge0 gửi callback kết quả execution/grading về backend để hoàn tất submission bất đồng bộ.

**Authentication:** Shared secret header

```
X-Judge0-Callback-Secret: <secret_tu_env>
```

Backend phải verify header này trước khi xử lý bất kỳ payload nào. Nếu không khớp thì trả về `401 Unauthorized` và log sự kiện ngay.

**HTTP Errors:**

| Status | Code | When |
|--------|------|------|
| 401 | `UNAUTHORIZED` | Missing/invalid callback secret |
| 404 | `SUBMISSION_NOT_FOUND_YET` | Callback đến sớm hơn DB record; backend đẩy vào retry flow idempotent |
| 409 | `DUPLICATE_CALLBACK` | Callback đã được xử lý trước đó và bị replay |

**Security notes:**
- Endpoint này là internal-only: chỉ accessible trong Docker internal network
- Không route endpoint này qua reverse proxy/public ingress
- Shared secret lấy từ environment variable, không commit vào repo
