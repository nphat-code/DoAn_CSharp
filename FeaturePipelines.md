# Tài liệu Mô tả Pipeline các Tính năng (TuneVault)

## Kiến trúc Pipeline chung
Dự án áp dụng kiến trúc **CQRS (Command Query Responsibility Segregation)** kết hợp **MediatR** và **Dapper**.
Mô hình luồng dữ liệu (Pipeline) tổng quát cho hầu hết các tính năng diễn ra theo 6 bước:
`React Frontend` ➜ `API Controller` ➜ `MediatR` ➜ `Command/Query Handler` ➜ `Dapper (Repository)` ➜ `PostgreSQL (NeonDB)`

---

## 1. Xác thực & Quản lý người dùng (Authentication)
* **Pipeline:** Login/Register Component ➜ `AuthController` ➜ `AuthService / JwtProvider` ➜ `UserRepository` ➜ Bảng `UserProfiles`.
* **Chi tiết:** Khi người dùng gửi form đăng nhập, API Controller kiểm tra tính hợp lệ và xác thực mật khẩu. Nếu hợp lệ, `JwtProvider` sinh ra token (JWT). Token này trả về và được lưu ở LocalStorage phía Client để đính kèm vào Header (`Authorization: Bearer`) cho các request bảo mật sau này.

## 2. Quản lý Nghệ sĩ (Artist Registration)
* **Pipeline:** Form Đăng ký ➜ `ArtistController` ➜ `CreateArtistRegistrationCommand` ➜ `ArtistRegistrationRepository` ➜ Bảng `ArtistRegistrations`.
* **Chi tiết:** Người dùng gửi yêu cầu trở thành nghệ sĩ (kèm ảnh giấy tờ). MediatR Command lưu thông tin vào bảng đăng ký với trạng thái "Pending" (Chờ duyệt). Khi Quản trị viên (Admin) duyệt (Approve), hệ thống sẽ kích hoạt một Event tự động chuyển dữ liệu của User sang bảng `Artists`.

## 3. Tải lên & Quản lý Media (Media Upload)
* **Pipeline:** UploadModal ➜ `MediaController` ➜ `UploadMediaCommand` ➜ `CloudinaryService` (Lưu file) & `MediaRepository` (Lưu metadata) ➜ Bảng `MediaItems`.
* **Chi tiết:** File âm thanh/video và ảnh bìa được upload trực tiếp lên dịch vụ Cloud (Cloudinary) thông qua SDK. Sau khi Cloudinary trả về đường dẫn URL an toàn, Command Handler mới tiến hành lưu URL này cùng các metadata (Tiêu đề, Mô tả, ArtistId) vào cơ sở dữ liệu.

## 4. Phát nhạc & Video (Media Playback / Streaming)
* **Pipeline:** PlayerBar/VideoPlayer ➜ `MediaController` ➜ `GetMediaItemQuery` ➜ `MediaRepository` ➜ Bảng `MediaItems`.
* **Chi tiết:** Trình phát nhạc phía React fetch dữ liệu chi tiết của Media. Sử dụng `FileUrl` để load nội dung stream. Khi bài hát bắt đầu phát hợp lệ, Frontend sẽ gọi ngầm một API khác để ghi nhận lượt nghe (tăng ViewCount).

## 5. Quản lý Album
* **Pipeline:** Album Form ➜ `AlbumController` ➜ `CreateAlbumCommand` ➜ `AlbumRepository` ➜ Bảng `Albums`.
* **Chi tiết:** Nghệ sĩ tạo Album mới. Dữ liệu Album đóng vai trò như một bộ sưu tập. Các bài hát (`MediaItems`) tải lên sau đó có thể được gán `AlbumId` (Foreign Key) để nhóm lại với nhau khi truy vấn.

## 6. Quản lý Danh sách phát (Playlist Management)
* **Pipeline:** PlaylistDetail Component ➜ `PlaylistController` ➜ `AddTrackToPlaylistCommand` ➜ `PlaylistRepository` ➜ Bảng `PlaylistItems`.
* **Chi tiết:** Người dùng tạo Playlist mới (bảng `Playlists`). Khi thêm bài hát vào danh sách, Handler thực thi câu lệnh SQL `INSERT` vào bảng trung gian nhiều-nhiều `PlaylistItems`, liên kết giữa `PlaylistId` và `MediaItemId`.

## 7. Tìm kiếm & Khám phá (Search & Discovery)
* **Pipeline:** SearchBar ➜ `MediaController` (Search API) ➜ `SearchMediaQuery` ➜ `SearchRepository` ➜ Bảng `MediaItems`, `Artists`, `Playlists`.
* **Chi tiết:** Nhận từ khóa tìm kiếm (keyword) từ Frontend, Query Handler dùng Dapper để thực thi các câu lệnh SQL sử dụng toán tử `ILIKE` để tìm kiếm tương đối (không phân biệt hoa thường) đồng thời trên 3 bảng: Bài hát, Nghệ sĩ và Danh sách phát, sau đó gom nhóm kết quả trả về.

## 8. Chia sẻ Media (Media Sharing)
* **Pipeline:** ShareMediaModal ➜ `ShareController` ➜ `CreateShareCommand` ➜ `ShareRepository` ➜ Bảng `MediaShares`.
* **Chi tiết:** Người dùng chọn bài hát, nhập lời nhắn và chọn tài khoản người nhận. Command Handler lưu thông tin chia sẻ vào DB. Ngay sau khi lưu thành công, Handler sẽ gửi một thông báo (Feature 9) tới người nhận.

## 9. Thông báo thời gian thực (Real-time Notifications)
* **Pipeline:** Backend Triggers (Share/Follow) ➜ `NotificationService` ➜ `SignalR Hub` ➜ React `NotificationContext`.
* **Chi tiết:** Sử dụng WebSockets (thông qua thư viện SignalR). Mỗi khi có sự kiện chia sẻ hoặc theo dõi, Backend lưu log vào bảng `Notifications`, đồng thời gọi `IHubContext` đẩy thẳng thông báo (Push Notification) xuống trình duyệt của user nhận (dựa trên `UserId` đang kết nối) mà không cần reload trang.

## 10. Tương tác Người dùng (Likes & Lịch sử nghe)
* **Pipeline:** 
  - **Like:** Heart Button ➜ `FavoritesController` ➜ `ToggleFavoriteCommand` ➜ `FavoriteRepository` ➜ Bảng `Favorites`.
  - **History:** Media Player ➜ `HistoryController` ➜ `AddPlayHistoryCommand` ➜ `PlayHistoryRepository` ➜ Bảng `PlayHistory`.
* **Chi tiết:** 
  - **Like:** Thực hiện cơ chế Toggle (nếu chưa có thì INSERT, nếu có rồi thì DELETE) vào bảng `Favorites`.
  - **History:** Tự động ghi nhận thời điểm nghe (PlayedAt) vào bảng `PlayHistory` để sau này phục vụ cho việc hiển thị danh sách "Recently Played" trên trang chủ.
