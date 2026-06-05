# KẾ HOẠCH PHÁT TRIỂN TIẾP THEO - TUNEVAULT

Dựa trên yêu cầu đồ án môn học "C# and .NET Development" (`TuneVault_BaiTapLon.pdf`) và hiện trạng codebase mới nhất, dưới đây là báo cáo tiến độ và lộ trình triển khai chi tiết cho các bước tiếp theo để đạt điểm tối đa (10/10).

---

## 1. TÌNH TRẠNG HIỆN TẠI (NHỮNG GÌ ĐÃ HOÀN THÀNH)

Chúng ta đã xây dựng thành công nền móng vững chắc đạt chuẩn Rubric đồ án:

- **[B1] Kiến trúc Clean Architecture:** Chia chuẩn 4 projects (Domain, Application, Infrastructure, API). Dependency injection, không có logic trong controller.
- **[B2] Cơ sở dữ liệu:** Sử dụng Dapper (PostgreSQL) tối ưu truy vấn.
- **[B4] Xác thực:** Hệ thống JWT Authentication đã hoạt động (đã có Login).
- **[B5] Media Upload & Streaming:** Đã viết xong `UploadMediaCommand` lưu file vật lý và `GetMediaStreamQuery` stream file nhạc.
- **[B6 & B7] Share & Notifications:** Backend đã có SignalR, API Share hoạt động, UI đã nhận được push notification realtime.
- **[B8] CQRS Pipeline:** Áp dụng mô hình MediatR + FluentValidation cho các tính năng hiện tại.

---

## 2. NHỮNG YÊU CẦU CÒN THIẾU CẦN BỔ SUNG

Trong danh sách **10 chức năng bắt buộc**, các phần hổng lớn nhất hiện tại gồm:

1. **[B4] Xác thực (Auth):** Mới có Login, **chưa có Register**.
2. **[B5 & F1] Media (Library & Player):** Mặc dù đã upload được, nhưng **chưa có API GET danh sách nhạc**. Player trên UI vẫn đang mock dữ liệu, chưa kết nối động với Audio ID thực tế từ Backend.
3. **[F1] Video Player:** Chưa có giao diện phát Video.
4. **[CRUD cơ bản] Playlist, Lịch sử, Yêu thích (Favorite), Search, Profile:** Các tính năng này hoàn toàn thiếu API Backend và UI.
5. **[Bonus] Tích hợp AI (Claude API):** Chưa thực hiện (Chiếm 1.0 điểm Bonus).

---

## 3. LỘ TRÌNH TRIỂN KHAI CHI TIẾT (HƯỚNG ĐI TIẾP)

Chúng ta sẽ tiếp tục chia theo 3 Giai đoạn để xử lý dứt điểm:

### 🎯 Giai đoạn 1: Hoàn thiện Library, Player & Auth (Ưu tiên Cao nhất)
*Mục tiêu: Xong chức năng số 1, 3 & 4.*

1. **Backend - Danh sách bài hát (`GET /api/media`):**
   - Viết `GetMediaListQuery` dùng Dapper để lấy danh sách bài hát từ `MediaItem` trả về Frontend.
2. **Backend - Đăng ký (`POST /api/auth/register`):**
   - Viết `RegisterCommand` để tạo user mới.
3. **Frontend - Kết nối Dữ liệu Thực:**
   - Xóa mock data trong `mediaService.ts`, đấu nối danh sách nhạc thật vào Sidebar/Home.
   - Khi bấm vào bài hát, truyền ID thực tế xuống thẻ `<audio>` để phát qua API `/api/media/{id}/stream`.
   - Cập nhật trang Login/Register.

### 🎯 Giai đoạn 2: Quản lý Cá nhân - Playlist & Tương tác
*Mục tiêu: Hoàn thiện chức năng số 2, 6, 10.*

1. **Backend & Frontend - Playlist (Đã xong ✅):**
   - CRUD Playlist (Name, IsPublic). Thêm/xóa bài hát (`PlaylistTrack`).
2. **Backend & Frontend - Tương tác & Lịch sử:**
   - Nút Like (Favorite) thả tim bài hát.
   - Ghi lại lịch sử nghe nhạc (`PlayHistory`) tự động mỗi khi stream nhạc.
   - Trang Profile (Xem/sửa Avatar, Bio).

### 🎯 Giai đoạn 3: Tích điểm tuyệt đối - Video, Search & AI Bonus
*Mục tiêu: Đạt 10/10 với chức năng 5, 7 và AI.*

1. **Tìm kiếm & Video:**
   - Thanh tìm kiếm (Filter `ILIKE` bằng Dapper).
   - Trang riêng để xem Video.
2. **Tích hợp AI (Anthropic Claude API):**
   - Auto-tagging hoặc Sinh mô tả tự động khi upload bài hát.
   - Gợi ý bài hát dựa trên `PlayHistory`.

---

## 4. BƯỚC HÀNH ĐỘNG NGAY BÂY GIỜ

Hoàn thành **Giai đoạn 1**. 
Công việc cụ thể cần làm tiếp theo là mở file `TuneVault.Application/Features/Media/Queries/` để triển khai luồng **`GetMediaListQuery`** giúp Frontend có danh sách bài hát thực tế để hiển thị lên màn hình chính.
