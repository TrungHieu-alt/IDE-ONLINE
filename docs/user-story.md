# 1️⃣ USER STORIES - PROJECT A: Online Code Editor

**Phiên bản:** 2.0  
**Ngày cập nhật:** Tháng 3, 2026  
**Tổng số:** 19 User Stories (MVP)

---

## 📝 Format Chuẩn User Story

```
AS A [Vai trò người dùng]
I WANT [Hành động/Tính năng]
SO THAT [Lợi ích/Mục đích]

ACCEPTANCE CRITERIA:
• [ ] Tiêu chí 1
• [ ] Tiêu chí 2
• [ ] Tiêu chí 3
```

---

## 🔐 AUTHENTICATION & USER MANAGEMENT

### US01 - Đăng Ký Tài Khoản

**AS A** Người dùng mới  
**I WANT** Đăng ký tài khoản với email và mật khẩu  
**SO THAT** Tôi có thể truy cập vào hệ thống viết code online

**ACCEPTANCE CRITERIA:**

- [ ] Email phải là duy nhất trong hệ thống
  - Nếu email đã tồn tại → trả về lỗi `409 Conflict`
  - Email format hợp lệ: `^[^\s@]+@[^\s@]+\.[^\s@]+$`

- [ ] Mật khẩu phải đáp ứng yêu cầu bảo mật
  - Tối thiểu 8 ký tự
  - Chứa ít nhất: 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
  - Nếu không đủ → trả về `400 Bad Request` với chi tiết lỗi

- [ ] Mật khẩu được hash trước khi lưu vào database
  - Sử dụng bcrypt với salt rounds ≥ 10
  - Không được lưu mật khẩu gốc

- [ ] Trả về thông báo thành công
  - HTTP `201 Created`
  - Response body: `{user_id, email, role, created_at}`

- [ ] Email được chuẩn hóa thành chữ thường trước lưu
  - Prevent duplicate với casing khác nhau

---

### US02 - Đăng Nhập

**AS A** Người dùng đã đăng ký  
**I WANT** Đăng nhập vào hệ thống bằng email và mật khẩu  
**SO THAT** Tôi có thể truy cập các chức năng viết code

**ACCEPTANCE CRITERIA:**

- [ ] Hệ thống xác thực email + mật khẩu
  - Tìm user theo email (case-insensitive)
  - Verify password bằng bcrypt.compare()

- [ ] Thành công → Trả về access token + refresh token
  - Access token payload: `{user_id, email, role, auth_version, iat, exp}`
  - Access token expiry: 15 phút
  - Đồng thời trả về refresh token opaque
  - Refresh token expiry: 30 ngày
  - HTTP `200 OK`
  - Response: `{access_token, refresh_token, token_type: "Bearer", expires_in: 900, refresh_expires_in: 2592000, user: {...}}`

- [ ] Remember session bằng refresh token rotation
  - Endpoint: `POST /api/auth/refresh`
  - Refresh token hợp lệ → cấp access token mới + refresh token mới
  - Refresh token cũ bị revoke ngay sau khi rotate
  - Logout → revoke refresh token

- [ ] Thất bại → Trả về lỗi xác thực rõ ràng
  - Email không tồn tại → `401 Unauthorized`
  - Mật khẩu sai → `401 Unauthorized`
  - **Không được tiết lộ email tồn tại hay không**
  - Message: "Thông tin đăng nhập không chính xác"

- [ ] Rate limiting để chống brute force
  - Max 5 failed login attempts per 5 minutes per IP
  - Trả về `429 Too Many Requests` nếu vượt limit

- [ ] HTTPS only - không dùng HTTP

---

### US03 - Phân Quyền Người Dùng (RBAC)

**AS A** Admin  
**I WANT** Gán role cho người dùng  
**SO THAT** Tôi có thể kiểm soát quyền truy cập hệ thống

**ACCEPTANCE CRITERIA:**

- [ ] Admin có thể gán 3 role:
  - `ADMIN`: Quản lý toàn hệ thống (câu hỏi, người dùng, quyền)
  - `CODER`: Viết code, run code, submit bài (ứng viên)
  - `VIEWER`: Xem code realtime (interviewer) - read-only

- [ ] User thường không thể tự thay đổi role của mình
  - Endpoint: `PATCH /api/me/role` → `403 Forbidden`

- [ ] API kiểm tra permission trước xử lý
  - Nếu không đủ quyền → `403 Forbidden`
  - Response: `{error: "Insufficient permissions"}`
  - Log unauthorized access attempts (audit trail)

- [ ] Permission matrix rõ ràng:
  - ADMIN: tất cả endpoints
  - CODER: viết code, run, submit, xem lịch sử riêng
  - VIEWER: xem code realtime (trong session), NOT edit

- [ ] Endpoint gán role: `PATCH /api/admin/users/{user_id}/role`
  - Body: `{role: "CODER"}`
  - Chỉ ADMIN mới có quyền
  - Trả về `200 OK` + user object updated

---

## ✏️ CODE EDITOR & INPUT/OUTPUT

### US04 - Web-Based Code Editor

**AS A** Coder  
**I WANT** Viết code trực tiếp trên trình duyệt có syntax highlighting  
**SO THAT** Tôi không cần cài IDE trên máy

**ACCEPTANCE CRITERIA:**

- [ ] Editor hỗ trợ Syntax Highlighting cho các ngôn ngữ:
  - C, C++, JavaScript, TypeScript, Java, C#, Python, PHP, Dart

- [ ] Tính năng editor:
  - Code completion (autocomplete)
  - Line numbers
  - Auto-indent (tab/space configurable)
  - Search & Replace (Ctrl+H)
  - Undo/Redo
  - Code folding
  - Dark/Light theme

- [ ] Hiệu năng:
  - Minimal latency khi gõ (<100ms)
  - Rendering smooth (60fps khi scroll)
  - Không lag khi code dài

- [ ] Code size limit:
  - Max 1MB
  - Nếu vượt → warning "Code quá lớn (max 1MB)"
  - Disable Run/Submit button

- [ ] Auto-save draft code:
  - Save vào browser's IndexedDB mỗi 3 giây
  - Khi refresh page → recover draft từ IndexedDB
  - Clear draft khi user explicitly submit

- [ ] Sử dụng Monaco Editor (VS Code engine)

---

### US05 - Chọn Ngôn Ngữ Lập Trình

**AS A** Coder  
**I WANT** Chọn ngôn ngữ từ dropdown  
**SO THAT** Hệ thống compile & chạy code đúng environment

**ACCEPTANCE CRITERIA:**

- [ ] Dropdown chọn ngôn ngữ rõ ràng
  - Default language: JavaScript
  - Hỗ trợ 9 ngôn ngữ

- [ ] Khi đổi ngôn ngữ:
  - Syntax highlight tự động cập nhật
  - Code completion keywords update
  - Code content được giữ nguyên (không xóa)

- [ ] Language persistence:
  - Ngôn ngữ được save trong session
  - Khi user quay lại → restore language cũ

- [ ] Mapping ngôn ngữ sang Judge0 language_id:
  ```
  C → 50
  C++ → 54
  JavaScript → 63
  TypeScript → 74
  Java → 62
  C# → 51
  Python → 71
  PHP → 68
  Dart → 90
  ```

- [ ] Validation trước submit:
  - Validate language_id được chọn
  - Nếu invalid → warning + prevent submit

---

### US04.1 - Input/Output Management

**AS A** Coder  
**I WANT** Nhập input để kiểm tra code và xem output  
**SO THAT** Tôi có thể debug chương trình

**ACCEPTANCE CRITERIA:**

- [ ] Textarea để nhập input:
  - Hỗ trợ multi-line input
  - Max size: 100KB
  - Placeholder: "Nhập input ở đây (nếu cần)"

- [ ] Console box hiển thị output:
  - Hiển thị stdout (màu trắng/đen)
  - Hiển thị stderr (màu đỏ)
  - Hiển thị execution info: time, memory (màu xám)
  - Scrollable nếu output dài

- [ ] Output size limit:
  - Max 100KB display
  - Nếu vượt → truncate với message "... output truncated"

- [ ] Clear buttons:
  - "Clear Input" → reset textarea
  - "Clear Output" → reset console
  - Cả hai visible bên cạnh input/output

- [ ] Input caching:
  - Cache input trong session hiện tại
  - Khi close tab/refresh → input lost (normal)

- [ ] UI layout rõ ràng:
  - Code editor: 60% width
  - Input + Output: 40% width
  - Responsive design

---

## ⚙️ CODE EXECUTION & GRADING

### US06 - Chạy Code (Run)

**AS A** Coder  
**I WANT** Nhấn "Run" để chạy code của mình  
**SO THAT** Tôi có thể kiểm tra output trước khi submit

**ACCEPTANCE CRITERIA:**

- [ ] Run code flow:
  1. User nhấn "Run" button
  2. Frontend gửi: `POST /api/submissions/run`
  3. Body: `{source_code, language_id, stdin}`
  4. Backend tạo submission status `PENDING`, gửi request đến Judge0
  5. API trả về ngay: `{submission_id, status: "PENDING"}`
  6. Frontend poll submission detail hoặc nhận WebSocket event
  7. Kết quả cuối: stdout, stderr, status, time, memory

- [ ] Execution constraints:
  - Max time: 10 giây (wall-time)
  - Max memory: 256 MB
  - Nếu vượt → return `TIME_LIMIT_EXCEEDED` hoặc `MEMORY_LIMIT_EXCEEDED`

- [ ] Initial response format:
  ```json
  {
    "success": true,
    "data": {
      "submission_id": "sub-uuid",
      "type": "RUN",
      "status": "PENDING"
    }
  }
  ```

- [ ] Prevent concurrent execution:
  - While running → disable Run & Submit buttons
  - Show spinner + progress indicator
  - Re-enable khi execution complete

- [ ] Timeout handling:
  - Code không return sau 10s → kill process
  - Return status `TIME_LIMIT_EXCEEDED`

---

### US07 - Hiển Thị Lỗi Khi Chạy Code

**AS A** Coder  
**I WANT** Xem chi tiết lỗi compile/runtime  
**SO THAT** Tôi có thể debug code

**ACCEPTANCE CRITERIA:**

- [ ] Hiển thị 5 loại status:
  - ✅ **ACCEPTED** (xanh): Code chạy đúng
  - ⚠️ **WRONG_ANSWER** (vàng): Output sai
  - ❌ **COMPILATION_ERROR** (đỏ): Lỗi compile
  - ❌ **RUNTIME_ERROR** (đỏ): Lỗi runtime
  - ⏱️ **TIME_LIMIT_EXCEEDED** (cam): Timeout

- [ ] Compilation Error:
  - Hiển thị line number + error message
  - VD: `error: expected ';' before '}' at line 5`
  - Monaco Editor: underline error line in red

- [ ] Runtime Error:
  - Hiển thị exit code + message
  - VD: `Segmentation Fault (exit code 139)`
  - Hiển thị stderr content

- [ ] Time Limit Exceeded:
  - Message: "Chương trình vượt quá 10 giây"
  - Gợi ý: optimize algorithm, check infinite loops

- [ ] Memory Limit Exceeded:
  - Message: "Chương trình vượt quá 256MB bộ nhớ"
  - Gợi ý: reduce data structures

- [ ] Error formatting:
  - Clear, readable format
  - NO stack traces (keep UX clean)
  - Actionable messages

---

### US12 - Tự Động Chấm Bài (Auto-Grading)

**AS A** Coder  
**I WANT** Submit code và hệ thống tự động chấm  
**SO THAT** Tôi biết lời giải đúng hay sai

**ACCEPTANCE CRITERIA:**

- [ ] Submit flow:
  1. User nhấn "Submit" button
  2. Frontend gửi: `POST /api/submissions/submit`
  3. Body: `{question_id, source_code, language_id}`
  4. Backend fetch câu hỏi + tất cả test cases (public + hidden)
  5. Backend tạo submission `PENDING` và queue grading
  6. API trả về ngay `submission_id`
  7. Run code với mỗi test case
  8. So sánh output với expected output
  9. Aggregate kết quả

- [ ] Execute tất cả test cases:
  - Public test cases (visible output)
  - Hidden test cases (output hidden)
  - Timeout per test case: 10 seconds
  - Continue next test even if one fails

- [ ] Overall status determination:
  - Nếu ALL PASS → `ACCEPTED` ✅
  - Nếu some fail → `WRONG_ANSWER` ⚠️
  - Nếu có bất kỳ time limit exceeded → `TIME_LIMIT_EXCEEDED` ⏱️
  - Nếu có bất kỳ runtime error → `RUNTIME_ERROR` ❌
  - Nếu compile error → `COMPILATION_ERROR` ❌

- [ ] Final result format:
  ```json
  {
    "overall_status": "WRONG_ANSWER",
    "passed_count": 5,
    "total_count": 8,
    "test_results": [
      {
        "test_case_id": "tc1",
        "is_hidden": false,
        "status": "ACCEPTED",
        "expected_output": "15",
        "actual_output": "15",
        "execution_time": "0.12s"
      }
    ]
  }
  ```

- [ ] Public vs Hidden test cases:
  - Public test: show expected + actual output
  - Hidden test: show only status (PASSED/FAILED)
  - **Không hiển thị chi tiết hidden test**

- [ ] Prevent duplicate submit:
  - Debounce Submit button (500ms)
  - Disable button while grading

- [ ] Save submission:
  - Create submissions record với: user_id, question_id, code, language_id, status, results

---

### US12.1 - Hiển Thị Kết Quả Chấm Chi Tiết

**AS A** Coder  
**I WANT** Xem chi tiết kết quả chấm từng test case  
**SO THAT** Tôi biết test nào pass/fail để debug

**ACCEPTANCE CRITERIA:**

- [ ] Result summary:
  - Large status badge: ✅ ACCEPTED hoặc ⚠️ WRONG_ANSWER
  - Progress: "5 / 8 test cases passed"

- [ ] Test case details table:
  ```
  | # | Public? | Status | Expected | Actual | Time |
  |---|---------|--------|----------|--------|------|
  | 1 | ✓ | ✅ PASS | "15" | "15" | 0.12s |
  | 2 | ✓ | ❌ FAIL | "10" | "5" | 0.08s |
  | 3 | ✗ | ✅ PASS | [hidden] | [hidden] | 0.15s |
  ```

- [ ] Expandable test details:
  - Click row → expand để xem full input/output
  - For public tests: show input, expected, actual
  - For hidden tests: only show status

- [ ] Actions:
  - "Edit & Retry" button → quay lại editor, giữ code
  - "View Submission History" button

---

## 📚 QUESTION & TEST CASE MANAGEMENT

### US10 - Tạo Câu Hỏi Lập Trình

**AS A** Admin  
**I WANT** Tạo câu hỏi với mô tả, mẫu input/output  
**SO THAT** Coder có bài tập để giải

**ACCEPTANCE CRITERIA:**

- [ ] Question structure:
  - `title`: required, max 200 chars, min 5 chars
  - `description`: markdown, required, max 5000 chars
    - Bao gồm problem statement, sample input, sample output, notes nếu có
  - `difficulty`: enum (EASY / MEDIUM / HARD)
  - `time_limit`: 1-10 seconds (default 1)
  - `memory_limit`: 32-256 MB (default 64)
  - `is_published`: boolean (default false)

- [ ] Endpoint:
  - `POST /api/admin/questions`
  - Auth: only ADMIN role
  - Return: `201 Created` + question object with question_id

- [ ] Markdown support:
  - Allow code blocks: ` ```c ... ``` `
  - Allow lists, tables, links, bold/italic
  - Client render markdown properly

- [ ] Sample input/output:
  - Nhúng trực tiếp trong `description` dưới dạng markdown/code block
  - Displayed to coder trước khi code
  - NOT used for grading

- [ ] Publishing:
  - Created with `is_published: false`
  - Admin phải explicitly publish
  - Unpublished questions NOT visible to CODER/VIEWER

---

### US11 - Quản Lý Test Case

**AS A** Admin  
**I WANT** Tạo test cases (input/output pairs) cho câu hỏi  
**SO THAT** Hệ thống tự động chấm code

**ACCEPTANCE CRITERIA:**

- [ ] Test case structure:
  - `question_id`: required (foreign key)
  - `input`: required, max 10,000 chars
  - `expected_output`: required, max 10,000 chars
  - `is_hidden`: boolean (default false)
    - Public: visible để coder test
    - Hidden: dùng để chấm secret
  - `order`: integer, for display order

- [ ] Create test case:
  - `POST /api/admin/questions/{question_id}/test_cases`
  - Auth: only ADMIN role
  - Validation: question exists, input/output not empty
  - Return: `201 Created`

- [ ] List test cases:
  - `GET /api/admin/questions/{question_id}/test_cases`
  - List all public + hidden test cases
  - Include is_hidden flag

- [ ] Minimum requirement:
  - ≥1 public test case để coder tìm hiểu
  - Recommended: 3-5 hidden test cases để chấm

- [ ] Admin có quyền sửa hoặc xóa test cases:
  - `PUT /api/admin/test_cases/{test_case_id}`
  - `DELETE /api/admin/test_cases/{test_case_id}`

---

## 🎥 REALTIME COLLABORATION

### US14 - Tạo Coding Session

**AS A** Coder  
**I WANT** Tạo session coding để viewer xem tôi viết code  
**SO THAT** Interviewer có thể theo dõi realtime

**ACCEPTANCE CRITERIA:**

- [ ] Session creation:
  - Button "Start Live Session" in editor
  - Click → generate unique session_id (UUID v4)
  - Create session record in DB
  - Display session link: `app.com/session/{session_id}`
  - Display copy-able URL + session ID

- [ ] Session structure:
  - `session_id`: UUID (primary key)
  - `coder_id`: user_id (host)
  - `question_id`: optional
  - `status`: "active" / "closed"
  - `created_at`, `ended_at`

- [ ] Session lifecycle:
  - Active = coder connected
  - Multiple viewers can join
  - Auto-closes 5 min after coder disconnect
  - Coder can manually close

- [ ] Sharing:
  - Display session link prominently
  - "Copy Link" button → copy to clipboard
  - Share via email/chat

---

### US14.1 - Xem Code Realtime (Viewer Join)

**AS A** Viewer (Interviewer)  
**I WANT** Join session coding bằng session ID  
**SO THAT** Tôi xem code của coder realtime

**ACCEPTANCE CRITERIA:**

- [ ] Join methods:
  1. Direct link: `app.com/session/{session_id}` (auto-join)
  2. Join dialog: paste session_id, click "Join"

- [ ] Validation:
  - Session exists: `404 Not Found` if invalid
  - Session active: `410 Gone` if closed
  - User authenticated: `401 Unauthorized` if not logged in

- [ ] Permission check:
  - Session public-by-link cho user đã đăng nhập có role VIEWER, CODER hoặc ADMIN
  - Return: `403` if permission denied

- [ ] Join response:
  - `200 OK` + session data:
    ```json
    {
      "session_id": "...",
      "coder_id": "user123",
      "coder_name": "Alice",
      "current_code": "...",
      "viewers": ["viewer1", "viewer2"],
      "websocket_url": "wss://api.com/session/550e8400.../ws"
    }
    ```

- [ ] Error handling:
  - Session not found: "❌ Session không tồn tại"
  - Session ended: "❌ Coding session đã kết thúc"

---

### US13 - Đồng Bộ Code Realtime (Coder → Viewer)

**AS A** Viewer  
**I WANT** Xem code của coder cập nhật realtime  
**SO THAT** Tôi theo dõi quá trình viết code

**ACCEPTANCE CRITERIA:**

- [ ] Realtime sync architecture:
  - Tech: WebSocket (Socket.IO hoặc native WebSocket)
  - Coder editor → onChange event → debounce 300ms → send server
  - Server broadcast to all viewers in session
  - Viewer receives → update Monaco Editor (read-only)
  - Latency target: <1 second (P95)

- [ ] Sync events:
  - Event: `code_changed`
  - Payload: `{session_id, code_content, language_id, timestamp}`
  - Debouncing: max 1 event per 300ms (not per keystroke)

- [ ] Viewer editor display:
  - Read-only Monaco Editor
  - Disable: editing, code completion
  - Syntax highlighting: YES
  - Current language visible

- [ ] Connection indicators:
  - Online: "🟢 Coder is online"
  - Offline: "🔴 Coder is offline"
  - Connection quality: "📶 Good" / "📶 Unstable"

- [ ] Handle disconnections:
  - Network drop: show spinner, auto-reconnect every 3s
  - Max retry: 10 times
  - Reconnect: catch up with latest code snapshot

---

### US13.1 - Đồng Bộ Kết Quả Execution Realtime

**AS A** Viewer  
**I WANT** Thấy kết quả execution ngay lập tức khi coder chạy code  
**SO THAT** Biết test case pass/fail realtime

**ACCEPTANCE CRITERIA:**

- [ ] Execution event broadcast:
  - When coder click "Run" → broadcast: `code_executing`
  - Viewer sees: "Running..."

- [ ] Result broadcast:
  - After completion → `execution_completed` event
  - Payload: status, stdout, stderr, time, memory
  - Viewer sees: ✅ ACCEPTED, stdout, time, memory

- [ ] Test case results (Submit):
  - When coder submit → broadcast: `grading_progress`
  - Payload: `{completed: 5, total: 8}`
  - Viewer sees: "Grading 5/8 test cases..."

- [ ] Final result broadcast:
  - Event: `grading_completed`
  - Payload: full grading result table
  - Viewer sees: test results với passed/failed

- [ ] Viewer UI update:
  - Auto-update console output
  - Show/update test case results
  - No manual refresh needed
  - Smooth transitions

---

## 📊 HISTORY & DASHBOARD

### US09 - Xem Lịch Sử Submission

**AS A** Coder  
**I WANT** Xem lại các bài đã nộp  
**SO THAT** Theo dõi quá trình làm bài

**ACCEPTANCE CRITERIA:**

- [ ] Submission list:
  - `GET /api/submissions` (my submissions)
  - List all submissions by current user
  - Fields: submission_id, question title, status, passed/total, timestamp

- [ ] Pagination & filtering:
  - Pagination: default 20/page
  - Filter by: question, date range, status
  - Sort by: timestamp (newest first)
  - Search by: question title

- [ ] Submission detail view:
  - Click submission → expand full details:
    - Code snapshot
    - Language used
    - Test results (passed/failed each test)
    - Execution time, memory
    - Timestamp
  - Read-only view

- [ ] Actions:
  - "View Code" → show in modal
  - "Edit & Retry" → copy code back to editor
  - "Compare with Latest" (optional)

---

### US16 - Admin Dashboard - Xem Tất Cả Submissions

**AS A** Admin  
**I WANT** Xem tất cả submissions của mọi user  
**SO THAT** Giám sát hệ thống

**ACCEPTANCE CRITERIA:**

- [ ] Submissions list:
  - `GET /api/admin/submissions` (all users)
  - Auth: only ADMIN role
  - Fields: user, question, status, passed/total, time, timestamp

- [ ] Advanced filtering:
  - Filter by: user, question, status, date range
  - Search by: user email, question title
  - Sort by: timestamp, user, status

- [ ] Pagination:
  - 50 items/page
  - Database indexing on: user_id, question_id, created_at, status

- [ ] Analytics (optional):
  - Total submissions: 12,345
  - Acceptance rate: 45.2%
  - Average execution time: 0.23s

---

## 🔐 SECURITY & CONSTRAINTS

### US17 - Sandbox Isolation

**AS A** Admin  
**I WANT** Code chạy trong sandbox isolated  
**SO THAT** Code độc/lỗi không phá hoại hệ thống

**ACCEPTANCE CRITERIA:**

- [ ] Judge0 sandbox configuration:
  - Each submission in isolated Docker container
  - Container destroyed after execution
  - Filesystem: isolated tmpfs, no host access
  - Network: disabled (no outbound requests)
  - Process: single process, no fork allowed

- [ ] Forbidden syscalls:
  - fork, vfork, execve: DENY
  - socket, connect: DENY (no network)
  - /etc/passwd read: DENY

- [ ] Resource limits:
  - Wall-time: 10 seconds
  - CPU-time: 8 seconds
  - Memory: 256 MB
  - Output: 100 KB

- [ ] Monitoring:
  - Log resource violations
  - Alert if suspicious activity (fork bomb, memory bomb)

---

## 📋 Danh Sách 15 User Stories

| # | ID | Tên | Epic |
|---|----|----|------|
| 1 | US01 | Đăng Ký Tài Khoản | Auth |
| 2 | US02 | Đăng Nhập | Auth |
| 3 | US03 | Phân Quyền RBAC | Auth |
| 4 | US04 | Web Code Editor | Editor |
| 5 | US05 | Chọn Ngôn Ngữ | Editor |
| 6 | US04.1 | Input/Output Management | Editor |
| 7 | US06 | Chạy Code (Run) | Execution |
| 8 | US07 | Hiển Thị Lỗi | Execution |
| 9 | US12 | Auto-Grading | Execution |
| 10 | US12.1 | Grading Results Display | Execution |
| 11 | US10 | Tạo Câu Hỏi | Content |
| 12 | US11 | Quản Lý Test Cases | Content |
| 13 | US14 | Tạo Coding Session | Collaboration |
| 14 | US14.1 | Join Session (Viewer) | Collaboration |
| 15 | US13 | Code Sync Realtime | Collaboration |
| 16 | US13.1 | Result Sync Realtime | Collaboration |
| 17 | US09 | View Submission History | History |
| 18 | US16 | Admin Dashboard | History |
| 19 | US17 | Sandbox Isolation | Security |

---

**Version:** 2.0  
**Status:** Ready for Development  
**Tổng Story Points (Ước tính):** 150-180 points
