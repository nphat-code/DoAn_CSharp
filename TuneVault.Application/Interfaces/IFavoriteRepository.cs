using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IFavoriteRepository
{
    
    Task<bool> ToggleFavoriteAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken);
    
    
    Task<bool> IsFavoritedAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken);
    
    
    Task<IEnumerable<Favorite>> GetUserFavoritesAsync(Guid userId, CancellationToken cancellationToken);
}
