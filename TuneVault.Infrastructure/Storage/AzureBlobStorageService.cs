using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Storage;

public class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;

    public AzureBlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureBlobStorage:ConnectionString"];
        _containerName = configuration["AzureBlobStorage:ContainerName"] ?? "tunevault-media";
        
        if (string.IsNullOrEmpty(connectionString) || connectionString == "YOUR_AZURE_BLOB_CONNECTION_STRING")
        {
            // Trả về null client để fallback nếu chưa cấu hình
            _blobServiceClient = null!;
        }
        else
        {
            _blobServiceClient = new BlobServiceClient(connectionString);
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string originalFileName, string folderName = "misc", CancellationToken cancellationToken = default)
    {
        if (_blobServiceClient == null)
        {
            // Nếu chưa có connection string thật, trả về link giả để không bị lỗi ứng dụng
            return $"/mock-azure-blob/{folderName}/{originalFileName}";
        }

        var blobContainerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        
        // Tạo container nếu chưa có và cấp quyền đọc Public để frontend có thể play nhạc
        await blobContainerClient.CreateIfNotExistsAsync(PublicAccessType.Blob, cancellationToken: cancellationToken);

        var uniqueFileName = $"{folderName}/{Guid.NewGuid()}_{Path.GetFileName(originalFileName)}";
        var blobClient = blobContainerClient.GetBlobClient(uniqueFileName);

        // Reset lại stream nếu stream có hỗ trợ (ví dụ vừa được đọc trước đó)
        if (fileStream.CanSeek)
        {
            fileStream.Position = 0;
        }

        await blobClient.UploadAsync(fileStream, new BlobUploadOptions
        {
            HttpHeaders = new BlobHttpHeaders { ContentType = GetContentType(originalFileName) }
        }, cancellationToken);

        // Trả về đường link trực tiếp tới file trên Azure
        return blobClient.Uri.ToString();
    }

    public string GetPhysicalPath(string fileUrl)
    {
        // Azure Blob không dùng đường dẫn vật lý cục bộ, trả về chính URL đó
        return fileUrl;
    }

    public async Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken)
    {
        if (_blobServiceClient == null || string.IsNullOrEmpty(fileUrl) || !fileUrl.StartsWith("http"))
        {
            return;
        }

        try
        {
            var uri = new Uri(fileUrl);
            // Parse tên blob từ URL (bỏ qua domain và container)
            var blobName = uri.Segments.Skip(2).Select(s => Uri.UnescapeDataString(s)).Aggregate((a, b) => a + b);
            
            var blobContainerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = blobContainerClient.GetBlobClient(blobName);

            await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Azure Blob Delete Error] {ex.Message}");
        }
    }

    private string GetContentType(string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".mp4" => "video/mp4",
            _ => "application/octet-stream"
        };
    }
}
