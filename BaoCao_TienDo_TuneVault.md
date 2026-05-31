# BÁO CÁO TIẾN ĐỘ ĐỒ ÁN: TUNEVAULT (MEDIA STREAMING APP)
**Kiến trúc:** Clean Architecture + CQRS với ASP.NET Core 8 & Entity Framework Core

---

## 1. Khởi tạo Cấu trúc Solution (Clean Architecture)
Hệ thống đã được phân chia thành 4 dự án (projects) tuân thủ nghiêm ngặt Dependency Rule của Clean Architecture:
- **TuneVault.Domain:** Lõi của ứng dụng, chứa các Entities và Interfaces. Không phụ thuộc vào bất kỳ framework nào.
- **TuneVault.Application:** Chứa các Use Cases (CQRS với MediatR). Phụ thuộc vào `Domain`.
- **TuneVault.Infrastructure:** Triển khai truy cập cơ sở dữ liệu (EF Core). Phụ thuộc vào `Application`.
- **TuneVault.API:** Tầng giao diện người dùng (Web API). Phụ thuộc vào `Application` và `Infrastructure`.

---

## 2. Thiết kế Tầng Domain (Entities & Relationships)
Đã hoàn thiện thiết kế 11 thực thể (Entities) cốt lõi phục vụ nghiệp vụ nghe nhạc:

### Các thực thể chính:
1. **UserProfile:** Thông tin người dùng. Dự kiến tích hợp với `AspNetUsers` của Identity.
2. **Artist:** Thông tin nghệ sĩ.
3. **Album:** Tập hợp các bài hát của nghệ sĩ.
4. **MediaItem:** Thực thể bài hát/track âm thanh.
5. **Playlist:** Danh sách phát nhạc cá nhân.
6. **Notification:** Thông báo hệ thống.

### Các bảng trung gian giải quyết quan hệ Nhiều-Nhiều (N-N):
7. **PlaylistTrack:** Nối `Playlist` và `MediaItem` (Có thêm trường `DisplayOrder` để sắp xếp bài hát).
8. **Favorite:** Nối `UserProfile` và `MediaItem` (Danh sách nhạc yêu thích).
9. **PlayHistory:** Nối `UserProfile` và `MediaItem` (Lịch sử nghe nhạc).
10. **Follow:** Nối `UserProfile` và `UserProfile` (Hệ thống theo dõi/Follower).
11. **MediaShare:** Nối `Sender (UserProfile)`, `Receiver (UserProfile)` và `MediaItem` (Tính năng chia sẻ nhạc).

---

## 3. Cấu hình Tầng Infrastructure (EF Core Fluent API)
Đã triển khai class `TuneVaultDbContext` với cấu hình Fluent API chi tiết:
- **Khóa chính phức hợp (Composite Primary Keys):** Thiết lập khóa chính kết hợp cho các bảng trung gian (`PlaylistTrack`, `Favorite`, `Follow`) để tối ưu hóa CSDL thay vì tạo thêm cột Id dư thừa.
- **Xử lý giới hạn Multiple Cascade Paths của SQL Server:** Áp dụng `.OnDelete(DeleteBehavior.Restrict)` một cách chiến lược tại các bảng `MediaShare` (SenderId/ReceiverId), `Follow` (Follower/Followee) và `MediaItem` (Artist) để ngăn chặn lỗi xóa vòng lặp đặc thù của SQL Server mà không làm mất tính toàn vẹn của dữ liệu.

---

## 4. Triển khai Tầng Application (MediatR Pipeline Behaviors)
Tầng Application đã được thiết lập bộ khung xử lý Request hoàn chỉnh dựa trên Decorator Pattern, tách biệt logic nghiệp vụ khỏi các tác vụ cắt ngang (Cross-cutting concerns):

### a. Custom Exceptions
Đã tạo ra các chuẩn lỗi thống nhất cho toàn hệ thống:
- `ValidationException`: Gói gọn các lỗi kiểm tra dữ liệu đầu vào.
- `UnauthorizedException` & `ForbiddenAccessException`: Các lỗi liên quan đến bảo mật và phân quyền.

### b. Pipeline Behaviors (Đường ống xử lý)
- **AuthorizationBehavior:** Tự động chặn và kiểm tra các Request có gắn Attribute `[Authorize]`. Đảm bảo user có quyền trước khi hệ thống thực thi lệnh.
- **ValidationBehavior:** Tự động thu thập tất cả các `IValidator` (FluentValidation) của một Request, chạy xác thực (validate) dữ liệu đầu vào. Nếu dữ liệu sai định dạng/trống, chặn Request và ném ra `ValidationException` chứa chi tiết lỗi.

### c. Dependency Injection
Thiết lập file `DependencyInjection.cs` gom nhóm toàn bộ cấu hình:
- Tự động đăng ký tất cả Validators và CQRS Handlers thông qua việc quét (Scan) Assembly.
- Cấu hình thứ tự chạy Pipeline một cách an toàn: **Authorization** -> **Validation** -> **Business Logic (Handler)**.

---

## 5. Quản lý mã nguồn (Git)
- Đã khởi tạo Git repository nội bộ (`git init`) và liên kết với remote repository (`nphat-code/DoAn_CSharp`).
- Cấu hình file `.gitignore` tiêu chuẩn cho dự án .NET nhằm tự động loại bỏ các thư mục rác như `bin/`, `obj/`, file cấu hình cá nhân ra khỏi phiên bản quản lý mã nguồn, giữ cho repository luôn sạch sẽ.

---

## 6. Chức năng Xác thực & Đăng nhập (JWT Login)
- **Application Layer:** 
  - Triển khai CQRS pattern: `LoginCommand` (đầu vào) và `LoginResponseDto` (đầu ra).
  - Viết `LoginCommandValidator` bằng FluentValidation để kiểm tra `Username` không được rỗng, `Password` tối thiểu 6 ký tự.
  - Viết `LoginCommandHandler` thực hiện logic đăng nhập thông qua các Interface trừu tượng (`IUserRepository`, `IPasswordHasher`, `IJwtTokenGenerator`).
- **Infrastructure Layer:**
  - Thực thi (implement) logic băm mật khẩu với thuật toán an toàn `BCrypt`.
  - Sinh chuỗi JWT Token qua `JwtTokenGenerator` dựa trên cấu hình ở `appsettings.json`.
  - Thiết lập Repository đơn giản cho `UserProfile`.
- **API Layer:**
  - Tạo `AuthController` với Endpoint `[POST] /api/auth/login`. Controller hoàn toàn sạch, chỉ làm nhiệm vụ nhận Request và chuyển cho MediatR xử lý `_mediator.Send(command)`.

---

## 7. Chức năng Quản lý Media (Upload Media)
- **Application Layer:**
  - `UploadMediaCommand`: Nhận đầu vào bao gồm `Title`, `Description` và nội dung file vật lý dưới dạng `Stream` (giữ cho tầng Application không bị phụ thuộc vào `IFormFile` của ASP.NET Core, đảm bảo Clean Architecture).
  - `UploadMediaCommandValidator`: Sử dụng FluentValidation để kiểm tra tiêu đề và định dạng file whitelist (`.mp3`, `.mp4`, `.wav`).
  - `UploadMediaCommandHandler`: Nhận command, ghi file xuống đĩa (thông qua `IFileStorageService`), phân loại Audio/Video tự động và lưu thông tin vào SQL thông qua `IMediaRepository`.
- **Infrastructure Layer:**
  - `FileStorageService`: Hiện thực hóa việc ghi đè stream vào thư mục `wwwroot/media` (tránh trùng tên bằng `Guid`).
  - `MediaRepository`: Lưu đối tượng `MediaItem` vào cơ sở dữ liệu.
- **API Layer:**
  - `MediaController`: Xây dựng endpoint `[POST] /api/media/upload`, nhận file multi-part form data, trích xuất `UploaderId` từ JWT Token an toàn và chuyển xuống cho MediatR.
  - Kích hoạt `app.UseStaticFiles()` trong `Program.cs` để hỗ trợ việc truyền phát (streaming) file sau khi lưu.

---
**Trạng thái hiện tại:** Dự án đã có luồng đăng nhập (Authentication) JWT tiêu chuẩn, đầy đủ Validation, mã hóa mật khẩu, và luồng Upload File chuẩn Clean Architecture. Toàn bộ Code đã được nâng cấp (Refactor) áp dụng cú pháp hiện đại của **C# 14** (như Primary Constructors) và tối ưu cấu hình của **ASP.NET Core 10**. Code Compile thành công 100%.
