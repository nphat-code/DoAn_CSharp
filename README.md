# TuneVault

TuneVault là ứng dụng nghe nhạc trực tuyến (Music Streaming App).

## 🌟 Các tính năng chính (Core Features)
Hệ thống bao gồm 10 tính năng chính. Xem luồng xử lý dữ liệu chi tiết của từng tính năng tại [FeaturePipelines.md](./FeaturePipelines.md):
1. Xác thực & Quản lý người dùng
2. Quản lý Nghệ sĩ (Đăng ký & Duyệt)
3. Tải lên & Quản lý Media (Âm thanh/Video)
4. Phát nhạc & Video (Streaming)
5. Quản lý Album
6. Quản lý Danh sách phát (Playlist)
7. Tìm kiếm & Khám phá
8. Chia sẻ Media
9. Thông báo thời gian thực (SignalR)
10. Tương tác Người dùng (Likes & Lịch sử nghe)

## 🚀 Hướng dẫn chạy nhanh (Quick Start)

Dự án đã được đóng gói hoàn chỉnh với Docker, giúp bạn có thể chạy ứng dụng mà không cần thiết lập môi trường lập trình phức tạp.

### Yêu cầu duy nhất
- Đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/). 
*(Không cần cài đặt thêm Node.js, .NET SDK hay PostgreSQL).*

### Khởi chạy hệ thống
1. Mở Terminal (Command Prompt / PowerShell) tại thư mục gốc của dự án.
2. Chạy lệnh:
   ```bash
   docker-compose up -d --build
   ```
3. Đợi 1-3 phút để Docker tự động cấu hình Database (nạp sẵn dữ liệu), Backend (.NET) và Frontend (React).
4. Trải nghiệm ứng dụng tại: 👉 **http://localhost:5173**
5. Tắt ứng dụng:
   ```bash
   docker-compose down
   ```

---

## 💻 Chạy thủ công (Dành cho Development)

Nếu bạn muốn tùy chỉnh code và chạy ứng dụng cục bộ không qua Docker, vui lòng thực hiện:

**1. Yêu cầu bổ sung:**
- Node.js (v20 LTS trở lên)
- .NET 8 SDK
- PostgreSQL Server

**2. Cài đặt Database:**
- Tạo database mới tên là `TuneVaultDb` trong pgAdmin.
- Thực thi toàn bộ nội dung file `Database/InitDatabase_Full.sql` để tạo bảng và nạp dữ liệu mẫu (Seed Data).

**3. Chạy Backend (.NET):**
- Trong `TuneVault.API/appsettings.json`, cập nhật chuỗi kết nối:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=TuneVaultDb;Username=postgres;Password=your_password"
  }
  ```
  *(Lưu ý: Cập nhật thêm các API keys của Cloudinary/Google nếu sử dụng)*
- Chạy lệnh khởi động:
  ```bash
  cd TuneVault.API
  dotnet restore
  dotnet run
  ```

**4. Chạy Frontend (React):**
- Ở một Terminal mới:
  ```bash
  cd tunevault-client
  npm install
  npm run dev
  ```
- Đảm bảo biến `VITE_API_URL` trong file `.env` trỏ đúng vào đường dẫn của Backend (Ví dụ: `http://localhost:5183/api`).

---

## 👥 Tài khoản Seed (Chạy thử)

Hệ thống có cơ chế tự động phân quyền Admin cho tài khoản khi người dùng đăng ký **Username** là `admin`. 

Để thực hiện kiểm thử với quyền quản trị viên (Admin), vui lòng sử dụng tài khoản có sẵn sau đây:
- **Email**: `admin@gmail.com`
- **Password**: `admin@12345`

Để kiểm thử với quyền người dùng thông thường (User) cho các tính năng tương tác (theo dõi, chia sẻ bài hát, nghe nhạc v.v.), bạn có thể sử dụng tài khoản test sau:
- **Email**: `test@gmail.com`
- **Password**: `test@12345`

*(Ngoài ra, bạn vẫn có thể đăng ký tài khoản mới bình thường để trải nghiệm toàn bộ luồng hệ thống).*
