
using System.Data;
using Dapper;
using TuneVault.Application.Features.Media.DTOs;
using TuneVault.Application.Features.Artists.DTOs;
using TuneVault.Application.Features.Playlists.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Repositories;

public class SearchRepository(IDbConnection dbConnection) : ISearchRepository
{
    public async Task<SearchResultDto> SearchAsync(string query, int page, int pageSize, CancellationToken cancellationToken)
    {
        var result = new SearchResultDto
        {
            CurrentPage = page > 0 ? page : 1
        };
        
        var limit = pageSize > 0 ? pageSize : 10;
        var offset = (result.CurrentPage - 1) * limit;

        string queryTerm = string.IsNullOrWhiteSpace(query) ? "" : $"%{query}%";

        
        string trackSql = string.IsNullOrWhiteSpace(query) 
            ? @"SELECT m.Id, m.Title, m.Description, m.FileUrl, m.MediaType, m.Duration, m.UploaderId, m.CreatedAt, m.CoverUrl,
                       m.ArtistId, m.AlbumId, a.Name as ArtistName, a.Bio as ArtistBio, a.AvatarUrl as ArtistAvatarUrl, al.Title as AlbumTitle
                FROM MediaItems m
                LEFT JOIN Artists a ON m.ArtistId = a.Id
                LEFT JOIN Albums al ON m.AlbumId = al.Id
                ORDER BY m.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset"
            : @"SELECT m.Id, m.Title, m.Description, m.FileUrl, m.MediaType, m.Duration, m.UploaderId, m.CreatedAt, m.CoverUrl,
                       m.ArtistId, m.AlbumId, a.Name as ArtistName, a.Bio as ArtistBio, a.AvatarUrl as ArtistAvatarUrl, al.Title as AlbumTitle
                FROM MediaItems m
                LEFT JOIN Artists a ON m.ArtistId = a.Id
                LEFT JOIN Albums al ON m.AlbumId = al.Id
                WHERE m.Title ILIKE @Query 
                   OR m.Description ILIKE @Query 
                   OR a.Name ILIKE @Query
                   OR m.ArtistId IN (SELECT ArtistId FROM MediaItems WHERE Title ILIKE @Query AND ArtistId IS NOT NULL)
                ORDER BY 
                    CASE 
                        WHEN m.Title ILIKE @Query THEN 0
                        WHEN a.Name ILIKE @Query THEN 1
                        ELSE 2
                    END,
                    m.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset";

        var tracks = await dbConnection.QueryAsync<MediaItemDto>(trackSql, new { Query = queryTerm, Limit = limit, Offset = offset });
        result.Tracks = tracks;

        
        string artistSql = string.IsNullOrWhiteSpace(query)
            ? @"SELECT a.Id, a.Name, a.Bio, a.AvatarUrl, a.CreatedAt,
                       CAST(COUNT(DISTINCT h.UserId) AS INTEGER) AS RealMonthlyListeners
                FROM Artists a
                LEFT JOIN MediaItems m ON a.Id = m.ArtistId
                LEFT JOIN ListeningHistory h ON m.Id = h.MediaItemId AND h.ListenedAt >= CURRENT_TIMESTAMP - INTERVAL '30 days'
                GROUP BY a.Id
                ORDER BY a.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset"
            : @"SELECT a.Id, a.Name, a.Bio, a.AvatarUrl, a.CreatedAt,
                       CAST(COUNT(DISTINCT h.UserId) AS INTEGER) AS RealMonthlyListeners
                FROM Artists a
                LEFT JOIN MediaItems m ON a.Id = m.ArtistId
                LEFT JOIN ListeningHistory h ON m.Id = h.MediaItemId AND h.ListenedAt >= CURRENT_TIMESTAMP - INTERVAL '30 days'
                WHERE a.Name ILIKE @Query 
                   OR a.Bio ILIKE @Query
                   OR a.Id IN (SELECT ArtistId FROM MediaItems WHERE Title ILIKE @Query AND ArtistId IS NOT NULL)
                GROUP BY a.Id
                ORDER BY 
                    CASE WHEN a.Name ILIKE @Query THEN 0 ELSE 1 END,
                    a.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset";

        var artists = await dbConnection.QueryAsync<ArtistDto>(artistSql, new { Query = queryTerm, Limit = limit, Offset = offset });
        result.Artists = artists;

        
        string albumSql = string.IsNullOrWhiteSpace(query)
            ? @"SELECT al.Id, al.Title, al.CoverUrl, al.ReleaseDate, al.ArtistId,
                       a.Name as ArtistName
                FROM Albums al
                LEFT JOIN Artists a ON al.ArtistId = a.Id
                ORDER BY al.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset"
            : @"SELECT al.Id, al.Title, al.CoverUrl, al.ReleaseDate, al.ArtistId,
                       a.Name as ArtistName
                FROM Albums al
                LEFT JOIN Artists a ON al.ArtistId = a.Id
                WHERE al.Title ILIKE @Query 
                   OR a.Name ILIKE @Query
                   OR al.ArtistId IN (SELECT ArtistId FROM MediaItems WHERE Title ILIKE @Query AND ArtistId IS NOT NULL)
                ORDER BY 
                    CASE WHEN al.Title ILIKE @Query THEN 0 ELSE 1 END,
                    al.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset";

        var albums = await dbConnection.QueryAsync<TuneVault.Application.Features.Albums.DTOs.AlbumDto>(albumSql, new { Query = queryTerm, Limit = limit, Offset = offset });
        result.Albums = albums;

        
        string playlistSql = string.IsNullOrWhiteSpace(query)
            ? @"SELECT p.Id, p.Title as Name, p.Description, p.CoverUrl, p.IsPublic, p.CreatedAt, p.CreatorId as UserProfileId, u.Username as UserName
                FROM Playlists p
                JOIN UserProfiles u ON p.CreatorId = u.Id
                WHERE p.IsPublic = true
                ORDER BY p.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset"
            : @"SELECT p.Id, p.Title as Name, p.Description, p.CoverUrl, p.IsPublic, p.CreatedAt, p.CreatorId as UserProfileId, u.Username as UserName
                FROM Playlists p
                JOIN UserProfiles u ON p.CreatorId = u.Id
                WHERE (p.Title ILIKE @Query OR p.Description ILIKE @Query OR u.Username ILIKE @Query) AND p.IsPublic = true
                ORDER BY 
                    CASE WHEN p.Title ILIKE @Query THEN 0 ELSE 1 END,
                    p.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset";

        var playlists = await dbConnection.QueryAsync<PlaylistDto>(playlistSql, new { Query = queryTerm, Limit = limit, Offset = offset });
        result.Playlists = playlists;

        
        string userSql = string.IsNullOrWhiteSpace(query)
            ? @"SELECT Id, Username, Email, AvatarUrl, Bio, CreatedAt
                FROM UserProfiles
                ORDER BY CreatedAt DESC
                LIMIT @Limit OFFSET @Offset"
            : @"SELECT Id, Username, Email, AvatarUrl, Bio, CreatedAt
                FROM UserProfiles
                WHERE Username ILIKE @Query OR Bio ILIKE @Query
                ORDER BY CreatedAt DESC
                LIMIT @Limit OFFSET @Offset";

        var users = await dbConnection.QueryAsync<TuneVault.Application.Features.Profile.DTOs.ProfileDto>(userSql, new { Query = queryTerm, Limit = limit, Offset = offset });
        result.Users = users;

        result.TotalItems = result.Tracks.Count() + result.Artists.Count() + result.Albums.Count() + result.Playlists.Count() + result.Users.Count();
        result.TotalPages = (int)Math.Ceiling(result.TotalItems / (double)limit); 
        

        return result;
    }
}
