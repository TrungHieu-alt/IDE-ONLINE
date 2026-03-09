## 1. Bảng Ma Trận Phân Quyền (RBAC Matrix)

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

## 2. Giải thích chuyên sâu cho các quyền "Đặc biệt" (Business Logic)

Trong thực tế triển khai, những quyền được đánh dấu ⚠️ không chỉ đơn thuần là kiểm tra vai trò (Role), mà hệ thống (Backend) bắt buộc phải kiểm tra thêm **Logic nghiệp vụ (Business Logic)** để đảm bảo tính chặt chẽ.

### 2.1. Quyền xem code của người khác (Conditional Permission)
* **Vấn đề:** Thí sinh không được phép xem mã nguồn của thí sinh khác nếu bản thân chưa giải quyết thành công bài toán đó.
* **Giải pháp thiết kế:** Khi API lấy chi tiết bài nộp (VD: `GET /api/submissions/{id}`) được gọi bởi một tài khoản có Role là `Student`, Backend phải thực hiện truy vấn cơ sở dữ liệu để xác minh: Tài khoản đang request (`user_id`) đã từng có bản ghi nộp bài đạt trạng thái `status = 'ACCEPTED'` cho bài tập đó (`problem_id`) hay chưa. Nếu chưa đạt điều kiện, hệ thống từ chối truy cập và trả về mã lỗi **HTTP 403 Forbidden**.

### 2.2. Quyền sở hữu tài nguyên (Resource Ownership)
* **Vấn đề:** Để tránh phá hoại dữ liệu chéo, một Người ra đề (Setter) không được phép can thiệp (sửa đề, xóa bài, xem test case ẩn) vào bài tập do Người ra đề khác tạo.
* **Giải pháp thiết kế:** Tại các API cập nhật/xóa bài tập, ngoài việc đi qua Middleware kiểm tra Role là `Setter`, hệ thống phải đối chiếu trường `author_id` (ID của người tạo bài tập) trong Database với `user_id` (ID của người đang gửi request). Lệnh chỉ được thực thi khi hai giá trị này khớp nhau. Quy tắc này chỉ được phép bỏ qua (bypass) nếu người dùng có Role là `Admin`.
