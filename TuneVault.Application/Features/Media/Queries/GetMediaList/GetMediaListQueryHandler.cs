using MediatR;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Queries.GetMediaList;

public class GetMediaListQueryHandler(IMediaItemRepository repository) : IRequestHandler<GetMediaListQuery, IEnumerable<MediaItemDto>>
{
    public async Task<IEnumerable<MediaItemDto>> Handle(GetMediaListQuery request, CancellationToken cancellationToken)
    {
        var mediaItems = await repository.GetAllAsync(cancellationToken);

        return mediaItems.Select(m => new MediaItemDto(
            m.Id,
            m.Title,
            m.Description,
            m.FileUrl,
            m.MediaType,
            m.Duration,
            m.UploaderId,
            m.CreatedAt,
            m.CoverUrl,
            m.Artist?.Name,
            m.Artist?.Bio,
            m.Artist?.AvatarUrl
        ));
    }
}
