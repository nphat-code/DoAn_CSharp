using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlists.Commands.DeletePlaylist;

public class DeletePlaylistCommandHandler(IPlaylistRepository playlistRepository) : IRequestHandler<DeletePlaylistCommand, bool>
{
    public async Task<bool> Handle(DeletePlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = await playlistRepository.GetByIdAsync(request.PlaylistId, cancellationToken);
        if (playlist == null || playlist.UserProfileId != request.UserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa Playlist này.");
        }

        await playlistRepository.DeleteAsync(request.PlaylistId, cancellationToken);
        return true;
    }
}
