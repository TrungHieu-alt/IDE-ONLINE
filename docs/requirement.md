# REQUIREMENT DOCUMENT
## Online Code Editor Platform

**Project Name:** Online Code Editor  
**Version:** 2.0  
**Date:** March 2026  
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

## 3. STAKEHOLDER

| Stakeholder | Role | Responsibility |
|-------------|------|----------------|
| Project Supervisor | Project oversight | Định hướng mục tiêu dự án, review requirement document và đánh giá kết quả demo. |
| Project Team | System development | Thiết kế, triển khai và tích hợp các thành phần của hệ thống như frontend, backend, realtime sync và code execution. |
| End Users (Coder / Viewer) | Platform users | Sử dụng hệ thống để viết code, chạy chương trình và cung cấp feedback về trải nghiệm sử dụng. |

## 4. FUNCTIONAL REQUIREMENTS

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

## 5. NON-FUNCTIONAL REQUIREMENTS

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

## 6. USER ROLES & PERMISSIONS
*Ký hiệu: ✅ (Được phép) | ❌ (Từ chối) | ⚠️ (Có điều kiện)*

| Nhóm Tài Nguyên (Resources)  | Hành động (Actions)                                      |                           Coder                           |                      Viewer                     | Admin |
| :--------------------------- | :------------------------------------------------------- | :-------------------------------------------------------: | :---------------------------------------------: | :---: |
| **Authentication / Account** | Đăng ký tài khoản                                        |                             ✅                             |                        ✅                        |   ✅   |
|                              | Đăng nhập / Đăng xuất                                    |                             ✅                             |                        ✅                        |   ✅   |
|                              | Xem hồ sơ cá nhân của chính mình                         |                             ✅                             |                        ✅                        |   ✅   |
|                              | Cập nhật hồ sơ cá nhân của chính mình                    |                             ✅                             |                        ✅                        |   ✅   |
|                              | Xem hồ sơ người dùng khác                                |                             ❌                             |                        ❌                        |   ✅   |
| **Code Editor / Session**    | Tạo phiên code mới                                       |                             ✅                             |                        ❌                        |   ✅   |
|                              | Chỉnh sửa code trong editor                              |                             ✅                             |                        ❌                        |   ✅   |
|                              | Chọn ngôn ngữ lập trình                                  |                             ✅                             |                        ❌                        |   ✅   |
|                              | Xem code đang được viết realtime                         | ⚠️ *(Chỉ session của chính mình hoặc được cấp quyền xem)* |                        ✅                        |   ✅   |
|                              | Tham gia session với quyền chỉ xem                       |                             ❌                             |                        ✅                        |   ✅   |
|                              | Chỉnh sửa code trong session của người khác              |                             ❌                             |                        ❌                        |   ✅   |
| **Code Execution**           | Chạy code (Run)                                          |                             ✅                             |                        ❌                        |   ✅   |
|                              | Xem kết quả chạy code của chính mình                     |                             ✅                             |                        ❌                        |   ✅   |
|                              | Xem kết quả chạy code realtime của session đang theo dõi | ⚠️ *(Chỉ session của chính mình hoặc được cấp quyền xem)* |                        ✅                        |   ✅   |
|                              | Dừng / hủy execution đang chạy                           |            ⚠️ *(Chỉ execution của chính mình)*            |                        ❌                        |   ✅   |
| **History / Submissions**    | Xem lịch sử run / submit của chính mình                  |                             ✅                             |                        ❌                        |   ✅   |
|                              | Xem chi tiết submission của chính mình                   |                             ✅                             |                        ❌                        |   ✅   |
|                              | Xem submission của người khác                            |                             ❌                             | ⚠️ *(Chỉ các session được phân quyền theo dõi)* |   ✅   |
|                              | Xóa lịch sử submission của người khác                    |                             ❌                             |                        ❌                        |   ✅   |
| **Questions**                | Xem danh sách câu hỏi                                    |                             ✅                             |                        ✅                        |   ✅   |
|                              | Xem chi tiết câu hỏi                                     |                             ✅                             |                        ✅                        |   ✅   |
|                              | Tạo câu hỏi mới                                          |                             ❌                             |                        ❌                        |   ✅   |
|                              | Cập nhật câu hỏi                                         |                             ❌                             |                        ❌                        |   ✅   |
|                              | Xóa câu hỏi                                              |                             ❌                             |                        ❌                        |   ✅   |
| **Test Cases**               | Xem test case mẫu (public/sample)                        |                             ✅                             |                        ✅                        |   ✅   |
|                              | Xem test case ẩn (hidden)                                |                             ❌                             |                        ❌                        |   ✅   |
|                              | Tạo / sửa / xóa test case                                |                             ❌                             |                        ❌                        |   ✅   |
| **Users & RBAC**             | Xem danh sách user                                       |                             ❌                             |                        ❌                        |   ✅   |
|                              | Khóa / mở khóa tài khoản                                 |                             ❌                             |                        ❌                        |   ✅   |
|                              | Xóa tài khoản                                            |                             ❌                             |                        ❌                        |   ✅   |
|                              | Phân quyền (gán role)                                    |                             ❌                             |                        ❌                        |   ✅   |
| **System / Monitoring**      | Xem dashboard hệ thống                                   |                             ❌                             |                        ❌                        |   ✅   |
|                              | Xem tất cả submissions / logs / execution metrics        |                             ❌                             |                        ❌                        |   ✅   |


---

## 7. TECHNOLOGY STACK

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
┌───▼──┐    ┌────▼─────┐   ┌──▼────────┐
│Judge0│    │PostgreSQL│   │Redis(opt) │
│      │    │(DB)      │   │(Cache)    │
└──────┘    └──────────┘    ───────────┘
```

## 9. KEY DESIGN DECISIONS

| Decision | Rationale |
|----------|-----------|
| **Judge0 Selfhost** | Kiểm soát tài nguyên, isolation, cost-effective |
| **WebSocket 1-way sync** | Chỉ cần Coder → Viewer, không cần conflict resolution |
| **JWT Auth** | Stateless, scalable, không cần session storage |
| **PostgreSQL** | ACID compliance, relation data, transaction support |
| **Docker Compose** | Dễ deploy, tất cả trong 1 package (Judge0 + app + DB) |
| **Debounce 300ms** | Cân bằng realtime vs network load |

---

## 15. SUCCESS CRITERIA

✅ User đăng ký, login, chọn câu hỏi  
✅ Viết code, click Run, nhận kết quả trong < 2s  
✅ Realtime sync code Coder → Viewer realtime  
✅ Admin tạo test case, auto-grade submission  
✅ Isolation: Code user A không truy cập user B  
✅ 10 concurrent submissions không timeout  



---

**Document Owner:** Project Team  
**Last Updated:** March 2026  
**Review Date:** TBD




