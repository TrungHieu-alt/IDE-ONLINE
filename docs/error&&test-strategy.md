# Chiến Lược Kiểm Thử & Xử Lý Lỗi
## Nền Tảng Biên Tập Mã Online (Online Code Editor)

**Phiên bản:** 2.0 Thực Hành  
**Ngày:** Tháng 3 năm 2026  
**Trạng thái:** Sẵn sàng sử dụng

---

## 1. Tổng Quan

### Mục tiêu chính
- ✅ Code chạy đúng (compile, execute, chấm điểm)
- ✅ Đồng bộ realtime ổn định (owner → viewer)
- ✅ Bảo mật & cách ly dữ liệu (user A không access user B)
- ✅ Xử lý lỗi khéo léo (Judge0 down, không crash hệ thống)
- ✅ Hiệu suất & đồng thời (10+ submission cùng lúc)

---

## 2. Chiến Lược Kiểm Thử (Test Strategy)

### 2.1 Unit Test
Kiểm tra logic nhỏ, độc lập:

**Phạm vi test:**
- Mapping language → Judge0 ID (C=50, C++=54, JavaScript=63, Python=71, Java=62)
- Chuẩn hóa output: trim whitespace, xử lý `\n`, `\r\n`, `\t`
- Kiểm tra status submission: ACCEPTED, COMPILATION_ERROR, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED
- Validate access token (format đúng, chưa hết hạn, signature hợp lệ)
- Kiểm tra quyền theo role (Viewer không chạy code, User không tạo câu hỏi admin-only)

**Công cụ:** Jest, Vitest  
**Mục tiêu:** >80% code coverage cho business logic

**Ví dụ test case:**
```javascript
// Test normalize output
expect(normalizeOutput("42\n")).toBe("42");
expect(normalizeOutput("42\r\n")).toBe("42");

// Test permission check
expect(canRunCode("Viewer")).toBe(false);
expect(canRunCode("Owner")).toBe(true);

// Test floating point
expect(compareFloat(0.33333334, 0.33333333, 1e-6)).toBe(true);
```

---

### 2.2 Integration Test
Kiểm tra các module giao tiếp với nhau:

**Các kết nối cần test:**
- Frontend ↔ Backend API (REST endpoints)
- Backend ↔ Judge0 (submit code, nhận kết quả, xử lý 5xx)
- Backend ↔ PostgreSQL (lưu submission, consistency)
- Backend ↔ WebSocket (đồng bộ realtime)
- Auth middleware ↔ RBAC (access token hợp lệ → grant permission)

**Luồng chính test:**
```
User login → access token valid → truy cập /api/submissions/submit
→ Backend validate code
→ gọi Judge0 API
→ Judge0 compile + execute
→ lưu result vào DB
→ phát event WebSocket
→ Viewer nhận code update
→ trả kết quả cho frontend
```

**Test scenario cụ thể:**
1. **Lỗi Judge0 timeout**: Gửi code → Judge0 không phản hồi trong 30s → retry 3 lần (1s, 2s, 4s) → nếu vẫn fail → lưu trạng thái SYSTEM_ERROR
2. **Database transaction fail**: Insert submission + execution_results trong 1 transaction → nếu insert result fail → rollback cả submission
3. **Concurrent submit từ 1 user**: User click Run 5 lần nhanh → DB lưu 5 submission → verify `COUNT(*) = 5` trong `submissions`
4. **Hidden test case security**: Truy vấn test case → DTO trả về cho user KHÔNG chứa expected_output

**Công cụ:** Jest (mock API), Docker Compose (local Judge0), Postman  
**Mục tiêu:** Cover tất cả happy path + main error scenario

---

### 2.3 End-to-End Test
Kiểm tra toàn bộ flow người dùng:

**Flow 1: Đăng ký & Đăng nhập**
- Đăng ký email/password → server gửi email xác thực
- Click link xác thực trong email → account activated
- Đăng nhập email/password → nhận access token + refresh token
- Dùng access token để truy cập các API protected

**Flow 2: Chạy Code (Happy Path)**
- User chọn câu hỏi Python
- Viết code: `print("hello world")`
- Click nút Run
- Hệ thống gửi code đến Judge0
- Judge0 compile + execute → stdout = "hello world"
- Hệ thống so sánh output với expected → Accepted ✅

**Flow 3: Lỗi Execution từ Judge0**
- User viết code lỗi cú pháp → Judge0 trả Compile Error → hiển thị lỗi
- User viết vòng lặp vô hạn → Judge0 timeout → trả `TIME_LIMIT_EXCEEDED` (>10 giây)
- User dùng quá nhiều bộ nhớ → Judge0 trả `MEMORY_LIMIT_EXCEEDED` (>256MB)

**Flow 4: Đồng Bộ Realtime**
- Owner gõ `def hello():`
- Trong vòng 1 giây → Viewer thấy code cập nhật
- Test với 1 owner + 5 viewer cùng lúc
- Viewer disconnect → reconnect → nhận full code snapshot
- Owner disconnect < 5 phút rồi reconnect → session tiếp tục, giữ nguyên code hiện tại
- Owner disconnect > 5 phút và không còn WebSocket connection → scheduled worker đóng session, broadcast `session_closed` với `reason = "idle_timeout"`

**Flow 5: Admin Tạo Câu Hỏi & Chấm Điểm**
- Admin tạo câu hỏi (title, description; sample input/output nhúng trong description)
- Admin tạo test case ẩn (hidden) với expected output
- User submit code → hệ thống so sánh output vs hidden expected
- User KHÔNG thể thấy hidden expected output (API trả DTO khác)
- Admin view dashboard → thấy tất cả submission và điểm

**Công cụ:** Playwright, E2E test runner  
**Mục tiêu:** Pass tất cả happy path + 3-4 error scenario chính

---

### 2.4 Performance & Load Test

**Mục tiêu latency:**
- Submit/Run create endpoint latency: P50 < 200ms, P95 < 500ms, P99 < 1000ms
- Realtime sync latency: P50 < 300ms, P95 < 800ms (owner gõ → viewer thấy)
- Page load time: < 2 giây (first contentful paint)

**Load test scenario:**
- 10 user submit code cùng lúc → không timeout
- 20 user submit code cùng lúc → queue hoạt động đúng
- 1 owner + 5 viewer realtime → latency vẫn < 1 giây

**Công cụ:** K6, Lighthouse, Browser DevTools  
**Benchmark:** Chạy baseline trước khi code, track regression sau mỗi change

---

### 2.5 Security Test
- **Sandbox escape**: Code chạy `ls /` hoặc `../../../etc/passwd` → container block
- **XSS trong code**: Input `<script>alert('xss')</script>` → escape/sanitize
- **SQL injection**: Question description `'; DROP TABLE--` → escape
- **Brute force login**: Fail 10 lần → rate limit (429 Too Many Requests)
- **HTTPS enforcement**: Tất cả API calls → HTTPS, không có HTTP fallback
- **CORS policy**: Chỉ allow same origin, block cross-site request
- **WebSocket auth**: Viewer cố gửi edit event dù không có quyền → server chặn

**Công cụ:** OWASP ZAP, manual penetration testing

---

### 2.6 Chaos & Reliability Test
- **Judge0 down**: Container bị kill → API trả error, UI hiển thị degraded mode
- **Database timeout**: Query vượt 5s → retry, nếu vẫn fail → error message
- **WebSocket disconnect**: Client tự động reconnect với exponential backoff
- **Idle session auto-close**: giả lập owner mất kết nối và không reconnect; verify worker chạy mỗi 60s chỉ đóng session khi vừa quá 5 phút idle vừa không còn owner WebSocket connection
- **Network latency**: Simulate 500ms delay → verify realtime vẫn < 1s
- **Queue full**: 100 submission queue full → define rõ reject `503` hay tiếp tục queue với SLA khác

**Công cụ:** Docker kill, Linux `tc` command (traffic control), network simulation

---

## 3. Cái Gì Cần Kiểm Thử Chi Tiết (Critical Flows)

### 3.1 Đồng Bộ Realtime (PHẢI CHI TIẾT)

**Vấn đề:** Nếu event đến không theo thứ tự → viewer thấy code sai

**Algorithm:**
- Mỗi event có: version, timestamp, user_id
- Client gửi event A[v1], B[v2], C[v3]
- Server nhận C[v3], A[v1], B[v2] (order sai)
- Handler: discard C, apply A, apply B, send resync request

**Dedup (Duplicate Detection):**
- Event có unique ID (UUID)
- Redis set: `SET event:${event_id} NX EX 3600` (keep 1 hour)
- Nếu event duplicate → skip apply

**Out-of-sync Recovery:**
- Client tính checksum(code) mỗi 10 giây
- Nếu client checksum ≠ server checksum → request full code snapshot
- Server gửi full code, client update local state

**Test Case:**
```
// Event order test
1. Gửi 100 random events
2. Verify viewer code = expected
3. Verify checksum match

// Duplicate test
1. Gửi event 2 lần
2. Verify code apply 1 lần only

// Network jitter test
1. Simulate 100ms → 500ms → 1000ms delay
2. Verify realtime vẫn < 1 giây (debounce + network = < 1s)
```

---

### 3.2 Transaction & Concurrency (PHẢI CHI TIẾT)

**Problem:** Concurrent submission → mất record hoặc ghi trạng thái không nhất quán

**Atomic Transaction:**
```sql
-- BAD: tạo submission và result tách rời
INSERT INTO submissions (...) RETURNING id;
INSERT INTO execution_results (...);
-- Nếu bước 2 fail → submission dangling, data sai

-- GOOD: 1 transaction
BEGIN;
  INSERT INTO submissions (...);
  INSERT INTO execution_results (...);
COMMIT;
-- All or nothing
```

**Concurrent Submit Test (same user):**
- User click Run button 5 lần nhanh liên tiếp từ cùng một tài khoản
- Verify chỉ có 1 request tạo `PENDING` submission
- Verify 4 request còn lại trả `409 SUBMISSION_ALREADY_PENDING`
- Verify DB chỉ tăng đúng 1 submission row cho user đó
- Verify partial unique index / DB constraint là lớp chặn cuối cùng nếu 2 request cùng vượt qua app-layer check

**Concurrent Submit Test (different users):**
- 10 user khác nhau submit cùng lúc
- Verify hệ thống chấp nhận và xử lý được ít nhất 10 submission đồng thời
- Verify không lost result, không duplicate row

**Judge0 Callback Race:**
- Submit code → Judge0 token = "abc"
- Judge0 processing, callback sắp về
- Callback/webhook từ Judge0 bị chậm hoặc tạm thời chưa tới
- Judge0 callback đến TRƯỚC DB insert hoàn tất
- Callback handler: verify `X-Judge0-Callback-Secret` trước
- Nếu secret hợp lệ: kiểm tra submission có tồn tại không? Nếu không → queue for retry
- Nếu secret sai/thiếu: trả `401`, không queue retry, log security event
- Verify: không duplicate result, không lost result

**Test Code:**
```javascript
// Same-user concurrency guard test
Promise.all([
  submitCode({...}),  // Submit 1
  submitCode({...}),  // Submit 2
  submitCode({...}),  // Submit 3
])
.then(() => {
  // Verify exactly 1 request accepted
  // Verify DB: COUNT(*) increases by 1 for this user
  // Verify remaining requests return 409 SUBMISSION_ALREADY_PENDING
})

// Callback race test
mockJudge0Callback({...});  // Callback arrive
setTimeout(() => {
  // DB insert not complete yet
}, 100);
```

---

### 3.3 Email Verification (PHẢI CHI TIẾT)

**Flow:**
1. User register email/password
2. Server gửi verification email với link
3. Link format: `https://app.com/verify?token=xyz123` (token expire sau 24h)
4. User click link → server verify token → activate account
5. User login được

**Test Case:**
```
1. Register email hợp lệ
   → verify email gửi được (mock email service)
   → link trong email đúng format
   
2. Click verification link
   → account status = verified
   → user có thể login
   
3. Link hết hạn (> 24h)
   → click link → error "Link đã hết hạn"
   → user có thể request resend email
   
4. Resend verification email
   → link mới valid
   
5. Login trước khi verify
   → error "Vui lòng xác thực email trước"
   
6. Register 2 account cùng email
   → error "Email đã tồn tại"
```

---

### 3.4 Judge0 Failure Handling (PHẢI CHI TIẾT)

**Các failure scenario:**

| Scenario | Xử lý |
|----------|-------|
| Judge0 timeout (30s) | Retry 3x (1s→2s→4s), nếu vẫn fail → SYSTEM_ERROR |
| Judge0 return 5xx | Retry exponential backoff, queue for async retry |
| Judge0 queue full | Backend queue hữu hạn; nếu đầy thì reject ngay với `503 Service Unavailable`, không drop silently |
| WebSocket disconnect | Client reconnect auto với backoff, resubscribe session/submission stream, viewer thấy "Mất kết nối" |
| Database slow (> 5s) | Timeout, retry safe operation, error message |
| Judge0 callback secret invalid | Reject `401`, log security event, không xử lý business logic |

**Health Check:**
- Monitor Judge0 uptime mỗi 30 giây
- Nếu 5xx error rate > 10% trong 5 phút → alert ops
- Nếu Judge0 down → disable Run button, show "Judge0 tạm ngừng"

---

## 4. Chiến Lược Xử Lý Lỗi (Error Strategy)

### 4.1 Phân Loại Lỗi

#### A. Validation Error (Lỗi input)
**Nguyên nhân:** User input không hợp lệ  
**HTTP Status:** 400  
**Ví dụ:**
- Quên chọn ngôn ngữ
- Code rỗng
- Code > 1MB

**Message:** `"Vui lòng chọn ngôn ngữ trước khi chạy code."`

---

#### B. Authentication Error (Chưa đăng nhập)
**HTTP Status:** 401  
**Ví dụ:**
- Access token thiếu
- Access token hết hạn (> 15 phút)
- Access token signature không đúng

**Message:** `"Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."`

---

#### C. Authorization Error (Không đủ quyền)
**HTTP Status:** 403  
**Ví dụ:**
- Viewer cố chạy code
- User xem submission của người khác
- User cố join session bằng join code sai hoặc khi sharing đã tắt
- User thường cố tạo câu hỏi (admin only)

**Message:** `"Bạn không có quyền thực hiện chức năng này."`

---

#### D. Business Logic Error (Rule violated)
**HTTP Status:** 409 hoặc 422  
**Ví dụ:**
- Câu hỏi đã archive
- User đã có submission `PENDING` và bấm Run/Submit lần nữa → `409`
- Session đã kết thúc → `410` nếu join/rejoin session
- Không có test case cho question → `422`

**Message:** `"Phiên làm bài đã kết thúc. Bạn không thể tiếp tục chạy code."`

---

#### E. Execution Error từ Judge0 (EXPECTED)
**HTTP Status:** 200 (submission saved)  
**Status values:**
- ✅ **ACCEPTED** → code đúng
- ❌ **COMPILATION_ERROR** (Compile Error) → hiển thị compiler message
- ❌ **RUNTIME_ERROR** (Runtime Error) → hiển thị stderr
- ❌ **TIME_LIMIT_EXCEEDED** (Time Limit Exceeded) → "Chương trình vượt 10 giây"
- ❌ **MEMORY_LIMIT_EXCEEDED** (Memory Limit Exceeded) → "Vượt 256MB bộ nhớ"
- ❌ **WRONG_ANSWER** (Wrong Answer) → "Output: ..., Expected: ..."

**Xử lý:** Lưu đầy đủ vào DB, hiển thị UI rõ ràng, không alert ops

---

#### F. Integration Error (Dịch vụ ngoài fail)
**HTTP Status:** 503 (Service Unavailable)  
**Ví dụ:**
- Judge0 timeout
- Judge0 return 5xx
- Database timeout
- WebSocket server down

**Xử lý:**
- Retry với exponential backoff: 1s → 2s → 4s (max 3x)
- Nếu vẫn fail → queue for async retry
- User message: `"Hệ thống tạm thời không khả dụng. Vui lòng thử lại sau."`
- Alert ops nếu failure rate > ngưỡng

---

#### G. System Error (Internal bug)
**HTTP Status:** 500  
**Ví dụ:**
- Database connection lost
- Null reference exception
- Transaction rollback
- Unexpected error

**Xử lý:**
- Log full stack trace (internal only)
- Gắn request ID để debug
- Rollback partial state
- User message: `"Đã xảy ra lỗi. Vui lòng thử lại sau."`
- Alert ops immediately

---

### 4.2 Error Response Format

**Standard JSON response:**
```javascript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Vui lòng chọn ngôn ngữ",
    "details": { "field": "language" }
  },
  "request_id": "req_abc123xyz789"  // Debugging
}
```

---

### 4.3 Logging & Monitoring

**Metric cần track:**
- Submission success rate (%)
- Judge0 uptime (%)
- Realtime sync latency (P50/P95/P99)
- API response time (P50/P95/P99)
- Error rate by type

**Alert thresholds:**
- Judge0 5xx > 10% trong 5 phút → page ops
- Realtime latency P95 > 1000ms → warning
- DB connection pool cạn → page ops
- Submission queue depth > 100 → warning

**Log fields:**
```
timestamp, user_id, action, language, status,
execution_time_ms, judge0_latency_ms, error_type, request_id
```

---

## 5. Test Matrix Tóm Tắt

| Chức năng | Unit | Integration | E2E | Performance | Security |
|-----------|------|-------------|-----|-------------|----------|
| **Code Editor** | ✅ | ✅ | ✅ | ⚠️ | ✅ XSS |
| **Code Execution** | ✅ | ✅ | ✅ | ✅ | ✅ Sandbox |
| **Realtime Sync** | ✅ Order/Dedup | ✅ | ✅ | ✅ | ✅ |
| **RBAC & Auth** | ✅ | ✅ | ✅ | - | ✅ |
| **Hidden Test Case** | ✅ | ✅ | ✅ | - | ✅ DTO |
| **History** | ✅ Trans | ✅ Consistency | ✅ | ⚠️ | - |
| **Email Verify** | ✅ | ✅ | ✅ | - | - |
| **Dashboard** | - | ✅ | ✅ | ⚠️ Query | - |

---

## 6. Công Cụ & Chuẩn Bị

**Unit & Integration Test:**
- Jest hoặc Vitest
- Docker Compose (local Judge0)
- PostgreSQL test database

**E2E Test:**
- Playwright hoặc Cypress

**Performance Test:**
- K6 (load test)
- Lighthouse (page speed)
- Browser DevTools

**Security Test:**
- OWASP ZAP
- Manual penetration testing

**Test Data:**
- 1 Admin + 4 User
- 3 sample questions (easy, medium, hard)
- 5 test cases per question

---

## 7. Tiêu Chí Thành Công

✅ Unit test pass >80% coverage  
✅ Integration test pass (critical paths)  
✅ E2E test pass (5 main flow)  
✅ Performance: realtime < 1s, API < 500ms  
✅ Security: XSS/SQLi test pass, sandbox isolated  
✅ Load test: 10+ concurrent submission từ các user khác nhau  
✅ Judge0 down → graceful error, system stable  
✅ No Critical/High severity bugs  

---
