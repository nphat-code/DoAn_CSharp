using TuneVault.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace TuneVault.Infrastructure.Storage;

public class FileStorageService(IWebHostEnvironment env) : IFileStorageService
{
    public async Task<string> SaveFileAsync(Stream fileStream, string originalFileName, string folderName = "misc", CancellationToken cancellationToken = default)
    {

        var uploadsFolder = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads", folderName);
        
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(originalFileName)}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStreamOutput = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);
        }

        return $"/uploads/{folderName}/{uniqueFileName}";
    }

    public string GetPhysicalPath(string fileUrl)
    {
        var relativePath = fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var wwwrootPath = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        return Path.Combine(wwwrootPath, relativePath);
    }

    public Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken)
    {
        var filePath = GetPhysicalPath(fileUrl);
        if (File.Exists(filePath))
        {
            try 
            {
                File.Delete(filePath);
            }
            catch (IOException ex)
            {
                
                
                Console.WriteLine($"Không thể xóa file vật lý (có thể đang bị khóa): {ex.Message}");
            }
        }
        return Task.CompletedTask;
    }
}
