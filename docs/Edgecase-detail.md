# Edge Case & Risk Assessment
## Nền tảng Online Code Editor

**Phiên bản:** 2.0
**Ngày:** Tháng 3, 2026

---

## Cách đọc tài liệu này

Tài liệu chia làm hai phần:

- **Phần I — Edge Cases:** 12 tình huống bất thường cụ thể mà hệ thống có thể gặp. Mỗi case trình bày rõ vấn đề là gì, tại sao nó gây hại, và hệ thống xử lý ra sao.
- **Phần II — Risk Assessment:** 10 rủi ro ở cấp độ cao hơn, mỗi rủi ro có thể bao gồm nhiều edge case. Phần này tập trung vào mức độ nguy hiểm và kế hoạch giảm thiểu.
- **Phần III — Tổng kết:** Mapping giữa risk và edge case, tiêu chí thành công, và timeline xử lý.

---

---

# PHẦN I — EDGE CASE ANALYSIS

## Bảng tóm tắt

| # | Tên | Nhóm | Severity |
|---|-----|------|----------|
| 1 | Output thừa whitespace | Execution | 🟡 HIGH |
| 2 | Sai lệch số thực (floating point) | Execution | 🔴 CRITICAL |
| 3 | Output quá dài (> 100KB) | Execution | 🔴 CRITICAL |
| 4 | Code chạy sát ngưỡng timeout | Execution | 🟡 HIGH |
| 5 | Event realtime đến sai thứ tự | Realtime | 🔴 CRITICAL |
| 6 | Event realtime bị gửi trùng | Realtime | 🔴 CRITICAL |
| 7 | Code viewer lệch so với server | Realtime | 🟡 HIGH |
| 8 | Viewer mất kết nối rồi reconnect | Realtime | 🟡 HIGH |
| 9 | Người dùng bấm Run nhiều lần liên tiếp | Database | 🔴 CRITICAL |
| 10 | Callback từ Judge0 về trước DB ghi xong | Database | 🔴 CRITICAL |
| 11 | JWT bị giả mạo | Auth | 🔴 CRITICAL |
| 12 | Viewer cố tình sửa code | Realtime | 🔴 CRITICAL |

---

## NHÓM 1 — EXECUTION & JUDGE0

---

### Case 1 — Output thừa whitespace

**🟡 HIGH**

**Tình huống**
Đề bài yêu cầu in ra `42`. Code của người dùng in ra `42 ` (thừa dấu cách ở cuối) hoặc `42\n\n` (thừa dòng trống). Nếu so sánh nguyên văn, hệ thống sẽ chấm Sai — dù về mặt logic câu trả lời hoàn toàn đúng.

**Vấn đề**
Người dùng bị mất điểm oan. Điều này đặc biệt hay xảy ra với Python (tự thêm `\n`) hay C++ (lỡ in thêm dấu cách).

**Giải pháp**
Trước khi so sánh, trim toàn bộ whitespace ở đầu và cuối cả hai chuỗi output. Việc này được thực hiện ở phía server, không phụ thuộc vào ngôn ngữ mà người dùng dùng.

**Kiểm tra**
Tạo test case với expected output là `42`, cho code in ra `42 `, `  42`, `42\n\n`. Cả ba trường hợp phải được chấm Đúng.

---

### Case 2 — Sai lệch số thực (floating point)

**🔴 CRITICAL**

**Tình huống**
Bài toán tính `1/3`. Expected output là `0.3333333333`. Code in ra `0.3333333334` do cách làm tròn của từng ngôn ngữ khác nhau. Nếu so sánh chính xác từng ký tự, kết quả là Sai.

**Vấn đề**
Với các bài toán khoa học hoặc toán học, sai lệch ở chữ số thập phân thứ 10 là hoàn toàn chấp nhận được về mặt toán học, nhưng hệ thống lại chấm Sai — gây bất công cho người dùng.

**Giải pháp**
Đây là **quyết định về sản phẩm**, không phải lỗi kỹ thuật. MVP hiện tại chỉ so sánh chính xác sau khi trim whitespace. Nếu sau này có bài toán số thực, Admin cần bật chế độ "so sánh xấp xỉ" (tolerant judging) với ngưỡng sai số cho phép (epsilon), cấu hình riêng từng câu hỏi.

**Lưu ý quan trọng**
Case này được đánh CRITICAL để nhắc nhở team quyết định rõ ràng trước khi có bài toán số thực — không phải vì nó là bug trong MVP hiện tại.

**Kiểm tra**
Test với bài toán in số thực. Xác nhận hệ thống dùng exact match. Nếu sau này bật tolerant judging, test với epsilon = 1e-6.

---

### Case 3 — Output quá dài (> 100KB)

**🔴 CRITICAL**

**Tình huống**
Code in ra hàng triệu dòng, ví dụ vòng lặp `for i in range(10000000): print(i)`. Output có thể lên đến hàng trăm MB.

**Vấn đề**
Output khổng lồ sẽ làm tràn bộ nhớ, gây chậm hoặc crash toàn bộ pipeline xử lý — không chỉ ảnh hưởng submission của người đó mà còn ảnh hưởng các submission khác đang chạy cùng lúc.

**Giải pháp**
Cấu hình Judge0 giới hạn stdout tối đa 100KB. Nếu vượt ngưỡng, Judge0 tự cắt và trả về Runtime Error. Backend không cần xử lý thêm — chỉ cần hiển thị thông báo rõ ràng cho người dùng.

**Kiểm tra**
Submit code in vòng lặp lớn, xác nhận hệ thống trả về lỗi và không bị treo. Kiểm tra output được cắt gọn, không gây tràn bộ nhớ phía server.

---

### Case 4 — Code chạy sát ngưỡng timeout

**🟡 HIGH**

**Tình huống**
Giới hạn thời gian là 10 giây. Code A chạy 9.9s thì Accepted. Code B chạy 10.1s thì Time Limit Exceeded. Hai code gần như tương đương về hiệu năng nhưng kết quả khác nhau.

**Vấn đề**
Không phải về tính đúng đắn mà về tính công bằng — người dùng cần hiểu ngưỡng được áp dụng chính xác đến millisecond, không phải ước lượng.

**Giải pháp**
Judge0 hỗ trợ cấu hình `wall_time_limit` với độ chính xác millisecond. Đảm bảo giá trị cấu hình là chính xác 10.0 giây, không bị làm tròn hay có thêm buffer ngầm. Thông báo lỗi khi TLE phải hiển thị thời gian thực tế đã chạy để người dùng biết họ vượt bao nhiêu.

**Kiểm tra**
Viết code sleep chính xác 9.9s và 10.1s, xác nhận kết quả đúng với từng trường hợp.

---

## NHÓM 2 — REALTIME COLLABORATION

---

### Case 5 — Event realtime đến sai thứ tự

**🔴 CRITICAL**

**Tình huống**
Coder gõ và tạo ra ba event theo thứ tự: v1 (`d`), v2 (`de`), v3 (`def`). Do mạng không ổn định, Viewer nhận được theo thứ tự v3, v1, v2.

**Vấn đề**
Nếu Viewer áp dụng event theo thứ tự nhận được, màn hình sẽ hiển thị `def` → `d` → `de` — code bị lộn xộn, không phản ánh đúng trạng thái hiện tại của Coder.

**Giải pháp**
Mỗi event có một số thứ tự tăng dần (version). Viewer chỉ áp dụng event nếu version của nó lớn hơn version cuối cùng đã áp dụng. Event đến trễ với version thấp hơn sẽ bị bỏ qua. Kết quả là Viewer luôn hiển thị trạng thái mới nhất, không bao giờ đi ngược lại.

**Kiểm tra**
Gửi 3 event với version 3, 1, 2 theo đúng thứ tự đó. Kết quả cuối cùng trên Viewer phải là code của v3, không phải v2.

---

### Case 6 — Event realtime bị gửi trùng

**🔴 CRITICAL**

**Tình huống**
Mạng không ổn định khiến client gửi lại event đã gửi. Viewer nhận cùng một event hai lần.

**Vấn đề**
Nếu không lọc trùng, nội dung event bị áp dụng hai lần — code trên màn hình Viewer bị sai.

**Giải pháp**
Mỗi event có một ID duy nhất (UUID). Viewer lưu lại danh sách các ID đã xử lý. Khi nhận event mới, kiểm tra ID trước — nếu đã xử lý rồi thì bỏ qua, không áp dụng lại.

**Kiểm tra**
Gửi cùng một event hai lần liên tiếp. Code trên Viewer phải đúng như khi chỉ nhận một lần, không bị nhân đôi hay sai lệch.

---

### Case 7 — Code của Viewer lệch so với server

**🟡 HIGH**

**Tình huống**
Sau nhiều lần gửi nhận event, code đang hiển thị ở Viewer dần dần lệch so với code thực tế đang lưu trên server — dù không có event nào bị báo lỗi.

**Vấn đề**
Điều này có thể xảy ra do network drop thầm lặng, một event bị mất mà không ai biết. Viewer vẫn nghĩ mình đang xem đúng code của Coder nhưng thực ra đã lệch.

**Giải pháp**
Mỗi 10 giây, client tính checksum của code đang hiển thị và so sánh với checksum server cung cấp qua WebSocket. Nếu không khớp, client tự động lấy lại toàn bộ snapshot code từ server — thao tác này trong suốt với người dùng. Snapshot trả về phải kèm `version` và checksum để client verify lại trước khi apply. Nếu snapshot lấy về vẫn fail checksum hoặc parse lỗi, client giữ nguyên bản đang hiển thị, báo trạng thái "sync corrupted", và retry lấy snapshot mới thay vì ghi đè dữ liệu có thể đã hỏng.

**Kiểm tra**
Giả lập mất một event, để 10 giây trôi qua, xác nhận Viewer tự đồng bộ lại về đúng trạng thái của server. Giả lập snapshot corruption ở DB hoặc payload lỗi, xác nhận client không apply snapshot hỏng và tiếp tục retry đến khi lấy được snapshot hợp lệ.

---

### Case 8 — Viewer mất kết nối rồi reconnect

**🟡 HIGH**

**Tình huống**
Viewer bị mất mạng trong 30 giây. Trong thời gian đó Coder vẫn gõ code bình thường. Khi Viewer kết nối lại, có thể có hàng chục event bị bỏ lỡ.

**Vấn đề**
Nếu server cố gửi lại từng event một, sẽ tốn băng thông và có thể gây ra vấn đề thứ tự. Nếu không gửi gì, Viewer xem code lỗi thời.

**Giải pháp**
Khi Viewer reconnect, server kiểm tra số event đã bỏ lỡ. Nếu ít hơn 100 event, gửi lại từng event theo thứ tự. Nếu nhiều hơn 100, gửi thẳng một snapshot đầy đủ của code hiện tại — nhanh hơn và đơn giản hơn. Ngưỡng 100 có thể điều chỉnh theo thực tế vận hành.

**Kiểm tra**
Ngắt kết nối Viewer, để Coder gõ thêm nhiều nội dung, sau đó reconnect. Xác nhận Viewer hiển thị đúng code hiện tại của Coder.

---

## NHÓM 3 — DATABASE & CONCURRENCY

---

### Case 9 — Người dùng bấm Run nhiều lần liên tiếp

**🔴 CRITICAL**

**Tình huống**
Người dùng bấm nút Run 5 lần liên tục trong vòng vài giây vì nghĩ hệ thống chưa phản hồi.

**Vấn đề**
Nếu không xử lý đúng, có thể xảy ra race condition khi nhiều submission cùng được tạo đồng thời — dẫn đến dữ liệu thiếu nhất quán hoặc một số submission bị mất kết quả.

**Giải pháp**
Mỗi submission được tạo trong một database transaction riêng — bao gồm cả bản ghi submission lẫn bản ghi execution_result. Nếu bất kỳ bước nào thất bại, toàn bộ transaction rollback, không để lại dữ liệu dở dang. Ngoài ra, nút Run bị disable ngay sau lần bấm đầu tiên cho đến khi có kết quả. Backend cũng phải có server-side concurrency guard: mỗi user chỉ được có 1 submission ở trạng thái `PENDING` tại một thời điểm; request `Run/Submit` tiếp theo từ cùng user phải bị reject với `409 Conflict`.

**Kiểm tra**
Gửi 5 request submit đồng thời từ cùng một tài khoản. Kết quả mong đợi: chỉ 1 request được chấp nhận tạo `PENDING` submission, các request còn lại bị reject với `409 Conflict`. Tách riêng một load test khác với 10 user khác nhau submit cùng lúc; hệ thống phải xử lý được ít nhất 10 submission đồng thời mà không mất dữ liệu.

**Tương tác với Case 10**
Nếu người dùng refresh trang đúng lúc callback của Judge0 vẫn đang nằm trong retry queue, frontend không được tạo submission mới chỉ vì mất trạng thái nút disable cũ. Sau khi reload, client phải query lại submission `PENDING` gần nhất của user và re-subscribe vào luồng cập nhật của submission đó trước khi cho phép bấm Run tiếp.

---

### Case 10 — Callback từ Judge0 về trước DB ghi xong

**🔴 CRITICAL**

**Tình huống**
Backend gửi code sang Judge0 và chưa kịp lưu xong bản ghi submission vào database thì Judge0 đã xử lý xong và gửi callback kết quả về.

**Vấn đề**
Callback handler tìm submission theo token nhưng không thấy vì chưa được ghi xong. Nếu không xử lý khéo, callback bị bỏ qua → submission mất kết quả. Hoặc tệ hơn, handler tạo thêm một bản ghi mới → dữ liệu trùng lặp.

**Giải pháp**
Callback handler được thiết kế theo kiểu idempotent: khi nhận callback, nếu không tìm thấy submission tương ứng, đẩy callback vào một hàng đợi retry thay vì xử lý ngay. Sau vài giây retry, lúc này DB đã ghi xong, handler sẽ tìm thấy và cập nhật đúng bản ghi. Ngoài ra, cột `judge0_token` có ràng buộc UNIQUE để đảm bảo không thể có hai bản ghi cùng token. Endpoint callback phải là internal-only và backend phải verify header `X-Judge0-Callback-Secret` trước khi xử lý bất kỳ payload nào; nếu secret sai hoặc thiếu thì trả `401` và log ngay.

**Kiểm tra**
Giả lập callback về trước khi DB insert hoàn tất. Kết quả cuối cùng phải là đúng một bản ghi submission với đầy đủ thông tin kết quả, không được có hai bản ghi trùng nhau. Giả lập thêm callback với secret sai hoặc thiếu; request phải bị từ chối với `401` và không được chạm vào retry queue/business logic.

**Tương tác với Case 9**
Nếu user refresh trang trong lúc callback đang retry, retry queue vẫn tiếp tục xử lý độc lập phía server. Khi frontend tải lại, trạng thái đúng phải được khôi phục từ DB: nếu submission vẫn `PENDING` thì UI tiếp tục hiển thị trạng thái chờ; nếu callback đã cập nhật xong thì UI hiển thị kết quả cuối. Refresh không được làm mất callback, tạo callback duplicate, hay khiến user vô tình enqueue thêm submission mới.

---

## NHÓM 4 — AUTHENTICATION & SECURITY

---

### Case 11 — JWT bị giả mạo

**🔴 CRITICAL**

**Tình huống**
Kẻ tấn công lấy được một JWT hợp lệ, tự sửa payload để nâng role từ `CODER` lên `ADMIN`, rồi dùng token đã sửa để gọi API.

**Vấn đề**
Nếu backend chỉ decode JWT mà không verify chữ ký, kẻ tấn công có thể leo thang đặc quyền tùy ý.

**Giải pháp**
Backend luôn verify chữ ký JWT bằng secret key trước khi sử dụng bất kỳ thông tin nào trong payload. Token đã bị sửa sẽ có chữ ký không hợp lệ và bị từ chối với lỗi 401. Ngoài ra, role của user còn được kiểm tra lại từ database ở mỗi request quan trọng, không chỉ tin vào JWT.

**Kiểm tra**
Lấy một JWT hợp lệ, thay đổi một ký tự ở phần signature, gửi request lên server. Server phải trả về 401, không được chấp nhận token đã bị sửa.

---

### Case 12 — Viewer cố tình sửa code

**🔴 CRITICAL**

**Tình huống**
Một Viewer trong session cố tình gửi WebSocket event `code_changed` để sửa code đang hiển thị — dù giao diện frontend đã block tính năng này.

**Vấn đề**
Người dùng có thể bypass frontend bằng cách gửi WebSocket message thủ công qua DevTools hoặc tool khác. Nếu backend không kiểm tra, code của Coder bị sửa mà Coder không hay biết — ảnh hưởng trực tiếp đến tính toàn vẹn của buổi phỏng vấn.

**Giải pháp**
Khi nhận event `code_changed`, backend kiểm tra xem người gửi có phải là Coder của session đó không — bằng cách so sánh `user_id` từ JWT với `coder_id` trong bản ghi session trên database. Nếu không khớp, event bị bỏ qua hoàn toàn và hành vi này được ghi vào audit log.

**Kiểm tra**
Dùng tài khoản Viewer, gửi trực tiếp WebSocket event `code_changed` với nội dung bất kỳ. Code trong session không được thay đổi. Server log phải ghi lại attempt này.

---

---

# PHẦN II — RISK ASSESSMENT

## Bảng tóm tắt

| # | Rủi ro | Mức độ | Edge case liên quan |
|---|--------|--------|---------------------|
| 1 | Sandbox escape — code thoát ra khỏi container | 🔴 CRITICAL | — |
| 2 | Leo thang đặc quyền qua JWT | 🔴 CRITICAL | Case 11 |
| 3 | Race condition khi tạo submission đồng thời | 🔴 CRITICAL | Case 9 |
| 4 | Race condition với callback từ Judge0 | 🔴 CRITICAL | Case 10 |
| 5 | Dữ liệu realtime bị sai hoặc lệch | 🔴 CRITICAL | Case 5, 6, 7 |
| 6 | Hàng đợi submission bị tắc nghẽn | 🟡 HIGH | — |
| 7 | Judge0 ngừng hoạt động | 🟡 HIGH | — |
| 8 | Tấn công DDoS | 🟡 HIGH | — |
| 9 | Lộ nội dung test case ẩn | 🟡 HIGH | — |
| 10 | Viewer sửa code trái phép | 🟡 HIGH | Case 12 |

---

## NHÓM A — CRITICAL RISKS

---

### Risk 1 — Sandbox Escape

**🔴 CRITICAL**

**Rủi ro là gì**
Code độc hại của người dùng thoát ra khỏi container Judge0, truy cập được vào host system. Đây là tình huống tệ nhất có thể xảy ra — kẻ tấn công có thể đọc dữ liệu của tất cả người dùng, can thiệp vào hệ thống, hoặc dùng server làm bàn đạp tấn công tiếp.

**Tại sao có thể xảy ra**
Lỗ hổng trong kernel Linux (container escape CVE), cấu hình Docker sai (ví dụ mount `/var/run/docker.sock` vào container), hoặc Judge0 chưa được vá bản mới nhất.

**Cách giảm thiểu**
Mỗi submission chạy trong container riêng biệt, bị xóa ngay sau khi xong. Container không có quyền truy cập vào filesystem của host. Syscall nguy hiểm bị chặn bằng seccomp (fork, execve, socket, mount...). Không mount Docker socket vào container. Cập nhật Judge0 và base image định kỳ, scan CVE trước mỗi lần deploy.

**Mức độ tự tin:** 🟢 Cao — Judge0 đã có sẵn cơ chế này, nhưng cần đảm bảo cấu hình đúng và không bị override khi deploy.

---

### Risk 2 — Leo thang đặc quyền qua JWT

**🔴 CRITICAL** | Liên quan: Case 11

**Rủi ro là gì**
Người dùng tự sửa JWT để nâng quyền lên Admin, từ đó xem được toàn bộ submission, test case ẩn, và quản lý tài khoản người khác.

**Cách giảm thiểu**
Luôn verify chữ ký JWT. Với các thao tác nhạy cảm, kiểm tra role trực tiếp từ database thay vì chỉ tin vào JWT — vì JWT có thể là token cũ từ trước khi role bị thay đổi. Khi admin thay đổi role của ai đó, tăng `auth_version` của người đó để token cũ tự động vô hiệu hóa.

**Mức độ tự tin:** 🟢 Cao — cơ chế `auth_version` giải quyết cả tình huống token hợp lệ nhưng role đã thay đổi.

---

### Risk 3 — Race condition khi tạo submission đồng thời

**🔴 CRITICAL** | Liên quan: Case 9

**Rủi ro là gì**
Nhiều request tạo submission cùng lúc dẫn đến dữ liệu không nhất quán — một số submission thiếu kết quả, hoặc kết quả bị gán nhầm sang submission khác.

**Cách giảm thiểu**
Toàn bộ quá trình tạo submission (bao gồm cả bản ghi submission lẫn execution_result) được bọc trong một database transaction. Nút Run bị vô hiệu hóa ngay sau lần nhấn đầu tiên.

**Mức độ tự tin:** 🟢 Cao — database transaction là cơ chế đủ mạnh cho trường hợp này.

---

### Risk 4 — Race condition với callback từ Judge0

**🔴 CRITICAL** | Liên quan: Case 10

**Rủi ro là gì**
Callback kết quả từ Judge0 về quá nhanh, trước khi bản ghi submission được lưu xong vào database. Kết quả bị mất hoặc bị xử lý sai.

**Cách giảm thiểu**
Callback handler theo kiểu idempotent với retry queue. Token Judge0 có ràng buộc UNIQUE trong database để loại bỏ khả năng tạo bản ghi trùng. Callback endpoint chỉ accessible trong Docker internal network và còn có shared secret header để xác thực request nội bộ. Với các submission quan trọng, dùng cơ chế polling song song với callback để đảm bảo không mất kết quả.

**Mức độ tự tin:** 🟡 Trung bình — cần test kỹ timing trong môi trường gần với production.

---

### Risk 5 — Dữ liệu realtime bị sai hoặc lệch

**🔴 CRITICAL** | Liên quan: Case 5, 6, 7

**Rủi ro là gì**
Viewer nhìn thấy code không đúng với những gì Coder đang viết — do event đến sai thứ tự, bị gửi trùng, hoặc một số event bị mất thầm lặng. Trong bối cảnh phỏng vấn, điều này khiến interviewer đánh giá sai năng lực ứng viên.

**Cách giảm thiểu**
Ba cơ chế hoạt động song song: version number để lọc event trễ, UUID để lọc event trùng, và checksum định kỳ để phát hiện lệch và tự đồng bộ lại. Kết hợp cả ba đảm bảo trạng thái cuối cùng của Viewer luôn đúng.

**Mức độ tự tin:** 🟢 Cao — ba lớp bảo vệ độc lập nhau.

---

## NHÓM B — HIGH RISKS

---

### Risk 6 — Hàng đợi submission bị tắc nghẽn

**🟡 HIGH**

**Rủi ro là gì**
Nhiều người submit cùng lúc, Judge0 xử lý không kịp, hàng đợi tắc nghẽn. Người dùng chờ quá lâu không có phản hồi, hoặc request bị timeout.

**Cách giảm thiểu**
Giới hạn độ dài hàng đợi tối đa (ví dụ 100 submission đang chờ). Khi hàng đợi đầy, trả về lỗi 503 với thông báo rõ ràng thay vì để người dùng chờ vô thời hạn. Theo dõi độ dài hàng đợi liên tục, cảnh báo khi vượt ngưỡng 70% để có thể scale kịp thời. Rule concurrency cần rõ ràng: hệ thống hỗ trợ ít nhất 10 submission đồng thời từ 10 user khác nhau, còn mỗi user chỉ được có 1 submission `PENDING` tại một thời điểm.

**Mức độ tự tin:** 🟢 Cao — vấn đề vận hành, giải quyết được bằng monitoring và auto-scaling.

---

### Risk 7 — Judge0 ngừng hoạt động

**🟡 HIGH**

**Rủi ro là gì**
Judge0 container crash hoặc không phản hồi. Toàn bộ tính năng chạy code và chấm bài ngừng hoạt động.

**Cách giảm thiểu**
Retry với exponential backoff: thử lại sau 1s, 2s, 4s — tối đa 3 lần. Nếu vẫn không được, trả về lỗi 503 với thông báo thân thiện và ẩn nút Run trên giao diện. Health check tự động mỗi 30 giây, tự restart container nếu không phản hồi. Lỗi của Judge0 không được kéo sập các tính năng khác như xem câu hỏi hay xem lịch sử — những phần đó vẫn phải chạy bình thường.

**Mức độ tự tin:** 🟢 Cao — circuit breaker pattern là cơ chế đã được kiểm chứng.

---

### Risk 8 — Tấn công DDoS

**🟡 HIGH**

**Rủi ro là gì**
Bot hoặc kẻ tấn công flood API, đặc biệt là endpoint chạy code vốn tốn nhiều tài nguyên Judge0.

**Cách giảm thiểu**
Rate limiting theo IP và theo tài khoản — giới hạn số submission mỗi phút. Với login thì giới hạn 5 lần thất bại trong 5 phút. HTTPS bắt buộc, WAF ở tầng trước. Submission endpoint yêu cầu xác thực — không cho phép anonymous submit.

**Mức độ tự tin:** 🟢 Cao — các biện pháp này là tiêu chuẩn phổ biến.

---

### Risk 9 — Lộ nội dung test case ẩn

**🟡 HIGH**

**Rủi ro là gì**
Người dùng nhìn thấy `expected_output` của hidden test case, từ đó dễ dàng làm đúng bài mà không cần hiểu thuật toán.

**Cách giảm thiểu**
Hai lớp bảo vệ: API response luôn mask `input` và `expected_output` của hidden test case thành `[hidden]` trước khi gửi cho Coder. Việc so sánh output diễn ra hoàn toàn phía server — Coder không bao giờ nhận được `expected_output` thực tế trong kết quả submission, kể cả khi test đó Sai. Hidden test case cũng không được log ở bất kỳ level nào.

**Mức độ tự tin:** 🟢 Cao — cần test API response kỹ để đảm bảo không có field nào bị lọt.

---

### Risk 10 — Viewer sửa code trái phép

**🟡 HIGH** | Liên quan: Case 12

**Rủi ro là gì**
Viewer bypass giao diện để gửi event chỉnh sửa code, ảnh hưởng đến buổi phỏng vấn.

**Cách giảm thiểu**
Backend kiểm tra quyền ở mỗi WebSocket event — không tin vào giao diện frontend. Mọi attempt sửa code từ người không phải Coder của session đều bị từ chối và ghi log.

**Mức độ tự tin:** 🟢 Cao — enforce phía server là đủ, frontend chỉ là convenience.

---

---

# PHẦN III — TỔNG KẾT

## Mapping Risk ↔ Edge Case

| Risk | Edge Case liên quan | Điểm chung |
|------|---------------------|------------|
| Risk 2: Leo thang quyền | Case 11: JWT bị giả mạo | Cùng xử lý bằng JWT verify + DB check |
| Risk 3: Race condition submission | Case 9: Bấm Run nhiều lần | Cùng giải quyết bằng atomic transaction |
| Risk 4: Race condition callback | Case 10: Callback về sớm | Cùng giải quyết bằng idempotent handler |
| Risk 5: Realtime sai | Case 5, 6, 7: Event ordering, dedup, sync | Cùng giải quyết bằng version + dedup + checksum |
| Risk 10: Viewer edit | Case 12: Viewer cố sửa code | Cùng giải quyết bằng server-side role check |

Các risk không có edge case tương ứng (Risk 1, 6, 7, 8, 9) được kiểm tra qua:

- **Risk 1** → Security audit, penetration test
- **Risk 6** → Load test với 10 user khác nhau submit đồng thời và test riêng trường hợp 1 user spam submit phải nhận `409`
- **Risk 7** → Chaos test: kill Judge0 container và quan sát hành vi hệ thống
- **Risk 8** → Network security test, WAF configuration
- **Risk 9** → API response inspection, kiểm tra từng field trong response

---

## Tiêu chí thành công

### Trước khi bắt đầu implement
- [ ] Toàn bộ team hiểu 12 edge case và biết cách xử lý từng case
- [ ] Toàn bộ team hiểu 10 risk và biết cách giảm thiểu

### Trong quá trình phát triển
- [ ] Mỗi CRITICAL edge case và risk đều có implementation tương ứng
- [ ] Mỗi HIGH edge case và risk đều có implementation tương ứng
- [ ] Unit test được viết cho từng edge case

### Trước khi go-live
- [ ] Sandbox không bị escape (security audit pass)
- [ ] JWT tamper bị phát hiện và từ chối
- [ ] Race condition không xảy ra (test với concurrent request)
- [ ] Callback Judge0 secret sai/thiếu bị từ chối với `401`
- [ ] Session auto-close chỉ xảy ra khi quá 5 phút idle và coder không còn WebSocket connection
- [ ] Realtime sync chính xác sau nhiều event liên tiếp
- [ ] Judge0 down → hệ thống vẫn hoạt động, thông báo rõ ràng
- [ ] Rate limiting ngăn được brute force và DDoS cơ bản
- [ ] Hidden test case không lộ ra ngoài API
- [ ] Performance đạt: API < 500ms, realtime sync < 1 giây

---

**Trạng thái:** Sẵn sàng sử dụng
**Cập nhật lần cuối:** Tháng 3, 2026
**Review tiếp theo:** Sau sprint planning
