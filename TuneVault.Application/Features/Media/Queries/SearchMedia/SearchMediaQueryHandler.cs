using MediatR;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Queries.SearchMedia;

public class SearchMediaQueryHandler(IMediaItemRepository repository) : IRequestHandler<SearchMediaQuery, IEnumerable<MediaItemDto>>
{
    public async Task<IEnumerable<MediaItemDto>> Handle(SearchMediaQuery request, CancellationToken cancellationToken)
    {
        var mediaItems = await repository.SearchAsync(request.Query, cancellationToken);
        
        return mediaItems.Select(m => new MediaItemDto(
            m.Id,
            m.Title,
            m.Description,
            m.FileUrl,
            m.MediaType.ToString(),
            m.Duration,
            m.UploaderId,
            m.CreatedAt
        ));
    }
}
