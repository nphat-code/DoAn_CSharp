using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Interfaces;

public interface IRecommendationRepository
{
    Task<string> GetUserHistoryContextAsync(Guid userId, CancellationToken cancellationToken);
    Task<string> GetUserFavoritesContextAsync(Guid userId, CancellationToken cancellationToken);
    Task<IEnumerable<MediaItemDto>> SearchMediaByAiRecommendationsAsync(IEnumerable<(string Title, string Artist)> recommendations, CancellationToken cancellationToken);
    Task<IEnumerable<MediaItemDto>> GetFallbackRecommendationsAsync(CancellationToken cancellationToken);
}
