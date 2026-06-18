# Hướng Dẫn Triển Khai (Deploy) Dự Án TuneVault 🚀

Tài liệu này sẽ hướng dẫn bạn từng bước từ A-Z để đưa dự án TuneVault từ máy tính cá nhân (localhost) lên môi trường mạng (production). Dự án được chia làm 3 thành phần chính:
1. **Database:** Neon (PostgreSQL Serverless)
2. **Backend (API):** Render (ASP.NET Core 8.0)
3. **Frontend (Client):** Vercel (React + Vite)

---

## Phần 1: Chuẩn bị Code
Trước khi deploy, bạn cần đảm bảo mã nguồn (code) của mình đã được cập nhật những thay đổi mới nhất hỗ trợ môi trường Production.
1. Code Frontend đã loại bỏ các đường dẫn `http://localhost:5183/api` cứng và thay bằng `import.meta.env.VITE_API_URL`.
2. Commit toàn bộ thay đổi và đẩy lên GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Production Deployment"
   git push origin main
   ```

---

## Phần 2: Cơ sở dữ liệu (Neon)
Giả định bạn đã tạo một dự án trên Neon (neon.tech) và đã *import thành công* dữ liệu từ pgAdmin ở dưới máy (Local) lên Neon.

1. Đăng nhập vào trang quản trị **Neon**.
2. Chọn dự án TuneVault.
3. Trong bảng điều khiển (Dashboard), tìm khu vực **Connection Details**.
4. Copy toàn bộ **Connection String** (Dạng: `Host=...;Database=...;Username=...;Password=...` hoặc `postgresql://...`).
5. Cất chuỗi kết nối này ra Note, bạn sẽ cần nó ở Phần 3.

---

## Phần 3: Deploy Backend API (Render)
Render sẽ đóng vai trò làm máy chủ ảo để chạy code C# ASP.NET Core của bạn.

1. Truy cập [Render.com](https://render.com) và đăng nhập.
2. Bấm nút **New +** ở góc phải trên cùng > Chọn **Web Service**.
3. Chọn tùy chọn **Build and deploy from a Git repository**.
4. Chọn tài khoản GitHub của bạn và tìm repo `TuneVault`.
5. Điền thông tin cấu hình cho Web Service:
   - **Name:** `tunevault-api` (hoặc tên tuỳ ý).
   - **Environment:** `Docker` (Quan trọng: Vì đây là dự án C#, Render sẽ đọc file `Dockerfile` ở thư mục Backend để build).
   - **Root Directory:** Bạn điền `TuneVault.API` (hoặc thư mục chứa file `.sln` / `Dockerfile`). Nếu Dockerfile nằm ở gốc dự án thì để trống.
   - **Branch:** `main`
6. **Cài đặt Biến Môi Trường (Environment Variables):**
   Cuộn xuống phần *Advanced*, bấm **Add Environment Variable**. Bạn hãy khai báo y hệt như file `appsettings.Development.json` dưới máy:
   - `ConnectionStrings__DefaultConnection` : *[Dán chuỗi kết nối Neon ở Phần 2 vào đây]*
   - `JwtSettings__Secret` : `[Một chuỗi khóa bảo mật dài ít nhất 32 ký tự, giống ở máy]`
   - `JwtSettings__Issuer` : `TuneVaultAPI`
   - `JwtSettings__Audience` : `TuneVaultClient`
   - `AzureBlobStorage__ConnectionString` : `[Chuỗi kết nối Azure Storage của bạn]`
   - `AzureBlobStorage__ContainerName` : `tunevault-media`
   - `Cloudinary__CloudName` : `dc6avrrgt`
   - `Cloudinary__ApiKey` : `[API Key của bạn]`
   - `Cloudinary__ApiSecret` : `[API Secret của bạn]`
   - `Anthropic__ApiKey` : `[Key Anthropic]`
   - `Gemini__ApiKey` : `[Key Gemini]`
7. Bấm **Create Web Service**. Chờ từ 5-10 phút để Render tải code về, build Docker và khởi động ứng dụng.
8. Sau khi Deploy thành công (hiện chữ xanh **Live**), hãy copy đường dẫn API của bạn (Vd: `https://tunevault-api.onrender.com`).

---

## Phần 4: Deploy Frontend Client (Vercel)
Vercel là dịch vụ tuyệt vời để host các dự án React / Vite.

1. Truy cập [Vercel.com](https://vercel.com) và đăng nhập bằng GitHub.
2. Bấm **Add New...** > **Project**.
3. Import kho lưu trữ `TuneVault` của bạn từ GitHub.
4. Tại màn hình cấu hình dự án (Configure Project):
   - **Project Name:** `tunevault-web`
   - **Framework Preset:** Chọn `Vite`.
   - **Root Directory:** Nhấp vào nút `Edit` và chọn thư mục `tunevault-client` (Vì đây là nơi chứa code Frontend).
5. Mở phần **Environment Variables** và thêm biến sau để React biết gọi API về đâu:
   - Name: `VITE_API_URL`
   - Value: `[Dán đường dẫn của Render ở cuối Phần 3 vào đây]/api` (Vd: `https://tunevault-api.onrender.com/api`)
6. Bấm **Deploy**.
7. Chờ khoảng 1-2 phút. Vercel sẽ build giao diện của bạn. Khi có pháo hoa chúc mừng là xong! 🎇

---

## Phần 5: Cấu hình CORS (Vô cùng quan trọng)
Lúc này Frontend đã chạy trên Vercel, nhưng khi bạn mở lên có thể sẽ không hiện nhạc. Tại vì Backend (Render) đang chặn luồng gọi API từ Vercel vì lý do bảo mật. Bạn cần báo cho Backend biết Vercel là "người nhà".

1. Lấy đường dẫn Frontend của bạn trên Vercel (ví dụ: `https://tunevault-web.vercel.app`).
2. Mở file code `Program.cs` hoặc `Cors` config của dự án Backend (TuneVault.API).
3. Thêm domain của Vercel vào danh sách `AllowOrigins` (Nếu Backend đang để cho phép mọi nguồn `.AllowAnyOrigin()` thì bạn có thể bỏ qua bước này).
4. Nếu phải sửa code C#, bạn hãy commit và push lên GitHub. Render sẽ tự động kéo code mới nhất về và Deploy lại.

---

## 🎉 Hoàn Tất
Truy cập vào tên miền Vercel của bạn (ví dụ: `https://tunevault-web.vercel.app`).
1. Đăng nhập bằng tài khoản test.
2. Thử phát 1 bài hát.
3. Thử tải lên 1 bài hát mới.
Nếu mọi thứ hoạt động trơn tru thì xin chúc mừng, bạn đã deploy thành công!
