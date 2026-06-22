using MediatR;

namespace TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist;

public record UpdatePlaylistCommand(Guid PlaylistId, Guid UserId, string Name, string? Description, string? CoverUrl, bool? IsPublic) : IRequest<bool>;
