# Security Consideration
## Online Code Editor Platform

**Version:** 1.0
**Date:** March 2026
**Status:** Ready for Review

---

## Mục Lục

1. [Tổng Quan & Phạm Vi](#1-tổng-quan--phạm-vi)
2. [Threat Model](#2-threat-model)
3. [Authentication & Session Security](#3-authentication--session-security)
4. [Authorization & RBAC Enforcement](#4-authorization--rbac-enforcement)
5. [Code Execution Sandbox](#5-code-execution-sandbox)
6. [Input Validation & Injection Prevention](#6-input-validation--injection-prevention)
7. [Data Protection & Privacy](#7-data-protection--privacy)
8. [Transport Security](#8-transport-security)
9. [WebSocket Security](#9-websocket-security)
10. [Secrets & Credential Management](#10-secrets--credential-management)
11. [Third-Party Dependency Security](#11-third-party-dependency-security)
12. [Audit Logging & Non-Repudiation](#12-audit-logging--non-repudiation)
13. [Security Testing Requirements](#13-security-testing-requirements)
14. [Incident Response](#14-incident-response)

---

## 1. Tổng Quan & Phạm Vi

### 1.1 Mục đích

Tài liệu này mô tả các mối đe dọa bảo mật, quyết định thiết kế bảo mật, và các biện pháp kiểm soát áp dụng cho **Online Code Editor Platform**. Đây là tài liệu thiết kế bảo mật của hệ thống — khác với `ai-usage-policy.md` là policy về việc sử dụng AI trong quá trình phát triển.

### 1.2 Tài sản cần bảo vệ (Assets)

| Tài sản | Mức độ nhạy cảm | Mô tả |
|---------|----------------|-------|
| Source code của Coder | HIGH | Code bài thi, thuật toán cá nhân |
| Hidden test cases | HIGH | Dữ liệu chấm điểm — nếu lộ làm mất ý nghĩa bài thi |
| Thông tin xác thực (credentials) | CRITICAL | Password hash, JWT secret, refresh token |
| Submission history | MEDIUM | Lịch sử làm bài của ứng viên |
| Host system của Judge0 | CRITICAL | Nếu bị escape → toàn bộ hạ tầng bị compromise |
| Dữ liệu người dùng | MEDIUM | Email, display name, role |

### 1.3 Các bên liên quan đến bảo mật

| Vai trò | Trách nhiệm bảo mật |
|---------|-------------------|
| Backend Developer | Implement auth, RBAC enforcement, input validation |
| DevOps | Judge0 sandbox config, secret management, network policy |
| QA | Security test cases, penetration testing |
| Admin (runtime) | Role assignment, account management |

---

## 2. Threat Model

### 2.1 Attack Surface

```
Internet
   │
   ├── HTTPS ──► React Frontend (Browser)
   │                    │
   │              REST API + WebSocket
   │                    │
   │             NestJS Backend ──► Judge0 (Docker)
   │                    │                │
   │             PostgreSQL          Sandbox Container
   │             Redis (opt)         (User Code Runs Here)
   │
   └── Direct attack vectors:
        - API endpoints (unauthenticated + authenticated)
        - WebSocket connection
        - JWT token forgery/theft
        - Code injection via Judge0
        - Admin panel
```

### 2.2 Threat Actors

| Actor | Khả năng | Động cơ |
|-------|---------|---------|
| **External attacker** | Khai thác public API, brute force | Lấy dữ liệu, phá hoại hệ thống |
| **Malicious Coder** | Submit code độc, access hidden tests | Gian lận bài thi, leo thang quyền |
| **Malicious Viewer** | Cố gắng edit code trong session | Phá hoại bài thi của Coder |
| **Compromised Admin** | Thay đổi role, xem dữ liệu mọi user | Insider threat |
| **Automated bot** | Flood submission endpoint | DDoS, cạn kiệt Judge0 resources |

### 2.3 STRIDE Analysis

| Threat | Attack Vector | Biện pháp |
|--------|--------------|-----------|
| **Spoofing** | JWT forgery, session hijacking | Verify signature, HTTPS only, short-lived token |
| **Tampering** | Sửa JWT payload, edit WebSocket event | Signature check, role verify từ DB |
| **Repudiation** | Phủ nhận đã submit code | Audit log không thể xóa, snapshot lưu vào DB |
| **Information Disclosure** | Lộ hidden test case, source code người khác | DTO sanitization, ownership check |
| **Denial of Service** | Flood `/run` endpoint, fork bomb trong code | Rate limiting, Judge0 sandbox resource limit |
| **Elevation of Privilege** | Coder tự đổi role thành Admin | Role chỉ được set bởi Admin, verify từ DB mỗi request |

### 2.4 Trust Boundaries

```
[Browser]  ──(HTTPS)──►  [Backend API]  ──(Internal network)──►  [Judge0]
    │                          │                                      │
  Untrusted              Semi-trusted                           Untrusted
  (validate all          (verify identity,                     (treat all code
   inputs)                enforce RBAC)                         as malicious)
```

**Nguyên tắc:** Code do user viết phải được coi là **hostile** tại mọi điểm trong pipeline. Backend không bao giờ tin tưởng output từ Judge0 mà không validate format/size trước khi lưu DB.

---

## 3. Authentication & Session Security

### 3.1 Password Security

- Bcrypt với **salt rounds ≥ 10** (tăng lên 12 nếu server cho phép latency ~250ms).
- Không lưu plain text hoặc reversible hash ở bất kỳ đâu kể cả log.
- Password validation: tối thiểu 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt.
- Email normalize về lowercase trước khi lưu để tránh duplicate account.

### 3.2 JWT Access Token

**Payload chuẩn:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "role": "CODER",
  "auth_version": 3,
  "iat": 1710000000,
  "exp": 1710000900
}
```

**Quyết định thiết kế và lý do:**

| Quyết định | Lý do bảo mật |
|-----------|--------------|
| Expiry 15 phút | Giảm window nếu token bị đánh cắp |
| Thuật toán HS256 với secret ≥ 256 bit | Đủ mạnh cho symmetric signing |
| Không dùng `none` algorithm | Tránh algorithm confusion attack |
| Có `auth_version` trong payload | Cho phép revoke token ngay lập tức khi đổi password hoặc role |

**Validation bắt buộc mỗi request:**
1. Verify chữ ký với secret
2. Kiểm tra `exp` chưa hết hạn
3. Load user từ DB: kiểm tra `is_active`, `deleted_at`, `auth_version` khớp với token
4. Nếu bất kỳ check nào fail → `401 Unauthorized`

> ⚠️ **Điểm quan trọng:** Bước 3 bắt buộc phải check DB (hoặc cache có TTL ngắn). Nếu bỏ qua, role change và account lock sẽ không có hiệu lực ngay lập tức.

### 3.3 Refresh Token

- Refresh token là **opaque string** — không chứa data, không decode được.
- Lưu dưới dạng **hash** trong bảng `refresh_tokens`, không lưu plaintext.
- Expiry: 30 ngày.
- **Token rotation:** Mỗi lần refresh thành công → issue token mới, revoke token cũ ngay lập tức.
- **Reuse detection:** Nếu token đã bị revoke mà vẫn được dùng → revoke **toàn bộ** refresh token của user đó (giả định token bị đánh cắp).

**Threat được xử lý:** Token theft — kẻ tấn công dùng stolen refresh token sẽ trigger reuse detection và tự kick cả legitimate user ra, từ đó alert được phát hiện.

### 3.4 Brute Force Protection

- Rate limit login: **5 failed attempts / 5 phút / IP**.
- Response khi fail phải **identical** dù là sai email hay sai password (tránh email enumeration).
- Resend verification email: **3 requests / 15 phút / email** — luôn trả 200 dù email không tồn tại.

### 3.5 Refresh Token khi Access Token còn hạn

Nếu client gọi `/refresh` trong khi access token chưa hết hạn → **vẫn accept và rotate**. Lý do: client có thể chủ động refresh sớm để tránh race condition. Không có lý do bảo mật để reject.

---

## 4. Authorization & RBAC Enforcement

### 4.1 Nguyên tắc cốt lõi

**Authorization phải được enforce ở backend, không bao giờ tin tưởng frontend.**

Frontend có thể ẩn nút, disable input — nhưng đó chỉ là UX. Mọi API endpoint đều phải tự kiểm tra quyền độc lập.

### 4.2 Enforcement Points

```
Request → [Auth Middleware] → [Role Guard] → [Ownership Check] → Handler
              │                    │                  │
         Verify JWT           Check role          Check user_id
         Load user            vs endpoint         matches resource
         from DB              requirement         owner
```

**Ownership check** là lớp bảo vệ thứ ba, áp dụng khi resource thuộc về một user cụ thể:
- Coder chỉ xem được submission của chính mình
- Coder chỉ close được session của chính mình

### 4.3 RBAC Matrix (Security-Focused)

| Endpoint | ADMIN | CODER | VIEWER | Ghi chú |
|----------|-------|-------|--------|---------|
| `POST /submissions/run` | ✅ | ✅ | ❌ | Viewer không chạy code |
| `POST /submissions/submit` | ✅ | ✅ | ❌ | |
| `GET /submissions/:id` | ✅ | ⚠️ own only | ❌ | Ownership check |
| `GET /admin/submissions` | ✅ | ❌ | ❌ | |
| `POST /admin/questions` | ✅ | ❌ | ❌ | |
| `GET /admin/questions/:id/test_cases` | ✅ | ❌ | ❌ | Full data với hidden |
| `GET /questions/:id/test_cases` | ✅ | ✅ | ✅ | Hidden output bị mask |
| `PATCH /admin/users/:id/role` | ✅ | ❌ | ❌ | Admin không tự demote |
| WebSocket `code_changed` | ✅ | ⚠️ coder of session | ❌ | Verify session ownership |

### 4.4 Hidden Test Case Protection

Đây là một trong các điểm rò rỉ dữ liệu dễ bỏ sót nhất. Áp dụng **hai lớp bảo vệ**:

**Lớp 1 — API response DTO:**
```
Coder/Viewer nhận:
{
  "test_case_id": "tc-uuid-2",
  "input": "[hidden]",          ← masked
  "expected_output": "[hidden]", ← masked
  "is_hidden": true
}
```

**Lớp 2 — Grading server-side only:**
So sánh `actual_output` vs `expected_output` chỉ xảy ra trên server. Không trả `expected_output` thực tế trong submission result cho hidden test cases.

**Không được:**
- Log `expected_output` của hidden test cases ở level INFO
- Trả `expected_output` trong WebSocket event dù là broadcast nội bộ

### 4.5 Viewer Edit Prevention

Khi nhận WebSocket event `code_changed`:
1. Lấy `user_id` từ authenticated WebSocket session
2. Load session từ DB, kiểm tra `session.coder_id === user_id`
3. Nếu không khớp → **drop event silently** + log attempt
4. Không broadcast, không update `current_code`

> Việc drop silently (không báo lỗi) tránh attacker biết được họ đang bị detect.

---

## 5. Code Execution Sandbox

Đây là threat surface **cao nhất** trong hệ thống. Một sandbox escape có thể dẫn đến full host compromise.

### 5.1 Judge0 Isolation Architecture

```
Host OS
└── Docker Engine
    └── Judge0 Worker Container
        └── Submission Container (per-execution)
            ├── Isolated filesystem (tmpfs, no host mount)
            ├── No network (--network none)
            ├── Limited syscalls (seccomp profile)
            └── User code runs here
```

Mỗi submission chạy trong **container riêng biệt, bị destroy sau khi xong**. Container A không thể đọc filesystem của container B.

### 5.2 Seccomp Profile (Syscall Restrictions)

Các syscall sau phải bị chặn:

| Syscall | Lý do chặn |
|---------|-----------|
| `fork`, `vfork`, `clone` | Prevent fork bomb |
| `execve`, `execveat` | Prevent spawning arbitrary processes |
| `socket`, `connect`, `bind` | Prevent network access |
| `ptrace` | Prevent process inspection |
| `mount` | Prevent filesystem manipulation |
| `syslog` | Prevent reading system logs |
| `reboot` | Obvious |

### 5.3 Resource Limits

| Resource | Limit | Enforcement |
|----------|-------|-------------|
| Wall-time | 10 giây | Judge0 `wall_time_limit` |
| CPU time | 8 giây | Judge0 `cpu_time_limit` |
| Memory | 256 MB | Judge0 `memory_limit` |
| Output (stdout) | 100 KB | Judge0 `max_stdout` |
| Stack size | 64 MB | ulimit trong container |
| File size | 0 (read-only except tmpfs) | Docker volume config |
| Process count | 1 | Judge0 `max_processes_and_or_threads` |

### 5.4 Network Isolation

```bash
# Judge0 worker container phải chạy với:
--network none
# Hoặc custom network không có route ra internet
```

Code user **không được phép** thực hiện network request. Nếu code cố `connect()` → syscall bị chặn bởi seccomp.

### 5.5 Output Validation trước khi lưu DB

Backend **không tin tưởng** output từ Judge0 một cách mù quáng:

```
Judge0 response
      │
      ▼
[Validate output size ≤ 100KB]
      │
      ▼
[Sanitize: strip null bytes, validate UTF-8]
      │
      ▼
[Store to DB]
```

Nếu output chứa null bytes hoặc encoding không hợp lệ → lưu error message thay vì raw output.

### 5.6 Judge0 Failure Handling

Judge0 được coi là **untrusted external dependency**:

- Retry policy: exponential backoff 1s → 2s → 4s, tối đa 3 lần
- Circuit breaker: nếu error rate > 50% trong 2 phút → open circuit, trả `503` ngay thay vì tiếp tục retry
- Health check: ping Judge0 mỗi 30 giây
- **Không bao giờ expose Judge0 internal error message** thô cho user — chỉ trả generic message

---

## 6. Input Validation & Injection Prevention

### 6.1 Nguyên tắc

Validate **tất cả input** tại API layer trước khi xử lý. Không tin tưởng bất kỳ data nào từ client kể cả authenticated user.

### 6.2 SQL Injection

- Sử dụng **parameterized queries / ORM** (TypeORM/Prisma với NestJS) — không bao giờ string concatenation vào SQL.
- Không có raw SQL query nhận input từ user trực tiếp.
- User input trong `WHERE` clause phải đi qua ORM parameter binding.

### 6.3 Cross-Site Scripting (XSS)

| Điểm rủi ro | Biện pháp |
|-------------|-----------|
| Question description (Markdown) | Sanitize HTML output khi render — chỉ allow whitelist tags |
| Code output (stdout/stderr) | Render trong `<pre>` với HTML escape, không dùng `innerHTML` |
| Display name | Escape khi render, strip HTML tags |
| Error messages từ Judge0 | Không render raw, escape trước khi hiển thị |

Monaco Editor render code trong sandbox iframe — ít rủi ro XSS hơn nhưng vẫn cần escape data đưa vào.

### 6.4 Validation Rules tại API Layer

| Field | Rule |
|-------|------|
| `email` | Regex validate + normalize lowercase |
| `password` | Min 8 chars, complexity check |
| `source_code` | Max 1MB, không execute hay parse trên backend |
| `stdin` | Max 100KB |
| `language_id` | Whitelist check — chỉ accept ID trong danh sách đã define |
| `question_id` | UUID format + existence check |
| `role` | Enum: chỉ `ADMIN`, `CODER`, `VIEWER` |
| Markdown fields | Max length + HTML sanitize khi render |

### 6.5 Path Traversal

Hệ thống không có file upload. Tuy nhiên nếu tương lai có:
- Không bao giờ dùng user input làm file path trực tiếp
- Sanitize `../` và URL-encoded variants

---

## 7. Data Protection & Privacy

### 7.1 Data Classification

| Data | Classification | Storage |
|------|---------------|---------|
| Password | CRITICAL | Bcrypt hash only, never plaintext |
| Refresh token | CRITICAL | SHA-256 hash only |
| JWT secret | CRITICAL | Environment variable, không commit vào repo |
| Hidden test case expected output | HIGH | DB, không log, không trả về Coder |
| Source code submissions | MEDIUM | DB, chỉ owner + Admin xem được |
| Email, display name | MEDIUM | DB |
| stdout/stderr | LOW | DB, chỉ owner + Admin xem được |

### 7.2 Không Bao Giờ Log

- Password (dù là hash)
- Refresh token (dù là hash)
- JWT token đầy đủ
- `expected_output` của hidden test case
- Thông tin thẻ ngân hàng (không áp dụng cho project này nhưng là nguyên tắc)

### 7.3 Soft Delete & Data Retention

Admin delete user là **logical delete** (`deleted_at`, `is_active=false`). Submission history được giữ nguyên để:
- Audit trail
- Tránh FK violation

Nếu cần xóa thật (GDPR request trong tương lai) → cần separate purge process, không phải API endpoint thông thường.

### 7.4 Snapshot Data

`submissions.source_code`, `execution_results.expected_output_snapshot` lưu bản copy tại thời điểm submit — không thay đổi dù admin edit/delete question sau đó. Đây là thiết kế đúng cho audit trail nhưng cần đảm bảo:
- Access control vẫn áp dụng cho snapshot data
- Snapshot không bị expose qua API không được kiểm soát

---

## 8. Transport Security

### 8.1 HTTPS / TLS

- **Tất cả traffic** phải qua HTTPS — không có HTTP fallback.
- TLS version tối thiểu: **TLS 1.2** (khuyến nghị TLS 1.3).
- HTTP Strict Transport Security (HSTS): `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Redirect HTTP → HTTPS ở reverse proxy layer (Nginx/Cloudflare).

### 8.2 Security Headers

Áp dụng tại API layer hoặc reverse proxy:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 8.3 CORS Policy

```javascript
// Chỉ allow origin cụ thể — không dùng wildcard (*)
cors({
  origin: ['https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
})
```

Internal Judge0 API không expose ra internet — chỉ accessible từ backend container trong cùng Docker network.

---

## 9. WebSocket Security

### 9.1 Authentication

WebSocket dùng query param `?token=<access_token>` do browser WebSocket API không hỗ trợ custom header.

**Tradeoff được acknowledge:** Access token xuất hiện trong server access logs và browser history.

**Mitigation:**
- Server log phải mask query params chứa `token=` (chỉ log `token=[REDACTED]`)
- Token có TTL ngắn (15 phút) giới hạn window nếu bị lộ
- Nếu cần tăng bảo mật: implement short-lived WS-specific token qua một `POST /api/ws-token` endpoint trước khi connect

### 9.2 Authorization trong WebSocket

Mỗi event từ client phải được verify:

```
Client event received
        │
        ▼
[Verify WS session có valid access token]
        │
        ▼
[Check event type vs user role]
        │
   code_changed? ──► [Verify sender là coder của session]
        │
   join_session? ──► [Verify session tồn tại, còn ACTIVE, và role được phép join]
```

### 9.3 Event Validation

- Không trust `session_id` trong event payload — lấy từ authenticated WS session context
- Với `join_session`, chỉ cho phép `VIEWER`/`ADMIN`; nếu là `CODER` thì chỉ được join session do chính họ host
- Validate `version` là integer dương
- Validate `code_content` size ≤ 1MB
- Không eval hoặc execute bất kỳ data nào từ WebSocket event

### 9.4 Connection Limits

- Max concurrent WebSocket connections per session: define rõ (gợi ý: 20 viewers)
- Max reconnect rate: exponential backoff để tránh thundering herd khi server restart

---

## 10. Secrets & Credential Management

### 10.1 Secrets không được commit vào repository

| Secret | Lưu ở đâu |
|--------|----------|
| JWT signing secret | Environment variable |
| Database password | Environment variable hoặc secret manager |
| Judge0 API key (nếu có) | Environment variable |
| Redis password (nếu có) | Environment variable |
| SMTP credentials | Environment variable |

**`.env` file phải có trong `.gitignore`.** Repository chỉ chứa `.env.example` với placeholder values.

### 10.2 Secret Rotation

| Secret | Rotation trigger | Hậu quả |
|--------|-----------------|---------|
| JWT secret | Khi suspect compromise | Tất cả access token hiện tại bị invalidate ngay |
| DB password | Định kỳ 90 ngày hoặc khi nhân sự thay đổi | Cần restart backend |
| Refresh token | Automatic (rotation on use) | Transparent với user |

Khi rotate JWT secret → **tăng `auth_version` của tất cả users** để force re-login toàn bộ.

### 10.3 Principle of Least Privilege cho Service Accounts

- Database user của backend chỉ có quyền `SELECT`, `INSERT`, `UPDATE`, `DELETE` trên các bảng cần thiết — không có `DROP`, `CREATE`, `ALTER`.
- Judge0 chỉ accessible từ backend service trong Docker network — không expose port ra ngoài.

---

## 11. Third-Party Dependency Security

### 11.1 Judge0

Judge0 là dependency quan trọng nhất và có risk cao nhất.

| Risk | Biện pháp |
|------|-----------|
| CVE trong Judge0 | Monitor Judge0 GitHub releases, update định kỳ |
| Judge0 container bị compromise | Network isolation — Judge0 không có internet access |
| Malicious code escape sandbox | Seccomp + AppArmor + resource limits (defense in depth) |
| Judge0 API trust | Validate và sanitize tất cả response từ Judge0 trước khi dùng |

Chạy Judge0 **selfhost** giảm risk so với cloud-hosted (không có third-party access vào execution data) nhưng tăng trách nhiệm maintain security patches.

Judge0 callback endpoint phải được bảo vệ bằng shared secret. Secret này là environment variable, không commit vào repo. Ngoài ra, endpoint chỉ được accessible từ Docker internal network, không route ra ngoài qua reverse proxy. Mô hình này tạo 2 lớp bảo vệ: network isolation để chặn truy cập từ ngoài và shared secret để chặn request giả mạo nếu lớp network bị bypass.

### 11.2 NPM/Node Dependencies

- `npm audit` trong CI pipeline — fail build nếu có HIGH/CRITICAL CVE.
- Lock file (`package-lock.json`) commit vào repo.
- Không dùng `*` trong version range cho production dependencies.
- Review dependency trước khi thêm mới — tránh supply chain attack.

### 11.3 Docker Base Images

- Dùng **specific version tag** — không dùng `latest`.
- Scan image với Trivy hoặc Docker Scout trước khi deploy.
- Update base image định kỳ để nhận security patches của OS.

---

## 12. Audit Logging & Non-Repudiation

### 12.1 Events cần Audit Log

Các event sau phải được log ở mức AUDIT (không thể bị xóa bởi user thông thường):

| Event | Data cần log |
|-------|-------------|
| Login thành công | `user_id`, `ip`, `timestamp`, `user_agent` |
| Login thất bại | `email_attempted`, `ip`, `timestamp`, `failure_reason` |
| Role change | `admin_id`, `target_user_id`, `old_role`, `new_role`, `timestamp` |
| Account lock/unlock | `admin_id`, `target_user_id`, `action`, `timestamp` |
| Account delete | `admin_id`, `target_user_id`, `timestamp` |
| Unauthorized access attempt | `user_id`, `endpoint`, `required_role`, `timestamp` |
| Viewer attempt to edit | `user_id`, `session_id`, `timestamp` |
| JWT tamper detected | `ip`, `token_fragment` (NOT full token), `timestamp` |
| Submission created | `user_id`, `question_id`, `language_id`, `timestamp` |
| Admin view hidden test case | `admin_id`, `question_id`, `timestamp` |

### 12.2 Log Integrity

- Audit logs phải được lưu vào storage **tách biệt** với application logs.
- Không cung cấp API endpoint để xóa audit logs.
- Xem xét write-only log storage hoặc WORM (Write Once Read Many) cho audit logs.

### 12.3 Retention

| Log Type | Retention |
|----------|-----------|
| Audit logs (auth, role change) | 1 năm |
| Security event logs | 180 ngày |
| Application error logs | 90 ngày |
| General access logs | 30 ngày |

### 12.4 Không Log

Nhắc lại — tuyệt đối không log:
- Password hoặc password hash
- Refresh token
- Full JWT token
- `expected_output` của hidden test case
- Full source code trong access logs (chỉ log metadata: `submission_id`, `language`, `size`)

---

## 13. Security Testing Requirements

### 13.1 Test Cases bắt buộc trước Production

**Authentication:**
- [ ] JWT với signature sai → `401`
- [ ] JWT với `role: "Admin"` được forge bằng key sai → `401`
- [ ] JWT hết hạn → `401`
- [ ] Refresh token đã bị revoke → `401`
- [ ] Reuse refresh token sau khi rotate → revoke all tokens của user
- [ ] Brute force 6+ lần → `429`

**Authorization:**
- [ ] Viewer gọi `POST /submissions/run` → `403`
- [ ] Coder xem submission của user khác → `403`
- [ ] Coder gọi `POST /admin/questions` → `403`
- [ ] Coder xem hidden test case expected output → không có trong response
- [ ] Viewer gửi `code_changed` WebSocket event → bị drop, không update code

**Sandbox:**
- [ ] Submit code chạy `while(True): pass` → `TIME_LIMIT_EXCEEDED` sau 10s
- [ ] Submit code cấp phát 1GB RAM → `MEMORY_LIMIT_EXCEEDED`
- [ ] Submit code gọi `os.fork()` → bị chặn bởi seccomp
- [ ] Submit code mở socket network → bị chặn
- [ ] Submit code đọc `/etc/passwd` → bị chặn hoặc không có file

**Injection:**
- [ ] SQL injection trong search params → không ảnh hưởng DB
- [ ] XSS trong question description → escaped khi render
- [ ] XSS trong stdout từ code → escaped khi hiển thị
- [ ] `language_id` không trong whitelist → `400 Validation Error`

**Data Leakage:**
- [ ] API response cho Coder không chứa `expected_output` của hidden test case
- [ ] WebSocket broadcast không chứa hidden test case data
- [ ] Submission detail của user khác không accessible

### 13.2 Penetration Testing

Trước khi go-live, thực hiện ít nhất:
- OWASP Top 10 manual testing
- Automated scan với OWASP ZAP
- Manual sandbox escape attempt

### 13.3 Security Review Checklist

- [ ] Tất cả API endpoint có auth middleware
- [ ] Không có hardcoded secret trong source code
- [ ] Tất cả dependency đã qua `npm audit`
- [ ] Docker image đã scan CVE
- [ ] Log không chứa sensitive data
- [ ] HTTPS enforced, HSTS header present
- [ ] Judge0 port không expose ra internet
- [ ] Rate limiting active trên auth endpoints và submission endpoints

---

## 14. Incident Response

### 14.1 Security Incident Classification

| Level | Mô tả | Ví dụ | Thời gian phản hồi |
|-------|-------|-------|-------------------|
| CRITICAL | Hệ thống bị compromise | Sandbox escape, DB dump | Ngay lập tức |
| HIGH | Dữ liệu nhạy cảm bị lộ | Hidden test case leak, account takeover | < 1 giờ |
| MEDIUM | Abuse mà chưa có thiệt hại rõ ràng | Brute force đang diễn ra, anomalous traffic | < 4 giờ |
| LOW | Vulnerability phát hiện nhưng chưa bị exploit | CVE mới trong dependency | < 48 giờ |

### 14.2 Khi phát hiện Compromise

**Sandbox Escape (CRITICAL):**
1. Isolate Judge0 host ngay lập tức (ngắt network)
2. Preserve logs trước khi có thể bị tamper
3. Revoke tất cả active sessions (tăng `auth_version` toàn bộ users)
4. Assess impact — điều tra xem data nào bị access
5. Restore từ clean backup sau khi vá lỗi

**Credential Leak (CRITICAL):**
1. Rotate JWT secret ngay → tất cả token bị invalidate
2. Rotate DB password
3. Force re-login tất cả users
4. Kiểm tra audit log xem đã có access gì bất thường

**Account Takeover (HIGH):**
1. Admin lock account bị compromise
2. Revoke tất cả refresh token của user đó
3. Notify user qua email backup (nếu có)
4. Review audit log của user đó trong 30 ngày gần nhất

### 14.3 Post-Incident

- Viết incident report: timeline, root cause, impact, remediation
- Update threat model nếu attack vector mới
- Implement additional control để prevent recurrence

---

## Phụ lục: Mapping với Tài Liệu Liên Quan

| Tài liệu | Liên quan |
|----------|----------|
| `edge-case-detail.md` — #11 JWT tampered | Mục 3.2 |
| `edge-case-detail.md` — #12 Viewer try to edit | Mục 4.5, 9.2 |
| `edge-case-detail.md` — Risk #1 Sandbox Escape | Mục 5 |
| `edge-case-detail.md` — Risk #2 Privilege Escalation | Mục 3.2, 4 |
| `edge-case-detail.md` — Risk #9 Data Leak | Mục 4.4, 7 |
| `api-spec.md` — Auth endpoints | Mục 3 |
| `erd.md` — `auth_version`, `refresh_tokens` | Mục 3.2, 3.3 |
| `requirement.md` — NFR6 Security | Mục 5, 6, 8 |

---

**Document Owner:** Project Team
**Last Updated:** March 2026
**Next Review:** Before Production Go-Live
