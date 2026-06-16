using MediatR;
using TuneVault.Application.Features.Albums.DTOs;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Albums.Queries.GetAlbumById;

public class GetAlbumByIdQueryHandler(IAlbumRepository albumRepository) 
    : IRequestHandler<GetAlbumByIdQuery, AlbumDetailDto?>
{
    public async Task<AlbumDetailDto?> Handle(GetAlbumByIdQuery request, CancellationToken cancellationToken)
    {
        var album = await albumRepository.GetAlbumByIdAsync(request.Id, cancellationToken);
        if (album == null) return null;
        
        var tracks = await albumRepository.GetAlbumTracksAsync(request.Id, cancellationToken);
        
        var trackDtos = tracks.Select(t => new MediaItemDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            FileUrl = t.FileUrl,
            MediaType = t.MediaType,
            Duration = t.Duration,
            UploaderId = t.UploaderId,
            CreatedAt = t.CreatedAt,
            CoverUrl = t.CoverUrl ?? album.CoverUrl,
            ArtistName = t.Artist?.Name ?? album.Artist?.Name,
            ArtistBio = t.Artist?.Bio ?? album.Artist?.Bio,
            ArtistAvatarUrl = t.Artist?.AvatarUrl ?? album.Artist?.AvatarUrl,
            AlbumTitle = album.Title
        }).ToList();

        return new AlbumDetailDto(
            Id: album.Id,
            Title: album.Title,
            CoverUrl: album.CoverUrl,
            ReleaseDate: album.ReleaseDate,
            ArtistId: album.ArtistId,
            ArtistName: album.Artist?.Name ?? "Unknown Artist",
            ArtistImageUrl: album.Artist?.AvatarUrl,
            Tracks: trackDtos
        );
    }
}
