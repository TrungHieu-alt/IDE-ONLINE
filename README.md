# 🖥️ Online Code Editor Platform

> **Version:** 2.0 · **Status:** In Progress · **Date:** March 2026

Nền tảng viết và chạy code online với hỗ trợ nhiều ngôn ngữ lập trình, thực thi code trong môi trường sandbox an toàn, cộng tác realtime và auto-grading.

---

## 📁 Cấu trúc thư mục

```
├── assets/                          # File tài nguyên (SVG diagrams)
│   ├── Backend Component Diagram (Current).svg
│   ├── Context Diagram (Current).svg
│   ├── Frontend Component Diagram (Current).svg
│   └── Online Code Editor App Diagram (Current).svg
│
└── docs/                            # Tài liệu thiết kế hệ thống
    ├── 1. req-and-spec/             # Yêu cầu & đặc tả
    │   ├── requirement.md           # Tài liệu yêu cầu đầy đủ
    │   └── user-story-mapping.md    # User Story Mapping
    │
    ├── 2. basic-design/             # Thiết kế cơ bản
    │   ├── c4-diagram.md            # C4 Architecture Diagram (Level 1–3)
    │   ├── edgecase-detail.md       # Edge Case & Risk Assessment
    │   ├── error-test-strategy.md   # Chiến lược kiểm thử & xử lý lỗi
    │   ├── security-consideration.md# Bảo mật & Threat Model
    │   └── user-story.md            # 19 User Stories chi tiết
    │
    └── 3. detailed-design/          # Thiết kế chi tiết
        ├── api-spec.md              # API Specification đầy đủ
        ├── erd.md                   # Entity Relationship Diagram
        └── logging-strategy.md     # Chiến lược Logging
```

---

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js + Monaco Editor |
| **Backend** | NestJS |
| **Database** | PostgreSQL |
| **Code Execution** | Judge0 (Selfhost) |
| **Realtime** | WebSocket (Socket.io) |
| **Auth** | JWT + Refresh Token Rotation |
| **Container** | Docker + Docker Compose |

---

## 🚀 Tính năng chính

- **Code Editor** — Monaco Editor (VS Code engine), syntax highlighting cho 9 ngôn ngữ
- **Code Execution** — Chạy code async qua Judge0, kết quả trả về qua WebSocket
- **Auto-Grading** — Submit bài, so sánh output vs hidden test cases, báo kết quả từng test
- **Realtime Sync** — Owner code → Viewer xem live (debounce 300ms, latency < 1s)
- **Session Management** — Tạo session, chia sẻ join code, owner approve viewer
- **History** — Lưu toàn bộ `RUN` và `SUBMIT`, filter, xem lại code snapshot
- **Admin Dashboard** — Quản lý user, câu hỏi, test case, xem tất cả submissions

---

## 📐 Kiến trúc hệ thống

Hệ thống bao gồm 4 thành phần chính:

```
Frontend (React)  ←→  Backend (NestJS)  ←→  Judge0 (Sandbox)
                            ↕
                       PostgreSQL
                            ↕
                   Realtime Gateway (WS)
```

Chi tiết xem tại [`docs/2. basic-design/c4-diagram.md`](docs/2.%20basic-design/c4-diagram.md)

---

## 📄 Tài liệu

| Tài liệu | Mô tả |
|----------|-------|
| [`requirement.md`](docs/1.%20req-and-spec/requirement.md) | Functional & Non-functional requirements, User Roles, Tech Stack |
| [`user-story.md`](docs/2.%20basic-design/user-story.md) | 19 User Stories với Acceptance Criteria đầy đủ |
| [`api-spec.md`](docs/3.%20detailed-design/api-spec.md) | REST API & WebSocket Events specification |
| [`erd.md`](docs/3.%20detailed-design/erd.md) | Database schema, indexes, design decisions |
| [`edgecase-detail.md`](docs/2.%20basic-design/edgecase-detail.md) | 12 Edge Cases + 10 Risks với mitigation plan |
| [`security-consideration.md`](docs/2.%20basic-design/security-consideration.md) | Threat model, STRIDE analysis, security controls |
| [`error-test-strategy.md`](docs/2.%20basic-design/error-test-strategy.md) | Test strategy (Unit/Integration/E2E/Load/Security) |
| [`logging-strategy.md`](docs/3.%20detailed-design/logging-strategy.md) | Log levels, retention policy, monitoring alerts |

---

## 👥 Roles

| Role | Quyền hạn |
|------|-----------|
| **Admin** | Quản lý user, câu hỏi, test case, xem tất cả submissions |
| **User (Owner)** | Viết code, run/submit, tạo & chia sẻ session |
| **Viewer** | Xem code realtime trong session (read-only) |

---

> **Document Owner:** Project Team · **Last Updated:** March 2026
