using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Playlists.Commands.AddTrackToPlaylist;

public class AddTrackToPlaylistCommandHandler(IPlaylistRepository playlistRepository) : IRequestHandler<AddTrackToPlaylistCommand, bool>
{
    public async Task<bool> Handle(AddTrackToPlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlistTrack = new PlaylistTrack
        {
            PlaylistId = request.PlaylistId,
            MediaItemId = request.MediaItemId,
            AddedAt = DateTime.UtcNow,
            DisplayOrder = 0 // Tương lai có thể tính toán để cho vào cuối
        };

        await playlistRepository.AddTrackAsync(playlistTrack, cancellationToken);
        return true;
    }
}
