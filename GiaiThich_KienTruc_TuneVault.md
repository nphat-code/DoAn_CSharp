# TÀI LIỆU GIẢI THÍCH KIẾN TRÚC & CẤU TRÚC DỰ ÁN TUNEVAULT

Tài liệu này đóng vai trò như một bản đồ chi tiết, giúp bạn (hoặc bất kỳ ai tham gia vào dự án) hiểu rõ cách toàn bộ hệ thống TuneVault được cấu trúc và vận hành từ Frontend đến Backend.

---

## 1. TỔNG QUAN HỆ THỐNG
**TuneVault** là một ứng dụng Web phát nhạc và video trực tuyến (Media Streaming).
Hệ thống được chia làm 2 phần hoàn toàn tách biệt (Decoupled):
- **Frontend (`tunevault-client`):** Ứng dụng Single Page Application (SPA) xây dựng bằng React, TypeScript, Vite và Tailwind CSS.
- **Backend (`TuneVault.*`):** API Web xây dựng bằng ASP.NET Core 8, kiến trúc Clean Architecture, CQRS (MediatR), và tương tác với Database bằng Dapper (PostgreSQL).

---

## 2. GIẢI THÍCH BACKEND (CLEAN ARCHITECTURE)
Backend được chia thành 4 project riêng biệt, hoạt động theo nguyên tắc hướng tâm (Dependency Rule): Các tầng bên ngoài phụ thuộc vào tầng bên trong, tầng bên trong (Domain) không biết gì về bên ngoài.

### 2.1. Tầng Lõi: `TuneVault.Domain`
- **Mục đích:** Là trái tim của ứng dụng. Chứa các định nghĩa thuần túy nhất về dữ liệu và nghiệp vụ.
- **Thành phần:**
  - **Entities:** Các class đại diện cho các bảng trong cơ sở dữ liệu (`UserProfile`, `Artist`, `Album`, `MediaItem`, `Playlist`...).
  - **Exceptions (nếu có):** Các lỗi nghiệp vụ riêng lẻ.
- **Quy tắc:** Tuyệt đối KHÔNG cài đặt bất kỳ thư viện bên ngoài nào (không Entity Framework, không Dapper, không ASP.NET Core).

### 2.2. Tầng Nghiệp Vụ: `TuneVault.Application`
- **Mục đích:** Chứa toàn bộ các Use Case (trường hợp sử dụng) của hệ thống. Nhận lệnh từ tầng ngoài, xử lý logic, và gọi tầng trong.
- **Kiến trúc CQRS & MediatR:**
  - Thay vì viết code logic trong Controller hoặc Service nhàm chán, mọi tính năng được chia làm 2 loại:
    - **Commands:** Lệnh làm thay đổi dữ liệu (Create, Update, Delete). Ví dụ: `UploadMediaCommand`, `LoginCommand`.
    - **Queries:** Lệnh chỉ lấy dữ liệu, không làm thay đổi trạng thái hệ thống. Ví dụ: `GetMediaListQuery`.
  - **Pipeline Behavior (Đường ống xử lý):** Tự động chặn các Request để chạy qua lớp **Validation** (dùng `FluentValidation`) trước khi đi vào Handler. Nếu dữ liệu đầu vào (ví dụ: tên đăng nhập trống) sai, nó ném ra `ValidationException` ngay lập tức.
- **Interfaces:** Nơi định nghĩa các hợp đồng cho Database (VD: `IArtistRepository`). Tầng này chỉ cần *biết* Repository có hàm gì, còn việc truy xuất DB thực tế ra sao nó không quan tâm.

### 2.3. Tầng Hạ Tầng: `TuneVault.Infrastructure`
- **Mục đích:** Giao tiếp với thế giới bên ngoài (Database, File System, Gửi Email, JWT Token).
- **Thành phần:**
  - **Dapper & PostgreSQL:** Cung cấp `IDbConnection` qua Npgsql. Triển khai các Interface (VD: `ArtistRepository`) bằng cách viết Raw SQL cực kì tối ưu.
  - **Authentication:** Chứa logic sinh chuỗi JWT (`JwtTokenGenerator`) và băm mật khẩu (`PasswordHasher`).
  - **File Storage:** Dịch vụ lưu trữ file vật lý (`FileStorageService`) cho tính năng Upload Audio/Video.
  - **SignalR:** Dịch vụ gửi thông báo real-time qua WebSocket (`NotificationService`).
- **DependencyInjection.cs:** File cấu hình gom tất cả mọi kết nối, tiêm phụ thuộc (DI) để cung cấp cho toàn bộ ứng dụng.

### 2.4. Tầng Giao Diện: `TuneVault.API`
- **Mục đích:** Cung cấp điểm truy cập (Endpoints) cho Client (React/Postman).
- **Thành phần:**
  - **Controllers (`AuthController`, `MediaController`):** Nhiệm vụ của chúng cực kì "mỏng". Chúng chỉ lấy dữ liệu từ Request (Body, URL, Auth Token), đóng gói thành Command/Query và gọi `await _mediator.Send(...)`. Cuối cùng trả về HTTP 200, 400, 401...
  - **Program.cs:** Nơi ứng dụng chạy lên. Cấu hình CORS (cho phép React gọi API), cấu hình Middlewares (Bắt lỗi toàn cục, Xác thực JWT).

---

## 3. LUỒNG XỬ LÝ DỮ LIỆU (VÍ DỤ TÍNH NĂNG ĐĂNG NHẬP)
Để dễ hình dung, khi người dùng bấm nút "Đăng Nhập":
1. **Frontend (React):** Gọi API `POST /api/auth/login` với `{ username, password }`.
2. **Tầng API:** `AuthController` tiếp nhận, bọc dữ liệu thành đối tượng `LoginCommand` và đẩy cho MediatR: `_mediator.Send(command)`.
3. **Tầng Application:**
   - *Bước 1 (Pipeline):* Đi qua `ValidationBehavior`. Kiểm tra xem password có > 6 ký tự không. Nếu ổn, đi tiếp.
   - *Bước 2 (Handler):* Chạy vào `LoginCommandHandler`. Lấy `IUserRepository` (Interface) ra để tìm user theo Username.
4. **Tầng Infrastructure:** Hàm `GetByUsernameAsync` bên trong `UserRepository` thực thi câu lệnh SQL với Dapper, kết nối tới PostgreSQL để trả về Entity `UserProfile` cho tầng Application.
5. **Tầng Application:** Lấy `IPasswordHasher` để so sánh password. Nếu đúng, gọi `IJwtTokenGenerator` (được triển khai ở Infrastructure) để lấy chuỗi Token. Trả về cho tầng API.
6. **Tầng API:** Trả về mã 200 OK cùng chuỗi Token cho Frontend.

---

## 4. GIẢI THÍCH FRONTEND (`tunevault-client`)
- **Khung dự án (React + Vite):** Đảm bảo tốc độ khởi động và HMR siêu nhanh trong lúc phát triển. Ngôn ngữ TypeScript giúp bắt lỗi chặt chẽ.
- **Styling (Tailwind CSS):** Toàn bộ giao diện Dark Theme được dựng bằng các class tiện ích của Tailwind (`bg-zinc-900`, `text-white`), không cần viết file CSS rời.
- **Cấu trúc thư mục:**
  - `/src/pages`: Chứa các màn hình chính (Home, Search, Library, Login, AlbumDetail...).
  - `/src/components`: Các mảnh ghép UI dùng chung (Sidebar, PlayerBar, VideoCanvas, TopBar...).
  - `/src/context`: Nơi quản lý State toàn cục (Ví dụ: `PlayerContext.tsx` quản lý việc bài hát nào đang phát, để thanh PlayerBar luôn chạy nhạc dù bạn chuyển trang).
  - `/src/services/api.ts`: Nơi cấu hình Axios, tự động nhét chuỗi `Bearer {JWT_Token}` vào mọi Request gọi lên backend.

---

## 5. CÁC TÍNH NĂNG CHỦ CHỐT
- **Phát Nhạc/Video (Streaming):** Dùng thẻ `<audio>` và `<video>` HTML5 kết hợp với API trả về dữ liệu dạng `FileStreamResult` (hỗ trợ Range header). Giúp video không cần tải hết về máy vẫn xem được.
- **Component VideoCanvas:** Một kỹ thuật trên Frontend để chuyển đổi mượt mà giữa chế độ xem thu nhỏ (Right Panel) và xem lớn (Now Playing) mà không làm lag hay reload lại video.
- **Thông báo thời gian thực (Real-time SignalR):** Khi User A chia sẻ nhạc cho User B, Backend sẽ gọi `Hub` SignalR đẩy thẳng lệnh về Client B (đang mở Web) để hiện dấu chấm đỏ thông báo mà không cần F5 trình duyệt.
