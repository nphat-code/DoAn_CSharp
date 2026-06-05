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
            Tracks = tracks.Select(t => new MediaItemDto(
                t.Id,
                t.Title,
                t.Description,
                t.FileUrl,
                t.MediaType.ToString(),
                t.Duration,
                t.UploaderId,
                t.CreatedAt
            )).ToList()
        };

        return detailDto;
    }
}
