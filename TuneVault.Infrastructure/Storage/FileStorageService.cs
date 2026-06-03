using TuneVault.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace TuneVault.Infrastructure.Storage;

public class FileStorageService(IWebHostEnvironment env) : IFileStorageService
{
    public async Task<string> SaveFileAsync(Stream fileStream, string originalFileName, CancellationToken cancellationToken)
    {
        // Thư mục lưu trữ: wwwroot/media
        var uploadsFolder = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "media");
        
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        // Tạo tên file duy nhất tránh trùng lặp
        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(originalFileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);
        }

        // Trả về URL tương đối để client có thể truy cập
        return $"/media/{uniqueFileName}";
    }

    public string GetPhysicalPath(string fileUrl)
    {
        // Chuyển /media/filename.mp3 thành đường dẫn vật lý trên ổ cứng
        var fileName = Path.GetFileName(fileUrl);
        var uploadsFolder = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "media");
        return Path.Combine(uploadsFolder, fileName);
    }
}
