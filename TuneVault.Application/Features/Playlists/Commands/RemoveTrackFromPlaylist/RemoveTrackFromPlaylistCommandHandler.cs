using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlists.Commands.RemoveTrackFromPlaylist;

public class RemoveTrackFromPlaylistCommandHandler(IPlaylistRepository playlistRepository) : IRequestHandler<RemoveTrackFromPlaylistCommand, bool>
{
    public async Task<bool> Handle(RemoveTrackFromPlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = await playlistRepository.GetByIdAsync(request.PlaylistId, cancellationToken);
        if (playlist == null || playlist.UserProfileId != request.UserId)
            throw new UnauthorizedAccessException("Bạn không có quyền sửa playlist này.");

        await playlistRepository.RemoveTrackAsync(request.PlaylistId, request.MediaItemId, cancellationToken);
        return true;
    }
}
