# C4 DIAGRAM

## Online Code Editor Platform

**Version:** 1.0  
**Date:** March 2026  
**Status:** Draft

---

## 1. Overview

Tài liệu này mô tả kiến trúc hệ thống theo mô hình C4 cho nền tảng **Online Code Editor**.  
Cấu trúc gồm 4 mức:

- **Level 1 - System Context**: Bối cảnh hệ thống và các actor/hệ thống bên ngoài
- **Level 2 - Container**: Các khối triển khai chính trong hệ thống
- **Level 3 - Component (Frontend)**: Các thành phần chính của frontend
- **Level 3 - Component (Backend)**: Các thành phần chính của backend

---

## 2. Level 1 - System Context Diagram

Mức này mô tả các tác nhân chính tương tác với hệ thống gồm:

- **User**: viết code, chạy code, submit bài, tạo hoặc tham gia session
- **Viewer**: vai trò trong session, theo dõi code realtime với quyền chỉ xem
- **Admin**: quản lý người dùng và câu hỏi
- **Judge0**: hệ thống thực thi code sandbox bên ngoài
- **Email Service**: hệ thống ngoài dùng để gửi email verify account và các email hệ thống

![System Context](../assets/Context%20Diagram%20%28Current%29.svg)

---

## 3. Level 2 - Container Diagram

Mức container thể hiện các khối chính trong hệ thống:

- **Frontend**: giao diện web cho user/viewer/admin
- **Backend**: xử lý business logic, authentication, API và orchestration
- **Realtime Gateway**: đồng bộ code realtime qua WebSocket
- **PostgreSQL**: lưu user, question, submission, session data
- **Judge0**: thực thi source code trong môi trường sandbox
- **Email Service**: dịch vụ gửi email verification/notification từ backend

![Container Diagram](../assets/Online%20Code%20Editor%20App%20Diagram%20%28Current%29.svg)

---

## 4. Level 3 - Frontend Component Diagram

Mức này tập trung vào các thành phần chính của frontend:

- **Monaco Editor**: code editor trên trình duyệt
- **Socket Client**: gửi và nhận dữ liệu realtime
- **API Client**: gọi REST API tới backend
- **Other Pages**: các màn hình khác như login, dashboard, history

![Frontend Component Diagram](../assets/Frontend%20Component%20Diagram%20%28Current%29.svg)

---

## 5. Level 3 - Backend Component Diagram

Mức này mô tả các nhóm thành phần backend phục vụ:

- authentication và user management
- question/test case management
- submission/execution flow
- realtime session handling
- integration nội bộ giữa Submission Module và Collaboration Module qua `EventEmitter2`
- integration với PostgreSQL, Frontend và Judge0
- integration với Email Service cho verification flow

![Backend Component Diagram](../assets/Backend%20Component%20Diagram%20%28Current%29.svg)

---

## 6. Notes

- Các sơ đồ SVG được lưu trong thư mục `assets/`
- Tài liệu này dùng để tham chiếu cùng với `requirement.md`, `api-spec.md` và `erd.md`
- Nếu cập nhật sơ đồ trong `assets`, file Markdown này vẫn dùng lại cùng đường dẫn asset hiện tại
- Context Diagram và Container Diagram phải thể hiện thêm `Email Service` như external dependency dù MVP chưa implement gửi mail đầy đủ
- Backend Component Diagram cần có mũi tên `Submission Module -> Collaboration Module` với label `internal event (EventEmitter2)`
- Backend Component Diagram cần có note: `Collaboration Module` luôn check session active trước khi broadcast realtime event
