using MediatR;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Queries.GetMediaList;

public class GetMediaListQueryHandler(IMediaItemRepository repository) : IRequestHandler<GetMediaListQuery, IEnumerable<MediaItemDto>>
{
    public async Task<IEnumerable<MediaItemDto>> Handle(GetMediaListQuery request, CancellationToken cancellationToken)
    {
        var mediaItems = await repository.GetAllAsync(cancellationToken);

        return mediaItems.Select(m => new MediaItemDto
        {
            Id = m.Id,
            Title = m.Title,
            Description = m.Description,
            FileUrl = m.FileUrl,
            MediaType = m.MediaType,
            Duration = m.Duration,
            UploaderId = m.UploaderId,
            CreatedAt = m.CreatedAt,
            CoverUrl = m.CoverUrl ?? m.Album?.CoverUrl,
            ArtistName = m.Artist?.Name ?? m.Album?.Artist?.Name,
            ArtistBio = m.Artist?.Bio ?? m.Album?.Artist?.Bio,
            ArtistAvatarUrl = m.Artist?.AvatarUrl ?? m.Album?.Artist?.AvatarUrl,
            AlbumTitle = m.Album?.Title
        });
    }
}
