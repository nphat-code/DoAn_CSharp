using MediatR;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Ai.Queries.GetAiRecommendations;

public class GetAiRecommendationsQueryHandler(
    IRecommendationRepository recommendationRepository,
    IAiService aiService) : IRequestHandler<GetAiRecommendationsQuery, IEnumerable<MediaItemDto>>
{
    public async Task<IEnumerable<MediaItemDto>> Handle(GetAiRecommendationsQuery request, CancellationToken cancellationToken)
    {
        // 1. Get play history and favorite strings
        var historyContext = await recommendationRepository.GetUserHistoryContextAsync(request.UserId, cancellationToken);
        var favoritesContext = await recommendationRepository.GetUserFavoritesContextAsync(request.UserId, cancellationToken);

        if (string.IsNullOrWhiteSpace(historyContext) && string.IsNullOrWhiteSpace(favoritesContext))
        {
            Console.WriteLine("[AI RECOMMENDATION] User has no play history or favorites. Triggering Fallback.");
            return await recommendationRepository.GetFallbackRecommendationsAsync(cancellationToken);
        }

        // 2. Send to AI
        Console.WriteLine("[AI RECOMMENDATION] Sending prompt to Claude AI...");
        var aiRecommendations = await aiService.GetRecommendationsAsync(historyContext, favoritesContext, cancellationToken);

        if (!aiRecommendations.Any())
        {
            Console.WriteLine("[AI RECOMMENDATION] Claude AI returned empty or failed. Triggering Fallback.");
            return await recommendationRepository.GetFallbackRecommendationsAsync(cancellationToken);
        }

        // 3. Search DB for matching media items
        var results = await recommendationRepository.SearchMediaByAiRecommendationsAsync(aiRecommendations, cancellationToken);

        if (!results.Any())
        {
            Console.WriteLine("[AI RECOMMENDATION] Claude AI returned songs that are NOT in the Database. Triggering Fallback.");
            return await recommendationRepository.GetFallbackRecommendationsAsync(cancellationToken);
        }

        Console.WriteLine($"[AI RECOMMENDATION] Successfully mapped Claude AI recommendations to Database items! Found {results.Count()} matches.");
        return results;
    }
}
