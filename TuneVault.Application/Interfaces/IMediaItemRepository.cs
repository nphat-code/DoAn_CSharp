using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IMediaItemRepository
{
    Task<MediaItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IEnumerable<MediaItem>> GetAllAsync(CancellationToken cancellationToken);
    Task<IEnumerable<MediaItem>> SearchAsync(string query, CancellationToken cancellationToken);
    Task AddAsync(MediaItem mediaItem, CancellationToken cancellationToken);
    Task UpdateAsync(MediaItem mediaItem, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
