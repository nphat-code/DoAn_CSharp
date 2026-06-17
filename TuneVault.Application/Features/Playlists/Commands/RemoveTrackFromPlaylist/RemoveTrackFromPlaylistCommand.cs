using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Playlists.Commands.RemoveTrackFromPlaylist;

[Authorize]
public record RemoveTrackFromPlaylistCommand(
    Guid PlaylistId,
    Guid MediaItemId,
    Guid UserId) : IRequest<bool>;
