# TuneVault - CQRS Pipeline & Features Architecture Documentation

Tài liệu này cung cấp cái nhìn chuyên sâu về kiến trúc luồng xử lý (Pipeline Architecture) của các chức năng (Features) trong hệ thống TuneVault. Hệ thống tuân thủ nghiêm ngặt **Clean Architecture** và mẫu thiết kế **CQRS (Command Query Responsibility Segregation)** thông qua thư viện `MediatR`.

---

## 1. Global Pipeline Behaviors (Luồng đánh chặn toàn cục)

Thay vì viết code kiểm tra quyền hay dữ liệu lặp đi lặp lại ở mọi Controller hay Handler, hệ thống TuneVault sử dụng **MediatR Pipeline Behaviors** để tạo ra các "trạm kiểm duyệt" toàn cục. Bất kỳ Command hay Query nào được gửi đi (thông qua `mediator.Send()`) đều bắt buộc phải đi qua 2 trạm này:

1. **`AuthorizationBehavior<TRequest, TResponse>`**:
   - **Chức năng:** Kiểm tra quyền truy cập ở mức Application Layer (độc lập với ASP.NET Core MVC).
   - **Cơ chế:** Quét xem Command/Query hiện tại có được đánh dấu (decorate) bởi thuộc tính `[Authorize]` (custom attribute của Application) hay không.
   - **Xử lý:** Gọi `ICurrentUserService.UserId` để xác minh danh tính. Nếu User chưa đăng nhập, tự động ném ra `UnauthorizedException`.

2. **`ValidationBehavior<TRequest, TResponse>`**:
   - **Chức năng:** Tự động hóa kiểm tra tính hợp lệ của dữ liệu đầu vào (Validation) bằng `FluentValidation`.
   - **Cơ chế:** Tự động tìm kiếm tất cả các `IValidator<TRequest>` đã được đăng ký trong hệ thống (Dependency Injection) tương ứng với Command/Query đang chạy.
   - **Xử lý:** Chạy `Task.WhenAll(validators)`. Nếu có bất kỳ lỗi nào (như chuỗi rỗng, ID sai định dạng), ngay lập tức ném ra `ValidationException` chứa danh sách chi tiết các lỗi. Lỗi này sẽ bị `ExceptionHandlingMiddleware` tóm lại và biến đổi thành mã HTTP `400 Bad Request` trả về cho Frontend.

👉 **Lợi ích:** Nhờ 2 Behavior này, các file `CommandHandler` và `QueryHandler` trở nên cực kỳ "sạch" (Clean), chỉ chứa 100% logic nghiệp vụ cốt lõi mà không vướng bận các câu lệnh `if-else` thừa thãi.

---

## 2. Chi tiết Pipeline từng Feature (Chức năng cốt lõi)

Dưới đây là sơ đồ luồng đi chi tiết của dữ liệu cho từng tính năng, từ lúc Request chạm vào API cho đến khi lưu xuống Database bằng Dapper.

### 2.1. Feature: Xác thực người dùng (Auth)
* **Thành phần CQRS**: 
  - *Commands*: `LoginCommand`, `RegisterCommand`
* **Workflow chi tiết (Ví dụ: `RegisterCommand`)**:
  1. **API Endpoint**: Frontend gọi `POST /api/auth/register` truyền JSON `{ username, email, password }`.
  2. **Pipeline - Validation**: `RegisterCommandValidator` được tự động kích hoạt. Nó kiểm tra:
     - `Email` phải đúng định dạng (Regex).
     - `Password` phải có độ dài an toàn và độ phức tạp.
     - `Username` không được để trống.
  3. **Handler (`RegisterCommandHandler`)**:
     - Băm (Hash) mật khẩu sử dụng BCrypt.
     - Sinh UUID mới cho User.
     - Gọi `IAuthRepository.RegisterAsync(user)` để thực hiện câu lệnh SQL `INSERT INTO UserProfiles` qua Dapper.
     - Ném ra `BadRequestException("Email đã tồn tại")` nếu Dapper trả về lỗi Duplicate Key.
     - Khởi tạo JWT Token chứa `ClaimTypes.NameIdentifier` và trả về Client.

### 2.2. Feature: Quản lý Media (Upload, Storage, Stream)
* **Thành phần CQRS**:
  - *Commands*: `UploadMediaCommand`, `DeleteMediaCommand`, `UpdateMediaCommand`
  - *Queries*: `GetMediaByIdQuery`, `GetMediaListQuery`
* **Workflow chi tiết (Ví dụ: `UploadMediaCommand`)**:
  1. **API Endpoint**: Gọi `POST /api/media/upload` dưới dạng `multipart/form-data`. Kestrel được cấu hình nâng mức `MaxRequestBodySize` lên 2GB để cho phép up video 4K.
  2. **Pipeline - Validation**: `UploadMediaCommandValidator` kiểm tra:
     - `File` không được null và phải > 0 bytes.
     - *MIME Type Validation*: Phải bắt đầu bằng `audio/` hoặc `video/` để chống giả mạo đuôi file.
     - *Whitelist Extension*: Đuôi file hợp lệ (.mp3, .wav, .mp4).
  3. **Handler (`UploadMediaCommandHandler`)**:
     - Gọi `IFileStorageService.SaveFileAsync` để ghi byte stream vật lý ra thư mục `wwwroot/uploads/`.
     - Sử dụng thư viện `TagLib#` đọc trực tiếp file vật lý vừa lưu để tự động trích xuất thông tin `Duration` (thời lượng) cực kỳ chính xác.
     - Đóng gói Metadata (Đường dẫn vật lý, Tên, Type, Duration) và lưu vào PostgreSQL qua `IMediaRepository`.

### 2.3. Feature: Quản lý Playlist (Tạo mới, Thêm/Xoá Track)
* **Thành phần CQRS**:
  - *Commands*: `CreatePlaylistCommand`, `AddTrackToPlaylistCommand`, `RemoveTrackFromPlaylistCommand`, `DeletePlaylistCommand`
  - *Queries*: `GetUserPlaylistsQuery`, `GetPlaylistByIdQuery`
* **Workflow chi tiết (Ví dụ: `AddTrackToPlaylistCommand`)**:
  1. **API Endpoint**: Gọi `POST /api/playlists/{id}/tracks`. Controller tự động bóc `UserId` từ JWT Claims để nạp vào Command.
  2. **Pipeline - Validation**: Kiểm tra chuỗi UUID hợp lệ, không rỗng.
  3. **Handler (`AddTrackToPlaylistCommandHandler`)**:
     - **Ownership Check**: Gọi DB kiểm tra xem `UserId` hiện tại có phải là người tạo ra Playlist này không. Nếu không phải (cố ý hack), lập tức ném ra `UnauthorizedException` (hoặc `ForbiddenAccessException`).
     - **Duplication Check**: Đảm bảo bài hát chưa tồn tại trong Playlist này.
     - **Execute**: Gọi Dapper thực thi `INSERT INTO PlaylistItems (PlaylistId, MediaItemId, AddedAt)`.

### 2.4. Feature: Chia sẻ Media & Real-time Notification (SignalR)
* **Thành phần CQRS**:
  - *Commands*: `ShareMediaCommand`
  - *Queries*: `GetSharedWithMeQuery`, `GetSharedByMeQuery`
* **Workflow chi tiết (`ShareMediaCommand`)**:
  1. **API Endpoint**: `POST /api/share`. Nhận Payload `{ ReceiverId, MediaId, Message }`.
  2. **Pipeline - Validation**: `ShareMediaCommandValidator` chặn tin nhắn rỗng hoặc tin nhắn dài vượt mức 500 ký tự (Chống spam DB).
  3. **Handler & Repository**: Đây là luồng phức tạp nhất, được bọc cẩn thận trong một `IDbTransaction` duy nhất:
     - *Receiver Existence Check*: Kiểm tra `ReceiverId` có tồn tại trong hệ thống. Ném `KeyNotFoundException` nếu không tìm thấy.
     - *Idempotency Check*: Rà soát bảng `MediaShares`, nếu người gửi đã share bài này cho người nhận rồi thì trả về `false` ngay (Không ném lỗi, kết thúc im lặng để tránh rác DB).
     - *Polymorphic Insertion*: Dapper tự động kiểm tra `MediaId` thuộc về Bài Hát, Album, hay Playlist để gán nó vào đúng cột tương ứng (PlaylistId, AlbumId, hoặc MediaItemId) trong bảng `MediaShares`.
     - *Notification Generation*: Cùng lúc lưu một bản ghi vào bảng `Notifications` với cờ `IsRead = false`.
     - *Commit Transaction*: Hoàn tất ghi dữ liệu xuống ổ cứng.
  4. **Real-time Push**: Handler gọi `INotificationService`, sử dụng `IHubContext` của SignalR bắn trực tiếp sự kiện `ReceiveNotification` vào đúng Socket Connection của `ReceiverId` để hiển thị popup mà không cần F5.

### 2.5. Feature: Quản lý thông báo (Notifications)
* **Thành phần CQRS**:
  - *Commands*: `MarkNotificationAsReadCommand`, `MarkAllNotificationsAsReadCommand`
  - *Queries*: `GetNotificationsQuery`
* **Workflow chi tiết (`MarkAllNotificationsAsReadCommand`)**:
  1. **API Endpoint**: `PUT /api/notifications/read-all`.
  2. **Pipeline**: Trích xuất `UserId` từ Context.
  3. **Handler**: Thay vì lấy từng thông báo ra update, Handler tối ưu hóa hiệu năng bằng cách gọi 1 câu SQL nguyên thuỷ qua Dapper: `UPDATE Notifications SET IsRead = true WHERE UserId = @UserId`. Trả về `204 No Content`. Hiệu năng đạt mức tối đa (O(1) query).
