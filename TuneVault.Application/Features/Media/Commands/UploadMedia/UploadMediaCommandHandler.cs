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
        // 1. Lưu file vật lý
        var fileUrl = await fileStorageService.SaveFileAsync(request.FileStream, request.FileName, cancellationToken);

        string? coverUrl = null;
        if (request.CoverImageStream != null && !string.IsNullOrWhiteSpace(request.CoverImageFileName))
        {
            coverUrl = await fileStorageService.SaveFileAsync(request.CoverImageStream, request.CoverImageFileName, cancellationToken);
        }

        // 2. Tính toán Duration từ file thực tế bằng TagLib#
        var physicalPath = fileStorageService.GetPhysicalPath(fileUrl);
        TimeSpan duration = TimeSpan.FromMinutes(3); // Giá trị mặc định
        try
        {
            using var tagFile = TagLib.File.Create(physicalPath);
            if (tagFile.Properties.Duration.TotalSeconds > 0)
            {
                duration = tagFile.Properties.Duration;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Không thể đọc duration từ file: {ex.Message}");
        }
        // 3. Phân loại MediaType dựa trên ContentType hoặc Extension
        string mediaType = request.ContentType.StartsWith("video") ? "Video" : "Audio";

        // Xử lý Nghệ sĩ (Artist)
        Guid? artistId = null;
        string? artistBio = null;
        string? artistAvatarUrl = null;
        if (!string.IsNullOrWhiteSpace(request.Description))
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
            CreatedAt = DateTime.UtcNow
        };

        await mediaItemRepository.AddAsync(mediaItem, cancellationToken);

        // 5. Trả về DTO
        return new MediaItemDto(
            mediaItem.Id,
            mediaItem.Title,
            mediaItem.Description,
            mediaItem.FileUrl,
            mediaItem.MediaType,
            mediaItem.Duration,
            mediaItem.UploaderId,
            mediaItem.CreatedAt,
            mediaItem.CoverUrl,
            request.Description, // artistName corresponds to Description here
            artistBio,
            artistAvatarUrl
        );
    }
}
