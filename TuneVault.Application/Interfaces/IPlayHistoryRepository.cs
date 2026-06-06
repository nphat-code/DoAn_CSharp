using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IPlayHistoryRepository
{
    Task AddAsync(PlayHistory playHistory, CancellationToken cancellationToken);
    Task<IEnumerable<PlayHistory>> GetUserHistoryAsync(Guid userId, CancellationToken cancellationToken);
}
