## 🔐 Các lưu ý về bảo mật

Dự án này sử dụng AI như một phần của quy trình QA và testing. Khi sử dụng AI cần tuân thủ các nguyên tắc bảo mật sau:

### Dữ liệu nhạy cảm
- Không đưa thông tin nhạy cảm vào prompt AI, bao gồm:
  - dữ liệu người dùng
  - mật khẩu hoặc credentials
  - API keys
  - access tokens
  - dữ liệu production
- Nên sử dụng dữ liệu giả lập (mock data) hoặc dữ liệu đã được làm sạch (sanitized data) khi test.

### Kiểm tra kết quả từ AI
- Test cases, phân tích log hoặc kết quả test do AI tạo ra có thể không hoàn toàn chính xác.
- Các kết quả quan trọng cần được QA hoặc developer kiểm tra lại trước khi sử dụng.

### Kiểm soát truy cập
- Chỉ các thành viên được cấp quyền mới được sử dụng các công cụ AI trong pipeline QA.
- API keys hoặc credentials của các dịch vụ AI cần được lưu trữ an toàn (ví dụ: environment variables hoặc secret manager).

### Logs và artifacts
- Logs, test artifacts hoặc dữ liệu trung gian dùng trong quá trình test không được chứa thông tin nhạy cảm.
- Cần đảm bảo việc lưu trữ và truy cập các dữ liệu này được kiểm soát phù hợp.

### Rủi ro từ công cụ và model AI
- Chỉ sử dụng các công cụ hoặc model AI từ nguồn đáng tin cậy.
- Thường xuyên cập nhật dependencies để giảm thiểu các lỗ hổng bảo mật.
