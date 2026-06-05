using MediatR;

namespace TuneVault.Application.Features.Playlists.Commands.RemoveTrackFromPlaylist;

public record RemoveTrackFromPlaylistCommand(
    Guid PlaylistId,
    Guid MediaItemId) : IRequest<bool>;
