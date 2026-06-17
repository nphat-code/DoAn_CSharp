namespace TuneVault.Application.Interfaces;

public interface IAiService
{
    Task<IEnumerable<(string Title, string Artist)>> GetRecommendationsAsync(string playHistoryContext, string favoritesContext, CancellationToken cancellationToken);
}
