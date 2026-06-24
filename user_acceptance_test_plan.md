# Kịch Bản Kiểm Thử Người Dùng (UAT - User Acceptance Testing)

Đây là bản hướng dẫn từng bước để bạn tự đóng vai một người dùng thực tế (End-User) và đi test toàn bộ ngóc ngách của TuneVault. Bạn hãy mở ứng dụng lên và làm theo từng kịch bản (Scenario) dưới đây:

---

## 1. Khởi Đầu (Đăng ký / Đăng nhập)
*   [x] Mở trang web ở chế độ Ẩn danh (Incognito).
*   [x] Đăng ký một tài khoản hoàn toàn mới. Thử nhập sai email hoặc mật khẩu quá ngắn xem ứng dụng có báo lỗi không.
*   [x] Đăng nhập thành công, kiểm tra xem bạn có được chuyển thẳng vào Trang Chủ (Home) và thấy tên mình hiển thị trên góc phải không.
*   [x] Tải lại trang (F5) xem có bị văng ra (đăng xuất) không (Kiểm tra token lưu trữ).

## 2. Tìm Kiếm & Khám Phá (Search & Discover)
*   [x] Bấm vào thanh **Tìm kiếm** ở Sidebar trái.
*   [x] Nhập tên một bài hát hoặc nghệ sĩ bạn biết có trong hệ thống.
*   [x] Kiểm tra các Tab phân loại kết quả: Bài hát, Nghệ sĩ, Album, Danh sách phát. 
*   [x] Bấm vào một kết quả để chắc chắn nó điều hướng đúng trang chi tiết.

## 3. Trải Nghiệm Phát Nhạc (Player)
*   [x] **Phát một bài:** Bấm nút Play xanh lá cây trên một Album hoặc Danh sách phát bất kỳ.
*   [x] **Thanh PlayerBar dưới cùng:**
    *   [x] Bấm Pause / Play xem nhạc có dừng và phát tiếp mượt mà không.
    *   [x] Bấm Chuyển bài (Next) và Quay lại (Prev) xem nhạc có đổi không.
    *   [x] Kéo chuột trên thanh tiến trình (Seek bar) để tua bài hát xem có chính xác không.
    *   [x] Điều chỉnh thanh Âm lượng to/nhỏ/tắt tiếng.
*   [x] Mở bảng danh sách chờ (Queue) ở góc phải PlayerBar để xem bài hát nào sẽ phát tiếp theo.

## 4. Tương Tác Cá Nhân (Like, Follow, Thư Viện)
*   [x] **Like bài hát:** Khi nhạc đang phát, bấm vào icon hình Trái Tim (ở PlayerBar hoặc danh sách bài). Kiểm tra xem tim có đổi màu xanh không.
*   [x] **Bài hát đã thích:** Mở trang "Bài hát đã thích" (Favorites) từ Sidebar. Kiểm tra xem bài hát vừa tim có xuất hiện ở đây không.
*   [x] **Theo dõi nghệ sĩ:** Vào trang Chi tiết Nghệ Sĩ (Click vào tên họ), bấm nút "Theo dõi". 
*   [x] Kiểm tra RightPanel (bảng bên phải) xem trạng thái "Đang theo dõi" đã cập nhật chưa.
*   [x] Kiểm tra Sidebar (Thư viện trái) xem có hiển thị Avatar & tên của nghệ sĩ vừa Follow chưa.

## 5. Quản Lý Danh Sách Phát (Playlist)
*   [x] Bấm nút tạo Playlist mới (Dấu + ở Sidebar).
*   [x] Bấm vào Playlist vừa tạo, bấm **Sửa thông tin chi tiết**: Đổi tên, mô tả và thử upload một ảnh bìa (Cover) mới từ máy tính.
*   [x] Bấm nút **3 chấm** ở một bài hát bất kỳ (ví dụ ở trang Tìm kiếm hoặc trang Album) -> chọn **Thêm vào danh sách phát** -> chọn Playlist vừa tạo.
*   [x] Vào lại Playlist kiểm tra xem bài hát đã nằm trong danh sách chưa.
*   [x] Xóa thử 1 bài hát ra khỏi Playlist.

## 6. Tính Năng Xã Hội (Share & Notification)
*   [x] Bấm **Chia sẻ** một Bài hát hoặc Album cho một người dùng khác (nếu ứng dụng có chức năng chọn user để gửi) hoặc Copy Link.
*   [x] (Nếu có chức năng gửi trong app): Đăng nhập bằng tài khoản người nhận, kiểm tra mục "Trung tâm chia sẻ" (Shared with me) xem có hiện thông báo nhận được nhạc không.
*   [x] Bấm Play trực tiếp từ mục Thông báo xem nhạc có phát ngay lập tức không.

## 7. Giao Diện & UI/UX (Soi lỗi hiển thị)
*   [ ] Phóng to, thu nhỏ cửa sổ trình duyệt (hoặc dùng F12 giả lập điện thoại/tablet) xem layout có bị vỡ, chữ có bị tràn không.
*   [ ] Hover chuột vào các nút Play, Tim, 3 chấm: xem hiệu ứng chuyển đổi có mượt và đúng màu chuẩn (Xanh Spotify) không.
*   [ ] Kiểm tra xem các bảng như Bài hát đã thích, Album có bị lệch các cột "#", "Tiêu đề", "Thời lượng" như lúc trước bạn sửa không.

---
**Mẹo nhỏ:** Hãy bật bảng Console trong DevTools (F12) lên trong quá trình test. Nếu có tính năng nào không hoạt động, chữ báo lỗi màu đỏ sẽ hiện ra ở đó để bạn dễ dàng sửa chữa!
