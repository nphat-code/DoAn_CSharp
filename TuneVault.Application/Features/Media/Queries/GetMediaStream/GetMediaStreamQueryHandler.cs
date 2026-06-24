using MediatR;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Queries.GetMediaStream;

public class GetMediaStreamQueryHandler(
    IMediaItemRepository mediaItemRepository,
    IFileStorageService fileStorageService) : IRequestHandler<GetMediaStreamQuery, MediaStreamDto>
{
    public async Task<MediaStreamDto> Handle(GetMediaStreamQuery request, CancellationToken cancellationToken)
    {
        var mediaItem = await mediaItemRepository.GetByIdAsync(request.MediaId, cancellationToken);
        if (mediaItem == null)
        {
            throw new Exception("Media not found."); 
        }

        var physicalPath = fileStorageService.GetPhysicalPath(mediaItem.FileUrl);

        if (!File.Exists(physicalPath))
        {
            throw new Exception("Media file is missing on the server.");
        }

        var contentType = mediaItem.MediaType.ToLower() == "video" ? "video/mp4" : "audio/mpeg";

        return new MediaStreamDto(physicalPath, contentType);
    }
}
