using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Playlists.Commands.DeletePlaylist;

[Authorize]
public record DeletePlaylistCommand(Guid PlaylistId, Guid UserId) : IRequest<bool>;
