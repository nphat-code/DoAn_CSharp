using MediatR;

namespace TuneVault.Application.Features.Playlists.Commands.AddTrackToPlaylist;

public record AddTrackToPlaylistCommand(
    Guid PlaylistId,
    Guid MediaItemId) : IRequest<bool>;
