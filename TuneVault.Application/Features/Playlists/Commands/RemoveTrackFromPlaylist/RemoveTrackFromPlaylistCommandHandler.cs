using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlists.Commands.RemoveTrackFromPlaylist;

public class RemoveTrackFromPlaylistCommandHandler(IPlaylistRepository playlistRepository) : IRequestHandler<RemoveTrackFromPlaylistCommand, bool>
{
    public async Task<bool> Handle(RemoveTrackFromPlaylistCommand request, CancellationToken cancellationToken)
    {
        await playlistRepository.RemoveTrackAsync(request.PlaylistId, request.MediaItemId, cancellationToken);
        return true;
    }
}
