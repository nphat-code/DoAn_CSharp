using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IArtistRepository
{
    Task<Artist?> GetByNameAsync(string name, CancellationToken cancellationToken);
    Task<Artist?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task AddAsync(Artist artist, CancellationToken cancellationToken);
    Task<IEnumerable<Artist>> GetAllAsync(CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}