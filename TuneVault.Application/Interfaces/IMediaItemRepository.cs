using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IMediaItemRepository
{
    Task<MediaItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task AddAsync(MediaItem mediaItem, CancellationToken cancellationToken);
}
