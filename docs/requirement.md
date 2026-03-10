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

| Nhóm Tài Nguyên (Resources) | Hành động (Actions) | Thí sinh (Student) | Người ra đề (Setter) | Quản trị viên (Admin) |
| :--- | :--- | :---: | :---: | :---: |
| **Bài tập (Problems)** | Xem danh sách bài tập (Public) | ✅ | ✅ | ✅ |
| | Tạo bài tập mới | ❌ | ✅ | ✅ |
| | Cập nhật đề bài (Của bản thân tạo) | ❌ | ✅ | ✅ |
| | Cập nhật/Xóa bài (Của người khác) | ❌ | ❌ | ✅ |
| **Chấm bài (Submissions)** | Nộp mã nguồn (Submit Code) | ✅ | ✅ | ✅ |
| | Xem lịch sử & code của chính mình | ✅ | ✅ | ✅ |
| | Xem code của người khác | ⚠️ *(Chỉ khi đã AC)* | ✅ | ✅ |
| **Dữ liệu thử (Test cases)** | Xem test case mẫu (Public) | ✅ | ✅ | ✅ |
| | Quản lý test case ẩn (Thêm/Sửa/Xem) | ❌ | ⚠️ *(Chỉ bài mình tạo)* | ✅ |
| **Người dùng (Users)** | Xem thông tin hồ sơ (Profile) | ✅ | ✅ | ✅ |
| | Khóa/Xóa tài khoản | ❌ | ❌ | ✅ |
| | Phân quyền (Gán Role) | ❌ | ❌ | ✅ |

---

### Giải thích chuyên sâu cho các quyền "Đặc biệt" (Business Logic)

Trong thực tế triển khai, những quyền được đánh dấu ⚠️ không chỉ đơn thuần là kiểm tra vai trò (Role), mà hệ thống (Backend) bắt buộc phải kiểm tra thêm **Logic nghiệp vụ (Business Logic)** để đảm bảo tính chặt chẽ.

### Quyền xem code của người khác (Conditional Permission)
* **Vấn đề:** Thí sinh không được phép xem mã nguồn của thí sinh khác nếu bản thân chưa giải quyết thành công bài toán đó.
* **Giải pháp thiết kế:** Khi API lấy chi tiết bài nộp (VD: `GET /api/submissions/{id}`) được gọi bởi một tài khoản có Role là `Student`, Backend phải thực hiện truy vấn cơ sở dữ liệu để xác minh: Tài khoản đang request (`user_id`) đã từng có bản ghi nộp bài đạt trạng thái `status = 'ACCEPTED'` cho bài tập đó (`problem_id`) hay chưa. Nếu chưa đạt điều kiện, hệ thống từ chối truy cập và trả về mã lỗi **HTTP 403 Forbidden**.

### Quyền sở hữu tài nguyên (Resource Ownership)
* **Vấn đề:** Để tránh phá hoại dữ liệu chéo, một Người ra đề (Setter) không được phép can thiệp (sửa đề, xóa bài, xem test case ẩn) vào bài tập do Người ra đề khác tạo.
* **Giải pháp thiết kế:** Tại các API cập nhật/xóa bài tập, ngoài việc đi qua Middleware kiểm tra Role là `Setter`, hệ thống phải đối chiếu trường `author_id` (ID của người tạo bài tập) trong Database với `user_id` (ID của người đang gửi request). Lệnh chỉ được thực thi khi hai giá trị này khớp nhau. Quy tắc này chỉ được phép bỏ qua (bypass) nếu người dùng có Role là `Admin`.
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

## 10. RỦI RO (RISKS)

### 10.1 Rủi ro về bảo mật

| Rủi ro | Mức độ ảnh hưởng | Mô tả | Biện pháp giảm thiểu |
|--------|-----------------|-------|----------------------|
| Sandbox Escaping | Critical | User cố gắng thoát khỏi sandbox để truy cập hệ thống host | Sử dụng container isolation, seccomp, AppArmor, audit bảo mật định kỳ |
| Tấn công mạng nội bộ | High | Code độc hại cố truy cập các service nội bộ trong mạng | Network isolation, chặn outbound request |
| Tiêu thụ tài nguyên trái phép | High | User submit code để đào coin hoặc chạy vòng lặp tiêu tốn CPU | Giới hạn CPU, memory, time limit |

### 10.2 Rủi ro về hiệu suất & mở rộng

| Rủi ro | Mức độ ảnh hưởng | Mô tả | Biện pháp giảm thiểu |
|--------|-----------------|-------|----------------------|
| Tắc nghẽn hàng đợi | High | Nhiều user submit code cùng lúc làm queue backlog | Queue system (Redis / RabbitMQ), autoscaling workers |
| Đo lường thời gian không nhất quán | Medium | CPU quá tải khiến chương trình bị TLE không công bằng | Dedicated judge worker, CPU quota |
| Chi phí hạ tầng tăng cao | Medium | Sandbox khởi tạo chậm hoặc không tối ưu | Container reuse, lightweight runtime |

## 11. EDGE CASES

| Edge Case | Mức độ ảnh hưởng | Biện pháp giảm thiểu |
|-----------|-----------------|----------------------|
| Output thừa hoặc thiếu 1 dấu cách / xuống dòng | Submission bị chấm sai | Trim whitespace hoặc sử dụng special judge |
| Sai số rất nhỏ (floating point error) | Answer bị đánh sai | So sánh với epsilon (±10^-6) |
| Code quá dài hoặc compile quá lâu | Làm nghẽn hệ thống chấm | Giới hạn code size và compile time |

## 12. ASSUMPTIONS

| Giả định | Mô tả |
|---------|-------|
| Stable Internet | Người dùng có kết nối internet ổn định |
| Judge0 uptime | Judge0 available ~99% uptime |
| Trusted environment | User không cố ý hack sandbox |
| Code size limit | Code length < 64KB |
| Testcase size | Input/Output ≤ 10MB |

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
**Last Updated:** March 2025  
**Review Date:** TBD


