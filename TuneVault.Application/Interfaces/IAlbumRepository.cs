using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IAlbumRepository
{
    Task<IEnumerable<Album>> GetAllAlbumsAsync(CancellationToken cancellationToken);
    Task<Album?> GetAlbumByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IEnumerable<MediaItem>> GetAlbumTracksAsync(Guid albumId, CancellationToken cancellationToken);
    Task<Guid> AddAsync(Album album, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
