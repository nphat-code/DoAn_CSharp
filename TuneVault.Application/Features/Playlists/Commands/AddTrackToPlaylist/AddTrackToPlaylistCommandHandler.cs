using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Playlists.Commands.AddTrackToPlaylist;

public class AddTrackToPlaylistCommandHandler(IPlaylistRepository playlistRepository) : IRequestHandler<AddTrackToPlaylistCommand, bool>
{
    public async Task<bool> Handle(AddTrackToPlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = await playlistRepository.GetByIdAsync(request.PlaylistId, cancellationToken);
        if (playlist == null || playlist.UserProfileId != request.UserId)
            throw new UnauthorizedAccessException("Bạn không có quyền sửa playlist này.");

        var playlistTrack = new PlaylistTrack
        {
            PlaylistId = request.PlaylistId,
            MediaItemId = request.MediaItemId,
            AddedAt = DateTime.UtcNow,
            DisplayOrder = 0 
        };

        await playlistRepository.AddTrackAsync(playlistTrack, cancellationToken);
        return true;
    }
}
