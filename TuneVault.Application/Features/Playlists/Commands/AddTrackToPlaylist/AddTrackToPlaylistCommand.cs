using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Playlists.Commands.AddTrackToPlaylist;

[Authorize]
public record AddTrackToPlaylistCommand(
    Guid PlaylistId,
    Guid MediaItemId,
    Guid UserId) : IRequest<bool>;
