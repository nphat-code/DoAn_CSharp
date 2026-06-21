using MediatR;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Media.Commands.UploadMedia;

public class UploadMediaCommandHandler(
    IMediaItemRepository mediaItemRepository,
    IArtistRepository artistRepository,
    IFileStorageService fileStorageService) : IRequestHandler<UploadMediaCommand, MediaItemDto>
{
    public async Task<MediaItemDto> Handle(UploadMediaCommand request, CancellationToken cancellationToken)
    {
        // 1. Tính toán Duration từ stream bằng file tạm TRƯỚC KHI upload
        TimeSpan duration = TimeSpan.FromMinutes(3); // Giá trị mặc định
        try
        {
            var tempFilePath = Path.GetTempFileName() + Path.GetExtension(request.FileName);
            using (var tempFileStream = new FileStream(tempFilePath, FileMode.Create, FileAccess.Write))
            {
                request.FileStream.Position = 0;
                await request.FileStream.CopyToAsync(tempFileStream, cancellationToken);
            }

            using (var tagFile = TagLib.File.Create(tempFilePath))
            {
                if (tagFile.Properties.Duration.TotalSeconds > 0)
                {
                    duration = tagFile.Properties.Duration;
                }
            }

            System.IO.File.Delete(tempFilePath); // Dọn dẹp file tạm
            request.FileStream.Position = 0; // Reset lại stream để upload
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Không thể đọc duration từ file tạm: {ex.Message}");
        }

        // 2. Upload file
        var mediaFolder = request.ContentType.StartsWith("video", StringComparison.OrdinalIgnoreCase) ? "video" : "audio";
        var fileUrl = await fileStorageService.SaveFileAsync(request.FileStream, request.FileName, mediaFolder, cancellationToken);

        string? coverUrl = null;
        if (request.CoverImageStream != null && !string.IsNullOrWhiteSpace(request.CoverImageFileName))
        {
            coverUrl = await fileStorageService.SaveFileAsync(request.CoverImageStream, request.CoverImageFileName, "covers", cancellationToken);
        }
        // 3. Phân loại MediaType dựa trên ContentType hoặc Extension
        string mediaType = request.ContentType.StartsWith("video") ? "Video" : "Audio";

        // Xử lý Nghệ sĩ (Artist)
        Guid? artistId = request.ArtistId;
        string? artistBio = null;
        string? artistAvatarUrl = null;
        if (!artistId.HasValue && !string.IsNullOrWhiteSpace(request.Description))
        {
            var artistName = request.Description.Trim();
            var existingArtist = await artistRepository.GetByNameAsync(artistName, cancellationToken);
            if (existingArtist != null)
            {
                artistId = existingArtist.Id;
                artistBio = existingArtist.Bio;
                artistAvatarUrl = existingArtist.AvatarUrl;
            }
            else
            {
                var newArtist = new Artist
                {
                    Id = Guid.NewGuid(),
                    Name = artistName,
                    CreatedAt = DateTime.UtcNow
                };
                await artistRepository.AddAsync(newArtist, cancellationToken);
                artistId = newArtist.Id;
            }
        }

        // 4. Tạo entity và lưu vào database
        var mediaItem = new MediaItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            FileUrl = fileUrl,
            CoverUrl = coverUrl,
            MediaType = mediaType,
            Duration = duration,
            UploaderId = request.UploaderId,
            ArtistId = artistId,
            AlbumId = request.AlbumId,
            CreatedAt = DateTime.UtcNow
        };

        await mediaItemRepository.AddAsync(mediaItem, cancellationToken);

        // 5. Trả về DTO
        return new MediaItemDto
        {
            Id = mediaItem.Id,
            Title = mediaItem.Title,
            Description = mediaItem.Description,
            FileUrl = mediaItem.FileUrl,
            MediaType = mediaItem.MediaType,
            Duration = mediaItem.Duration,
            UploaderId = mediaItem.UploaderId,
            CreatedAt = mediaItem.CreatedAt,
            CoverUrl = mediaItem.CoverUrl,
            ArtistName = request.Description, // artistName corresponds to Description here
            ArtistBio = artistBio,
            ArtistAvatarUrl = artistAvatarUrl,
            ArtistId = artistId,
            AlbumId = mediaItem.AlbumId
        };
    }
}
