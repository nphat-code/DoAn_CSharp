using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IFavoriteRepository
{
    // Returns true if liked, false if unliked
    Task<bool> ToggleFavoriteAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken);
    
    // Check if a specific track is liked by the user
    Task<bool> IsFavoritedAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken);
    
    // Get all favorite tracks of a user
    Task<IEnumerable<Favorite>> GetUserFavoritesAsync(Guid userId, CancellationToken cancellationToken);
}
