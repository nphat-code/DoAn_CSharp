using System.Data;
using Dapper;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Repositories;

public class RecommendationRepository(IDbConnection dbConnection) : IRecommendationRepository
{
    public async Task<string> GetUserHistoryContextAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT m.Title || ' - ' || COALESCE(a.Name, 'Unknown')
            FROM ListeningHistory ph
            JOIN MediaItems m ON ph.MediaItemId = m.Id
            LEFT JOIN Artists a ON m.ArtistId = a.Id
            WHERE ph.UserId = @UserId
            GROUP BY m.Title, a.Name
            ORDER BY MAX(ph.ListenedAt) DESC
            LIMIT 10";
            
        var list = await dbConnection.QueryAsync<string>(sql, new { UserId = userId });
        return string.Join(", ", list);
    }

    public async Task<string> GetUserFavoritesContextAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT m.Title || ' - ' || COALESCE(a.Name, 'Unknown')
            FROM UserLikes f
            JOIN MediaItems m ON f.MediaItemId = m.Id
            LEFT JOIN Artists a ON m.ArtistId = a.Id
            WHERE f.UserId = @UserId
            LIMIT 10";
            
        var list = await dbConnection.QueryAsync<string>(sql, new { UserId = userId });
        return string.Join(", ", list);
    }

    public async Task<IEnumerable<MediaItemDto>> SearchMediaByAiRecommendationsAsync(IEnumerable<(string Title, string Artist)> recommendations, CancellationToken cancellationToken)
    {
        var results = new List<MediaItemDto>();
        
        var searchSql = @"
            SELECT m.Id, m.Title, m.FileUrl, m.CoverUrl, m.MediaType, m.Duration, m.CreatedAt, m.ArtistId, a.Name as ArtistName
            FROM MediaItems m
            LEFT JOIN Artists a ON m.ArtistId = a.Id
            WHERE m.Title ILIKE @Title OR a.Name ILIKE @Artist
            LIMIT 1";

        foreach (var rec in recommendations)
        {
            var titlePattern = $"%{rec.Title}%";
            var artistPattern = $"%{rec.Artist}%";

            var match = await dbConnection.QueryFirstOrDefaultAsync<MediaItemDto>(searchSql, new 
            { 
                Title = titlePattern,
                Artist = artistPattern
            });

            if (match != null && !results.Any(r => r.Id == match.Id))
            {
                results.Add(match);
            }
        }

        return results;
    }

    public async Task<IEnumerable<MediaItemDto>> GetFallbackRecommendationsAsync(CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT m.Id, m.Title, m.FileUrl, m.CoverUrl, m.MediaType, m.Duration, m.CreatedAt, m.ArtistId, a.Name as ArtistName
            FROM MediaItems m
            LEFT JOIN Artists a ON m.ArtistId = a.Id
            ORDER BY RANDOM()
            LIMIT 5";

        return await dbConnection.QueryAsync<MediaItemDto>(sql);
    }
}
