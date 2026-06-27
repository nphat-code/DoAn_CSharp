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

## 🚀 Hướng dẫn chạy local

### 1. Yêu cầu hệ thống (Prerequisites)
- [Docker & Docker Compose](https://www.docker.com/products/docker-desktop/) (Khuyến nghị)
- [Node.js](https://nodejs.org/) (khuyến nghị phiên bản LTS)
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/download/) (Nếu không dùng Docker)

### 2. Cài đặt Database
Có hai cách để khởi tạo database cho ứng dụng (đã bao gồm sẵn toàn bộ dữ liệu mẫu):

- **Cách 1: Sử dụng Docker (Khuyến nghị)**
  Chỉ cần mở terminal tại thư mục gốc và chạy lệnh:
  ```bash
  docker-compose up -d
  ```
  Hệ thống sẽ tự động tạo database `TuneVaultDb` và nạp sẵn cấu trúc + dữ liệu từ file `Database/InitDatabase_Full.sql`.

- **Cách 2: Cài đặt thủ công (Qua pgAdmin)**
  1. Tạo một database mới tên là `TuneVaultDb` trong PostgreSQL.
  2. Mở file `Database/InitDatabase_Full.sql` và thực thi (Run) toàn bộ script để tạo các bảng và nạp dữ liệu mẫu (Seed Data).

### 3. Cấu hình & Chạy Backend (.NET API)
1. Mở terminal, điều hướng tới thư mục chứa API:
   ```bash
   cd TuneVault.API
   ```
2. Mở file `appsettings.json` (hoặc `appsettings.Development.json`) và cập nhật **ConnectionStrings** (chi tiết xem ở phần Connection String bên dưới).
3. Khôi phục các dependencies và khởi chạy ứng dụng:
   ```bash
   dotnet restore
   dotnet run
   ```
4. API sẽ khởi chạy mặc định tại `http://localhost:5183` (có thể kiểm tra cổng (port) trong file `Properties/launchSettings.json`).

### 4. Cấu hình & Chạy Frontend (React/Vite)
1. Mở terminal mới, điều hướng tới thư mục frontend:
   ```bash
   cd tunevault-client
   ```
2. Kiểm tra file `.env` để đảm bảo đã chứa đúng đường dẫn của API. Mặc định là:
   ```env
   VITE_API_URL=http://localhost:5183/api
   ```
3. Cài đặt dependencies và khởi chạy ứng dụng:
   ```bash
   npm install
   npm run dev
   ```

---

## 🔗 Connection String

Yêu cầu chỉnh sửa thuộc tính `DefaultConnection` trong file `appsettings.json` (nếu chạy Production/Local Database) hoặc `appsettings.Development.json` (nếu sử dụng Neon Database).

Ví dụ cấu hình cho Local PostgreSQL (hoặc Docker):
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=TuneVaultDb;Username=postgres;Password=your_password_here"
}
```
- **Host**: Mặc định là `localhost` (Nếu chạy qua Docker thì vẫn là localhost trên máy host).
- **Port**: Cổng mặc định của PostgreSQL là `5432`
- **Database**: Tên database được cấu hình
- **Username / Password**: Tài khoản truy cập PostgreSQL

*(Lưu ý: Các API keys dành cho Cloudinary và Google ClientId cũng cần được cập nhật cấu hình nếu sử dụng các chức năng Lưu trữ và Đăng nhập tương ứng).*

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
