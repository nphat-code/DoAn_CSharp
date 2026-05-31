using MediatR;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Media.Commands.UploadMedia;

public class UploadMediaCommandHandler(
    IMediaItemRepository mediaItemRepository,
    IFileStorageService fileStorageService) : IRequestHandler<UploadMediaCommand, MediaItemDto>
{
    public async Task<MediaItemDto> Handle(UploadMediaCommand request, CancellationToken cancellationToken)
    {
        // 1. Lưu file vật lý
        var fileUrl = await fileStorageService.SaveFileAsync(request.FileStream, request.FileName, cancellationToken);

        // 2. Tính toán Duration (Giả lập cho audio/video, trong thực tế cần thư viện FFmpeg hoặc tương tự)
        // Ở đây mình tạm set 0 hoặc mock.
        var duration = TimeSpan.FromMinutes(3); // Mock duration

        // 3. Phân loại MediaType dựa trên ContentType hoặc Extension
        string mediaType = request.ContentType.StartsWith("video") ? "Video" : "Audio";

        // 4. Tạo entity và lưu vào database
        var mediaItem = new MediaItem
        {
            Title = request.Title,
            Description = request.Description,
            FileUrl = fileUrl,
            MediaType = mediaType,
            Duration = duration,
            UploaderId = request.UploaderId
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
            mediaItem.CreatedAt
        );
    }
}
