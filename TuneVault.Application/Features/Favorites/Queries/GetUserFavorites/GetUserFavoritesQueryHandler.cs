using MediatR;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Favorites.Queries.GetUserFavorites;

public class GetUserFavoritesQueryHandler(IFavoriteRepository favoriteRepository) 
    : IRequestHandler<GetUserFavoritesQuery, IEnumerable<MediaItemDto>>
{
    public async Task<IEnumerable<MediaItemDto>> Handle(GetUserFavoritesQuery request, CancellationToken cancellationToken)
    {
        var favorites = await favoriteRepository.GetUserFavoritesAsync(request.UserId, cancellationToken);
        
        return favorites.Select(f => new MediaItemDto(
            Id: f.MediaItem.Id,
            Title: f.MediaItem.Title,
            Description: f.MediaItem.Description,
            FileUrl: f.MediaItem.FileUrl,
            MediaType: f.MediaItem.MediaType,
            Duration: f.MediaItem.Duration,
            UploaderId: f.MediaItem.UploaderId,
            CreatedAt: f.MediaItem.CreatedAt,
            CoverUrl: f.MediaItem.CoverUrl ?? f.MediaItem.Album?.CoverUrl,
            ArtistName: f.MediaItem.Artist?.Name ?? f.MediaItem.Album?.Artist?.Name,
            ArtistBio: f.MediaItem.Artist?.Bio ?? f.MediaItem.Album?.Artist?.Bio,
            ArtistAvatarUrl: f.MediaItem.Artist?.AvatarUrl ?? f.MediaItem.Album?.Artist?.AvatarUrl,
            AlbumTitle: f.MediaItem.Album?.Title
        ));
    }
}
