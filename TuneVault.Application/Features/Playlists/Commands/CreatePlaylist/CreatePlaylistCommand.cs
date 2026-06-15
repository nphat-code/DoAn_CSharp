using TuneVault.Application.Security;
using MediatR;
using TuneVault.Application.Features.Playlists.DTOs;

namespace TuneVault.Application.Features.Playlists.Commands.CreatePlaylist;

[Authorize]
public record CreatePlaylistCommand(
    Guid UserId,
    string Name,
    string? Description,
    bool IsPublic) : IRequest<PlaylistDto>;
