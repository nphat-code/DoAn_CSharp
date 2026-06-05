using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IPlaylistRepository
{
    Task<Playlist?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IEnumerable<Playlist>> GetUserPlaylistsAsync(Guid userId, CancellationToken cancellationToken);
    Task AddAsync(Playlist playlist, CancellationToken cancellationToken);
    Task UpdateAsync(Playlist playlist, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    
    Task AddTrackAsync(PlaylistTrack playlistTrack, CancellationToken cancellationToken);
    Task RemoveTrackAsync(Guid playlistId, Guid mediaItemId, CancellationToken cancellationToken);
    Task<IEnumerable<MediaItem>> GetTracksByPlaylistIdAsync(Guid playlistId, CancellationToken cancellationToken);
}
