using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Storage;

public class CloudinaryStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryStorageService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        if (string.IsNullOrEmpty(cloudName) || cloudName == "YOUR_CLOUD_NAME")
        {
            _cloudinary = null!;
        }
        else
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string originalFileName, string folderName = "misc", CancellationToken cancellationToken = default)
    {
        if (_cloudinary == null)
        {
            return $"/mock-cloudinary/{folderName}/{originalFileName}";
        }

        var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileNameWithoutExtension(originalFileName)}";
        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();

        UploadResult uploadResult;

        
        if (ext is ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp")
        {
            var imageParams = new ImageUploadParams()
            {
                File = new FileDescription(originalFileName, fileStream),
                Folder = $"tunevault/{folderName}",
                PublicId = uniqueFileName
            };
            uploadResult = await _cloudinary.UploadAsync(imageParams, cancellationToken);
        }
        else if (ext is ".mp3" or ".wav" or ".mp4")
        {
            var videoParams = new VideoUploadParams()
            {
                File = new FileDescription(originalFileName, fileStream),
                Folder = $"tunevault/{folderName}",
                PublicId = uniqueFileName
            };
            uploadResult = await _cloudinary.UploadAsync(videoParams, cancellationToken);
        }
        else
        {
            var rawParams = new RawUploadParams()
            {
                File = new FileDescription(originalFileName, fileStream),
                Folder = $"tunevault/{folderName}",
                PublicId = uniqueFileName
            };
            
            uploadResult = await Task.Run(() => _cloudinary.Upload(rawParams), cancellationToken);
        }

        if (uploadResult.Error != null)
        {
            Console.WriteLine($"[Cloudinary Upload Error] {uploadResult.Error.Message}");
            return string.Empty;
        }

        return uploadResult.SecureUrl.ToString();
    }

    public string GetPhysicalPath(string fileUrl)
    {
        return fileUrl;
    }

    public async Task DeleteFileAsync(string fileUrl, CancellationToken cancellationToken)
    {
        if (_cloudinary == null || string.IsNullOrEmpty(fileUrl) || !fileUrl.StartsWith("http"))
        {
            return;
        }

        try
        {
            var uploadIndex = fileUrl.IndexOf("upload/");
            if (uploadIndex == -1) return;

            var afterUpload = fileUrl.Substring(uploadIndex + 7);
            
            
            if (afterUpload.StartsWith("v") && afterUpload.Contains("/"))
            {
                var slashIndex = afterUpload.IndexOf("/");
                var versionStr = afterUpload.Substring(1, slashIndex - 1);
                if (long.TryParse(versionStr, out _))
                {
                    afterUpload = afterUpload.Substring(slashIndex + 1);
                }
            }

            
            var lastDot = afterUpload.LastIndexOf(".");
            var publicId = lastDot > 0 ? afterUpload.Substring(0, lastDot) : afterUpload;

            var ext = Path.GetExtension(fileUrl).ToLowerInvariant();
            var resourceType = (ext is ".mp3" or ".wav" or ".mp4") ? ResourceType.Video : ResourceType.Image;
            
            var deletionParams = new DeletionParams(publicId)
            {
                ResourceType = resourceType
            };

            await _cloudinary.DestroyAsync(deletionParams);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Cloudinary Delete Error] {ex.Message}");
        }
    }
}
