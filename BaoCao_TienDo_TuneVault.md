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
**Trạng thái hiện tại:** Đã đưa dự án vào quy trình quản lý Git. Hệ thống Code sạch, tổ chức chuẩn xác, hoàn toàn không có lỗi (Compile thành công 100%). Sẵn sàng để viết các Use Cases (Features) đầu tiên và kết nối API.
