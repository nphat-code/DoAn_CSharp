using MediatR;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Features.Playlists.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlists.Queries.GetPlaylistDetails;

public class GetPlaylistDetailsQueryHandler(IPlaylistRepository playlistRepository) : IRequestHandler<GetPlaylistDetailsQuery, PlaylistDetailDto?>
{
    public async Task<PlaylistDetailDto?> Handle(GetPlaylistDetailsQuery request, CancellationToken cancellationToken)
    {
        var playlist = await playlistRepository.GetByIdAsync(request.PlaylistId, cancellationToken);
        if (playlist == null) return null;

        var tracks = await playlistRepository.GetTracksByPlaylistIdAsync(request.PlaylistId, cancellationToken);

        var detailDto = new PlaylistDetailDto
        {
            Id = playlist.Id,
            Name = playlist.Name,
            Description = playlist.Description,
            CoverUrl = playlist.CoverUrl,
            IsPublic = playlist.IsPublic,
            CreatedAt = playlist.CreatedAt,
            UserProfileId = playlist.UserProfileId,
            Tracks = tracks.Select(t => new MediaItemDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                FileUrl = t.FileUrl,
                MediaType = t.MediaType,
                Duration = t.Duration,
                UploaderId = t.UploaderId,
                CreatedAt = t.CreatedAt,
                CoverUrl = t.CoverUrl ?? t.Album?.CoverUrl,
                ArtistName = t.Artist?.Name ?? t.Album?.Artist?.Name,
                ArtistBio = t.Artist?.Bio ?? t.Album?.Artist?.Bio,
                ArtistAvatarUrl = t.Artist?.AvatarUrl ?? t.Album?.Artist?.AvatarUrl,
                AlbumTitle = t.Album?.Title
            }).ToList()
        };

        return detailDto;
    }
}
