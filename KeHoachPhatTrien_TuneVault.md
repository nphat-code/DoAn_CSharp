# KẾ HOẠCH TRIỂN KHAI & TIẾN ĐỘ DỰ ÁN TUNEVAULT

Dựa trên yêu cầu từ file `pdf_content_utf8.txt` (Bài tập lớn: Media Streaming Web Application), dưới đây là bản kế hoạch chi tiết các hạng mục cần thực hiện và đánh dấu tiến độ hiện tại.

## 1. YÊU CẦU CÔNG NGHỆ VÀ KIẾN TRÚC
- [x] **Frontend (2.0đ):** React 18+ với TypeScript, Vite.
- [x] **UI/UX:** Giao diện tối (Dark theme), layout kiểu Spotify (Tailwind CSS).
- [x] **Backend (8.0đ):** ASP.NET Core 8+ Web API.
- [x] **Kiến trúc:** Clean Architecture (Domain, Application, Infrastructure, API).
- [x] **Database & ORM:** PostgreSQL + Dapper (Thay vì EF Core).
- [x] **CQRS & Pipeline:** Sử dụng MediatR với Application Pipeline (Validation, Authorization, v.v.).
- [x] **Bảo mật:** JWT Authentication & Authorization.
- [x] **Real-time:** SignalR cho thông báo.

---

## 2. DANH SÁCH 10 CHỨC NĂNG BẮT BUỘC

### 1. Xác thực (Auth)
- [x] Backend: API Đăng ký (`RegisterCommand`).
- [x] Backend: API Đăng nhập cấp JWT (`LoginCommand`).
- [x] Frontend: Trang Đăng ký (`Register.tsx`).
- [x] Frontend: Trang Đăng nhập (`Login.tsx`).
- [x] Frontend: Xử lý lưu JWT & Protected routes.

### 2. Hồ sơ người dùng (Profile)
- [x] Backend: Xem hồ sơ (`GetProfileQuery`).
- [x] Backend: Sửa hồ sơ, cập nhật avatar & bio (`UpdateAvatarCommand` / `UpdateProfile`).
- [x] Frontend: Trang cá nhân người dùng (`Profile.tsx`).

### 3. Thư viện Media (Upload)
- [x] Backend: API Upload file media (Audio/Video) kèm metadata (`UploadMediaCommand`).
- [x] Backend: Validation giới hạn kích thước và định dạng file.
- [x] Backend: API lấy danh sách bài hát/album (`GetMediaListQuery`).
- [x] Frontend: Giao diện danh sách bài hát.

### 4. Audio Player
- [x] Backend: API Stream nhạc audio (`GetMediaStreamQuery`).
- [x] Backend: Ghi nhận lịch sử nghe khi bắt đầu phát.
- [x] Frontend: Thanh Player bar cố định phía dưới (`PlayerBar.tsx`), play, pause, seek, queue.

### 5. Video Player
- [x] Backend: API Stream video hỗ trợ `Range` header.
- [x] Frontend: Component phát video toàn màn hình hoặc trong khung panel (`RightPanel.tsx`).

### 6. Quản lý Playlist (CRUD)
- [x] Backend: Tạo, xoá playlist (`CreatePlaylistCommand`, `DeletePlaylistCommand`).
- [x] Backend: Thêm, xoá track khỏi playlist (`AddTrackToPlaylistCommand`, `RemoveTrackFromPlaylistCommand`).
- [x] Backend: API Lấy chi tiết playlist & danh sách playlist của user.
- [x] Frontend: Giao diện hiển thị và thao tác với Playlist (`PlaylistDetail.tsx`).

### 7. Tìm kiếm & Khám phá (Search)
- [x] Backend: API tìm kiếm theo tên bài, nghệ sĩ (`SearchMediaQuery`).
- [x] Frontend: Trang tìm kiếm (`Search.tsx`).

### 8. Chia sẻ Media (Share) - *Quan trọng*
- [x] Backend: API chia sẻ bài hát/playlist/video cho user khác (`ShareMediaCommand`).
- [x] Backend: Validation và lưu danh sách "Đã chia sẻ".
- [x] Frontend: Giao diện thực hiện share media.

### 9. Thông báo (Notifications) - *Quan trọng*
- [x] Backend: Lưu Notification xuống CSDL khi có sự kiện (Share/Follow).
- [x] Backend: Đẩy thông báo real-time qua SignalR (`NotificationService`, `SignalR Hub`).
- [x] Backend: API danh sách thông báo & Mark as read.
- [x] Frontend: Hiển thị badge thông báo & kết nối SignalR.

### 10. Tương tác & Lịch sử
- [x] Backend: API Like/Favorite track (`ToggleFavoriteCommand`).
- [x] Backend: API Lịch sử nghe gần đây (`AddPlayHistoryCommand`).
- [x] Frontend: Giao diện thả tim, danh sách lịch sử.

---

## 3. BONUS (ĐIỂM CỘNG)

### 3.1. Tích hợp AI (Tối đa +1.0 điểm)
- [ ] Gợi ý bài hát thông minh (AI Recommendation).
- [ ] Tóm tắt & mô tả bài hát tự động (AI Description).
- [ ] Chatbot hỗ trợ người dùng (TuneBot).
- [ ] Phân loại tự động (Auto-tagging).
*(Yêu cầu: Sử dụng Anthropic Claude API, không hardcode API key, cấu hình qua Dependency Injection).*

### 3.2. CI/CD & Cloud (Tối đa +1.0 điểm)
- [ ] Pipeline CI (build + test) bằng GitHub Actions.
- [ ] Deploy backend (Azure/AWS/VPS) + Database.
- [ ] Deploy frontend (Vercel/Netlify/Static Web Apps).
- [ ] Tài liệu hướng dẫn triển khai đầy đủ.

---

## 4. CÔNG VIỆC TIẾP THEO CẦN LÀM
Dựa vào danh sách trên, 10 chức năng cơ bản đã được xây dựng khung. Chúng ta cần chuyển sang các bước hoàn thiện và làm Bonus:

1. **Review lại UI/UX toàn hệ thống:** Đảm bảo luồng chạy trơn tru, xử lý lỗi (loading/error state).
2. **Triển khai AI (Anthropic API):** Thêm tính năng "Auto-tagging" khi upload bài hát hoặc "TuneBot" để nhận điểm bonus.
3. **Thiết lập CI/CD Pipeline:** Viết GitHub Actions flow cho backend và frontend.
4. **Deploy dự án:** Triển khai Backend lên render/heroku/azure và Frontend lên Vercel.
5. **Viết Báo Cáo:** Hoàn thiện README, ERD, Sơ đồ Pipeline và báo cáo PDF (5-10 trang).
