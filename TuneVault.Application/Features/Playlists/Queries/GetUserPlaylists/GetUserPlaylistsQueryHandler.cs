using MediatR;
using TuneVault.Application.Features.Playlists.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlists.Queries.GetUserPlaylists;

public class GetUserPlaylistsQueryHandler(IPlaylistRepository playlistRepository) : IRequestHandler<GetUserPlaylistsQuery, List<PlaylistDto>>
{
    public async Task<List<PlaylistDto>> Handle(GetUserPlaylistsQuery request, CancellationToken cancellationToken)
    {
        var playlists = await playlistRepository.GetUserPlaylistsAsync(request.UserId, cancellationToken);
        return playlists.Select(p => new PlaylistDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            CoverUrl = p.CoverUrl,
            IsPublic = p.IsPublic,
            CreatedAt = p.CreatedAt,
            UserProfileId = p.UserProfileId
        }).ToList();
    }
}
