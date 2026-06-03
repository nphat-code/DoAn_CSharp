# KẾ HOẠCH PHÁT TRIỂN TIẾP THEO - TUNEVAULT

Dựa trên yêu cầu đồ án môn học "C# and .NET Development" (`TuneVault_BaiTapLon.pdf`), dưới đây là báo cáo tiến độ và lộ trình triển khai chi tiết cho các bước tiếp theo để đạt điểm tối đa (10/10).

---

## 1. TÌNH TRẠNG HIỆN TẠI (NHỮNG GÌ ĐÃ HOÀN THÀNH)

Chúng ta đã xây dựng thành công nền móng vững chắc đạt chuẩn Rubric đồ án:

- **[B1] Kiến trúc Clean Architecture:** Chia chuẩn 4 projects (Domain, Application, Infrastructure, API). Dependency injection, không có logic trong controller.
- **[B2] Cơ sở dữ liệu:** Sử dụng Dapper (PostgreSQL) tối ưu truy vấn.
- **[B4] Xác thực:** Hệ thống JWT Authentication đã hoạt động, React đã lưu được token và bảo vệ route.
- **[B8] CQRS Pipeline:** Áp dụng mô hình MediatR + FluentValidation + AuthorizationBehavior cho luồng xử lý chuẩn mực.
- **[B6 & B7] Share & Notifications (Chức năng cốt lõi):** Backend đã có SignalR, API Share hoạt động, UI đã nhận được push notification realtime (chuông thông báo nảy số).

---

## 2. NHỮNG YÊU CẦU CÒN THIẾU CẦN BỔ SUNG

Trong danh sách **10 chức năng bắt buộc**, chúng ta mới hoàn thành 3 chức năng (Auth, Share, Notify). Các phần đang thiếu:

1. **[B5 & F1] Media (Upload & Player):** Chưa có API Upload vật lý. Chưa có API GET danh sách nhạc. Player trên UI đang bị mock cứng, chưa phát file động.
2. **[F1] Video Player:** Chưa có giao diện phát Video.
3. **[CRUD cơ bản] Playlist, Lịch sử, Yêu thích (Favorite), Search, Profile:** Các tính năng này thiếu API Backend và UI.
4. **[Bonus] Tích hợp AI (Claude API):** Chưa thực hiện (Chiếm 1.0 điểm Bonus).

---

## 3. LỘ TRÌNH TRIỂN KHAI CHI TIẾT (HƯỚNG ĐI TIẾP)

Để tránh bị quá tải, chúng ta sẽ chia phần còn lại thành 3 Giai đoạn (Phases):

### 🎯 Giai đoạn 1: Trái tim của ứng dụng - Upload & Streaming (Ưu tiên Cao nhất)
*Mục tiêu: Đạt chuẩn chức năng số 3 & 4.*

1. **Backend - Upload API (`POST /api/media/upload`):**
   - Viết `UploadMediaCommand` nhận file mp3/mp4 từ Frontend.
   - Ghi file vào thư mục vật lý `wwwroot/media`.
   - Dùng Dapper insert dữ liệu (Title, FileUrl, Duration) vào bảng `MediaItem` trong PostgreSQL.
2. **Backend - Get Library API (`GET /api/media`):**
   - Viết query Dapper để lấy danh sách bài hát trả về Frontend.
3. **Frontend - Upload UI & Player:**
   - Xây dựng form Upload nhạc (chọn file, điền tên) gọi API.
   - Xóa mock data trong `mediaService.ts`, đấu nối danh sách nhạc thật vào Sidebar.
   - Khi bấm vào bài hát trên web, truyền ID thực tế xuống thẻ `<audio>` của `PlayerBar` để stream nhạc từ Backend (`/api/media/{id}/stream`).

### 🎯 Giai đoạn 2: Quản lý Cá nhân - Playlist & Tương tác
*Mục tiêu: Hoàn thiện chức năng số 2, 6, 10.*

1. **Backend & Frontend - Playlist:**
   - Tạo Playlist (Name, IsPublic).
   - Thêm bài hát vào Playlist (`PlaylistTrack`).
2. **Backend & Frontend - Tương tác:**
   - Nút Like (Favorite) thả tim bài hát.
   - Lịch sử nghe nhạc (Tự động ghi lại `PlayHistory` mỗi khi stream nhạc).
   - Trang Profile (Xem thông tin, sửa Bio).

### 🎯 Giai đoạn 3: Tích điểm tuyệt đối - Video & AI Bonus
*Mục tiêu: Đạt 10/10 với chức năng 5, 7 và AI.*

1. **Tích hợp AI (Anthropic Claude API):**
   - Tự động sinh mô tả (Description) hoặc Tag (Thể loại) khi người dùng upload bài hát thông qua prompt gửi tới Claude.
   - Viết tính năng Gợi ý bài hát thông minh dựa trên sở thích (Lấy AI làm cốt lõi).
2. **Video Player & Search:**
   - Trang riêng để xem Video (ẩn thẻ Audio đi).
   - Thanh tìm kiếm (Filter bài hát bằng câu lệnh `ILIKE` trong Dapper).

---

## 4. BƯỚC HÀNH ĐỘNG NGAY BÂY GIỜ

Chúng ta sẽ bắt đầu với **Giai đoạn 1: Upload & Streaming**. 
Công việc cụ thể cần làm tiếp theo là mở file `TuneVault.Application/Features/Media/Commands/` để triển khai luồng `UploadMediaCommand` chuẩn Clean Architecture.
