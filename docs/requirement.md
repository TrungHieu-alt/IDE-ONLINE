# REQUIREMENT DOCUMENT
## Online Code Editor Platform

**Project Name:** Online Code Editor  
**Version:** 1.0  
**Date:** March 2025  
**Status:** In Progress

---

## 1. EXECUTIVE SUMMARY

Platform cho phép người dùng viết code online với nhiều ngôn ngữ lập trình, thực thi code trong môi trường sandbox an toàn, hỗ trợ collaboration realtime, và quản lý câu hỏi/test case tự động chấm.

---

## 2. PROJECT SCOPE

### In Scope ✅
- **Code Editor**: Monaco Editor với syntax highlighting các ngôn ngữ (C, C++, JavaScript, TypeScript, Java, C#, Python, PHP, Dart)
- **Code Execution**: Tích hợp Judge0 (selfhost) để compile & run code trong sandbox
- **Realtime Collaboration**: Coder viết code → Viewer xem live (1 chiều)
- **Question & Test Case Management**: Admin tạo câu hỏi + test case, auto-grading
- **User Management**: Register/Login, RBAC (Admin/Coder/Viewer)
- **Submission History**: Lưu history: code, input, output, status, timestamp

### Out of Scope ❌
- Mobile app (chỉ web)
- Video/Audio integration
- AI code suggestion
- Code formatting/beautify
- Ranking

---

## 3. FUNCTIONAL REQUIREMENTS

| ID | Requirement | Description |
|----|-------------|-------------|
| **F1** | Code Editor | Web-based editor (Monaco) với syntax highlight cho 9 ngôn ngữ. Support chọn ngôn ngữ từ dropdown. |
| **F2** | Code Execution | User click **Run** → gửi code đến Judge0 → nhận kết quả (stdout, stderr, status, time, memory) |
| **F3** | Realtime Sync | Coder gõ code → Viewer thấy live realtime (1 chiều, debounce 300ms) |
| **F4** | Question Management | Admin tạo/sửa/xóa câu hỏi (title, description, sample input/output) |
| **F5** | Test Case Management | Admin tạo hidden test case, hệ thống auto-compare output vs expected |
| **F6** | User Registration | User đăng ký email/password, email verification |
| **F7** | User Login | Login JWT, remember session |
| **F8** | Role Assignment | Admin gán role (Admin/Coder/Viewer) cho user |
| **F9** | Submission History | Lưu & display: question, code, language, status, execution time, memory, timestamp |
| **F10** | Admin Dashboard | Xem tất cả submission, filter by user/question/date |

---

## 4. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement | Target |
|----|-------------|--------|
| **NFR1** | Isolation | Code user A không truy cập file/process user B (Judge0 container sandbox) |
| **NFR2** | Resource Limit | Execution time max 10s, Memory max 256MB |
| **NFR3** | Concurrency | Hỗ trợ ≥10 concurrent submissions, queue nếu vượt |
| **NFR4** | Response Time | API response < 500ms, page load < 2s |
| **NFR5** | Realtime Latency | Sync delay < 1 giây |
| **NFR6** | Security | Sandbox chặn fork/network call, JWT auth, HTTPS |
| **NFR7** | Availability | Judge0 down → hiển thị error rõ ràng, auto-retry, không crash system |
| **NFR8** | Database ACID | PostgreSQL transactions, data consistency |

---

## 5. USER ROLES & PERMISSIONS

| Role | Register | Login | Create Question | Create Test Case | Submit Code | View Own Submissions | View All Submissions | Admin Dashboard |
|------|----------|-------|-----------------|------------------|-------------|---------------------|----------------------|-----------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Coder** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Viewer** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Viewer Role Details
- Xem live code Coder đang viết (realtime)
- Xem kết quả execution
- Không được edit code
- Không được submit

---

## 6. TECHNOLOGY STACK

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | React.js | Large ecosystem, compatibility tốt với Monaco Editor |
| **Backend** | NestJS | Modular architecture, scalable, async support |
| **Database** | PostgreSQL | Relational data, ACID, support transactions |
| **Code Execution** | Judge0 (Selfhost) | Sandbox sẵn, hỗ trợ 60+ ngôn ngữ, isolated environment |
| **Realtime** | WebSocket (Socket.io) | Full control, low latency |
| **Code Editor** | Monaco Editor | VS Code engine, syntax highlight, free |
| **Auth** | JWT + bcrypt | Stateless, scalable, secure password hashing |
| **Container** | Docker + Docker Compose | Selfhost Judge0 + app |
| **Cache** (Optional) | Redis | Rate limiting, execution result cache |

---

## 7. DATABASE SCHEMA (High-Level)

```
users
├── id (PK)
├── email (UNIQUE)
├── password_hash
├── role (Admin/Coder/Viewer)
├── created_at

questions
├── id (PK)
├── title
├── description
├── created_by (FK: users.id)
├── difficulty
├── created_at
├── updated_at

test_cases
├── id (PK)
├── question_id (FK: questions.id)
├── input
├── expected_output
├── is_hidden (TRUE/FALSE)
├── created_at

submissions
├── id (PK)
├── user_id (FK: users.id)
├── question_id (FK: questions.id)
├── language
├── source_code
├── status (Accepted/WA/TLE/RE/etc)
├── stdout
├── stderr
├── execution_time (ms)
├── memory (MB)
├── created_at

sessions (for realtime collaboration)
├── id (PK)
├── coder_id (FK: users.id)
├── question_id (FK: questions.id)
├── current_code
├── status (ACTIVE/ENDED)
├── created_at
├── updated_at
```

---

## 8. SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│           Frontend (React.js)                       │
│  - Monaco Editor                                    │
│  - WebSocket client                                 │
│  - Real-time sync                                   │
└────────────────┬────────────────────────────────────┘
                 │ REST API + WebSocket
┌────────────────▼────────────────────────────────────┐
│           Backend (NestJS)                          │
│  - Auth Controller                                  │
│  - Code Editor Service                              │
│  - Question Service                                 │
│  - Submission Service                               │
│  - WebSocket Gateway                                │
└────────────────┬────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐    ┌───▼───┐    ┌──▼────────┐
│Judge0│    │PostgreSQL   │Redis(opt) │
│      │    │(DB)        │(Cache)    │
└──────┘    └─────────────┘───────────┘
```

---

## 9. API ENDPOINTS (Summary)

### Auth
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `POST /auth/logout` - Đăng xuất

### Code Execution
- `POST /submissions` - Submit code
- `GET /submissions/:id` - Lấy chi tiết submission
- `GET /submissions/user/:userId` - Lấy submission của user

### Questions
- `GET /questions` - Lấy danh sách câu hỏi
- `GET /questions/:id` - Chi tiết câu hỏi
- `POST /questions` (Admin only) - Tạo câu hỏi
- `PUT /questions/:id` (Admin only) - Sửa câu hỏi
- `DELETE /questions/:id` (Admin only) - Xóa câu hỏi

### Test Cases
- `POST /questions/:id/test-cases` (Admin only) - Tạo test case
- `DELETE /test-cases/:id` (Admin only) - Xóa test case

### WebSocket Events
- `editor:sync` - Coder gõ code
- `execution:start` - Bắt đầu chạy
- `execution:complete` - Kết quả chạy

---

## 10. KEY DESIGN DECISIONS

| Decision | Rationale |
|----------|-----------|
| **Judge0 Selfhost** | Kiểm soát tài nguyên, isolation, cost-effective |
| **WebSocket 1-way sync** | Simplify, chỉ cần Coder → Viewer, không cần conflict resolution |
| **JWT Auth** | Stateless, scalable, không cần session storage |
| **PostgreSQL** | ACID compliance, relation data, transaction support |
| **Docker Compose** | Dễ deploy, tất cả trong 1 package (Judge0 + app + DB) |
| **Debounce 300ms** | Cân bằng realtime vs network load |

---

## 11. CRITICAL QUESTIONS & ANSWERS

| # | Question | Answer |
|---|----------|--------|
| 1 | **Isolation:** Code user A chạy `ls /` có thấy user B file? | Judge0 container riêng, filesystem tách biệt, auto cleanup |
| 2 | **Infinite loop:** User submit `while(true){}` → sao? | Judge0 `cpu_time_limit=10s` → return TLE status |
| 3 | **Realtime 100 chars/s:** Gửi 100 event/s? | Debounce client-side 300ms → batch changes, ~3-4 event/s |
| 4 | **Judge0 crash:** Submission pending → xử lý? | Retry with exponential backoff, queue, error to user |
| 5 | **History storage:** 1000 users × 50 submit/day = ? | DB metadata, file storage (S3/local) cho code content |
| 6 | **20 users submit cùng:** Judge0 queue? | Config worker, max concurrent 5 → queue others, timeout 30s |

---

## 12. CONSTRAINTS

| Constraint | Value |
|-----------|-------|
| **Max execution time** | 10 seconds |
| **Max memory** | 256 MB |
| **Max code length** | 64 KB |
| **Max concurrent submissions** | 10 |
| **Supported languages** | 9 (C, C++, JS, TS, Java, C#, Python, PHP, Dart) |
| **Realtime sync latency** | < 1 second |

---

## 13. ASSUMPTIONS

- Người dùng có connection ổn định
- Judge0 available 99% uptime
- User không cố gắng hack sandbox (trusted environment)
- Code length < 64KB
- Test case input/output không quá 10MB

---

## 14. RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Judge0 sandbox escape | Critical | Regular security audit, sandboxing best practices |
| Realtime sync lag | Medium | Debounce client, optimize WebSocket |
| Resource exhaustion | High | CPU/memory limit, queue system, rate limiting |
| DB performance | Medium | Index optimization, caching, read replicas (future) |
| Code storage overflow | Medium | Cleanup old submissions, compression |

---

## 15. SUCCESS CRITERIA

✅ User đăng ký, login, chọn câu hỏi  
✅ Viết code, click Run, nhận kết quả trong < 2s  
✅ Realtime sync code Coder → Viewer realtime  
✅ Admin tạo test case, auto-grade submission  
✅ Isolation: Code user A không truy cập user B  
✅ 10 concurrent submissions không timeout  

---

## 16. DELIVERABLES TIMELINE

| Week | Deliverable | Status |
|------|-------------|--------|
| 1 | Requirement Doc + Database Design | ✅ |
| 2 | API Spec + Architecture Diagram | ⏳ |
| 3 | Frontend Setup + Editor Integration | ⏳ |
| 4 | Backend API Implementation | ⏳ |
| 5 | Judge0 Integration + Sandbox Testing | ⏳ |
| 6 | Realtime Collaboration (WebSocket) | ⏳ |
| 7 | Testing + Security Hardening | ⏳ |
| 8 | Deployment + Documentation | ⏳ |

---

## 17. REFERENCES

- [Judge0 Documentation](https://judge0.com/#docs)
- [Judge0 GitHub](https://github.com/judge0/judge0)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Socket.io Documentation](https://socket.io/docs/)

---

**Document Owner:** Project Team  
**Last Updated:** March 2025  
**Review Date:** TBD
