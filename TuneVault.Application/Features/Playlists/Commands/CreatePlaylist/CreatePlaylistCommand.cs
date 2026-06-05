using MediatR;
using TuneVault.Application.Features.Playlists.DTOs;

namespace TuneVault.Application.Features.Playlists.Commands.CreatePlaylist;

public record CreatePlaylistCommand(
    Guid UserId,
    string Name,
    string? Description,
    bool IsPublic) : IRequest<PlaylistDto>;
