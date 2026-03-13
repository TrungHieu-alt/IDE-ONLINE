# Logging Strategy – Online Code Editor

## 1. Giới thiệu

Logging Strategy mô tả cách hệ thống ghi nhận, lưu trữ và quản lý các log trong quá trình vận hành.  
Mục tiêu là đảm bảo hệ thống có thể theo dõi hoạt động, phát hiện lỗi, hỗ trợ debugging và tăng cường bảo mật.

Logging được áp dụng cho toàn bộ hệ thống bao gồm:

- Authentication Service
- Code Execution Service
- Submission & Grading Service
- Realtime Collaboration Service
- Admin Management

---

# 2. Mục tiêu của Logging

Hệ thống logging được thiết kế nhằm phục vụ các mục tiêu sau:

- Theo dõi hoạt động của hệ thống
- Phát hiện lỗi nhanh chóng
- Hỗ trợ debug trong quá trình phát triển
- Giám sát các hoạt động của người dùng
- Phát hiện hành vi bất thường hoặc tấn công bảo mật
- Phân tích hiệu năng hệ thống

---

# 3. Mức độ Log (Log Levels)

Hệ thống sử dụng các mức log tiêu chuẩn.

| Level | Ý nghĩa | Ví dụ |
|------|------|------|
| DEBUG | Thông tin chi tiết phục vụ debug | Nội dung request, trạng thái nội bộ |
| INFO | Hoạt động bình thường của hệ thống | User login, code execution |
| WARNING | Sự kiện bất thường nhưng chưa gây lỗi | Login thất bại nhiều lần |
| ERROR | Lỗi hệ thống ảnh hưởng chức năng | Code execution thất bại |
| CRITICAL | Lỗi nghiêm trọng cần xử lý ngay | Execution service không hoạt động |

---

# 4. Phân loại Log

Logs được chia thành nhiều loại để dễ theo dõi và quản lý.

---

## 4.1 Authentication Logs

Ghi lại các hoạt động liên quan đến xác thực người dùng.

Bao gồm:

- Đăng ký tài khoản
- Đăng nhập
- Đăng nhập thất bại
- Thay đổi role
- Truy cập API không hợp lệ

Ví dụ log:
```json
{
  "timestamp": "2026-03-10T10:21:12Z",
  "level": "INFO",
  "service": "auth-service",
  "event": "user_login_success",
  "user_id": 123,
  "email": "user@example.com",
  "ip_address": "192.168.1.10",
  "request_id": "req-123"
}
```


---

## 4.2 Code Execution Logs

Theo dõi quá trình chạy code của người dùng.

Bao gồm:

- Yêu cầu chạy code
- Kết quả execution
- Lỗi compile
- Lỗi runtime
- Time limit exceeded
- Memory limit exceeded

Ví dụ:
```json
{
  "timestamp": "2026-03-10T10:30:15Z",
  "level": "INFO",
  "service": "code-execution",
  "event": "execution_completed",
  "user_id": 123,
  "language": "Python",
  "execution_time": "0.21s",
  "memory_used": "8MB",
  "status": "ACCEPTED",
  "request_id": "req-124"
}
```


---

## 4.3 Submission Logs

Theo dõi các lần nộp bài và kết quả chấm.

Bao gồm:

- Code submission
- Kết quả từng test case
- Kết quả tổng thể

Ví dụ:
```json
{
  "timestamp": "2026-03-10T10:32:00Z",
  "level": "INFO",
  "service": "submission-service",
  "event": "submission_graded",
  "user_id": 123,
  "question_id": 45,
  "passed_tests": 6,
  "total_tests": 8,
  "status": "WRONG_ANSWER",
  "request_id": "req-125"
}
```


---

## 4.4 Realtime Collaboration Logs

Theo dõi hoạt động của các coding session realtime.

Bao gồm:

- Tạo coding session
- Owner mở chia sẻ / generate join code
- Viewer tham gia session
- Owner kick viewer khỏi session
- Đồng bộ code realtime
- Kết thúc session

Ví dụ:
```json
{
  "timestamp": "2026-03-10T11:00:00Z",
  "level": "INFO",
  "service": "realtime-service",
  "event": "session_started",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "owner_id": 123,
  "request_id": "req-126"
}
```


---

## 4.5 Security Logs

Ghi nhận các sự kiện liên quan đến bảo mật.

Bao gồm:

- Brute force login attempts
- Truy cập API trái phép
- Hành vi đáng ngờ
- Vi phạm resource limits

Ví dụ:
```json
{
  "timestamp": "2026-03-10T11:15:00Z",
  "level": "WARNING",
  "service": "security-monitor",
  "event": "multiple_failed_logins",
  "ip_address": "192.168.1.15",
  "attempts": 5,
  "action": "temporary_block",
  "request_id": "req-127"
}
```


---

# 5. Lưu trữ Log

Logs được lưu trữ tại nhiều vị trí để đảm bảo an toàn và dễ truy xuất.

| Loại Log | Nơi lưu trữ |
|------|------|
| Application Logs | File log trên server |
| Error Logs | Error monitoring system |
| Security Logs | Secure audit log storage |
| Execution Logs | Database hoặc log files |

Cấu trúc thư mục log:


logs/
├── application.log
├── execution.log
├── error.log
└── security.log


---

# 6. Chính sách lưu trữ Log (Retention Policy)

Để tránh hệ thống lưu trữ quá nhiều dữ liệu log, hệ thống áp dụng chính sách lưu trữ như sau:

| Loại Log | Thời gian lưu |
|------|------|
| Application logs | 30 ngày |
| Error logs | 90 ngày |
| Security logs | 180 ngày |
| Audit logs | 1 năm |

Sau thời gian này, logs sẽ được:

- archive
- hoặc xóa tự động

---

# 7. Monitoring và Alerts

Hệ thống giám sát các log quan trọng và gửi cảnh báo khi phát hiện vấn đề.

Các trường hợp cần alert:

- Judge0 execution service không hoạt động
- Số lượng login thất bại tăng đột biến
- Code execution vượt resource limit liên tục
- Database connection failure

Các kênh cảnh báo:

- Email notification
- Monitoring dashboard
- System alerts

---

# 8. Best Practices

Hệ thống tuân thủ các nguyên tắc logging sau:

- Không ghi log thông tin nhạy cảm (password, token)
- Sử dụng structured logging (JSON format)
- Mỗi log phải có timestamp
- Bao gồm request ID để trace request
- Sử dụng log level hợp lý
- Không log quá nhiều trong production

---

# 9. Ví dụ Log dạng JSON

Ví dụ structured log:
```json
{
  "timestamp": "2026-03-10T10:30:15Z",
  "level": "INFO",
  "service": "code-execution",
  "event": "execution_completed",
  "user_id": 123,
  "question_id": 45,
  "language": "Python",
  "execution_time": "0.12s",
  "memory_used": "6MB",
  "status": "ACCEPTED",
  "request_id": "req-128"
}
```


Structured logs giúp dễ dàng:

- tìm kiếm
- phân tích
- tích hợp với monitoring systems
