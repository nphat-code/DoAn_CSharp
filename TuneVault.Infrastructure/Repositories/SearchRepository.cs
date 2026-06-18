
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

        // Query Tracks
        string trackSql = string.IsNullOrWhiteSpace(query) 
            ? @"SELECT m.Id, m.Title, m.Description, m.FileUrl, m.MediaType, m.Duration, m.UploaderId, m.CreatedAt, m.CoverUrl,
                       a.Name as ArtistName, a.Bio as ArtistBio, a.AvatarUrl as ArtistAvatarUrl
                FROM MediaItems m
                LEFT JOIN Artists a ON m.ArtistId = a.Id
                ORDER BY m.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset"
            : @"SELECT m.Id, m.Title, m.Description, m.FileUrl, m.MediaType, m.Duration, m.UploaderId, m.CreatedAt, m.CoverUrl,
                       a.Name as ArtistName, a.Bio as ArtistBio, a.AvatarUrl as ArtistAvatarUrl
                FROM MediaItems m
                LEFT JOIN Artists a ON m.ArtistId = a.Id
                WHERE m.Title ILIKE @Query OR m.Description ILIKE @Query OR a.Name ILIKE @Query
                ORDER BY m.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset";

        var tracks = await dbConnection.QueryAsync<MediaItemDto>(trackSql, new { Query = queryTerm, Limit = limit, Offset = offset });
        result.Tracks = tracks;

        // Query Artists
        string artistSql = string.IsNullOrWhiteSpace(query)
            ? @"SELECT Id, Name, Bio, AvatarUrl, CreatedAt
                FROM Artists
                ORDER BY CreatedAt DESC
                LIMIT @Limit OFFSET @Offset"
            : @"SELECT Id, Name, Bio, AvatarUrl, CreatedAt
                FROM Artists
                WHERE Name ILIKE @Query OR Bio ILIKE @Query
                ORDER BY CreatedAt DESC
                LIMIT @Limit OFFSET @Offset";

        var artists = await dbConnection.QueryAsync<ArtistDto>(artistSql, new { Query = queryTerm, Limit = limit, Offset = offset });
        result.Artists = artists;

        // Query Albums
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
                WHERE al.Title ILIKE @Query OR a.Name ILIKE @Query
                ORDER BY al.CreatedAt DESC
                LIMIT @Limit OFFSET @Offset";

        var albums = await dbConnection.QueryAsync<TuneVault.Application.Features.Albums.DTOs.AlbumDto>(albumSql, new { Query = queryTerm, Limit = limit, Offset = offset });
        result.Albums = albums;

        // Query Playlists
        string playlistSql = string.IsNullOrWhiteSpace(query)
            ? @"SELECT Id, Title as Name, Description, CoverUrl, IsPublic, CreatedAt, CreatorId as UserProfileId
                FROM Playlists
                WHERE IsPublic = true
                ORDER BY CreatedAt DESC
                LIMIT @Limit OFFSET @Offset"
            : @"SELECT Id, Title as Name, Description, CoverUrl, IsPublic, CreatedAt, CreatorId as UserProfileId
                FROM Playlists
                WHERE (Title ILIKE @Query OR Description ILIKE @Query) AND IsPublic = true
                ORDER BY CreatedAt DESC
                LIMIT @Limit OFFSET @Offset";

        var playlists = await dbConnection.QueryAsync<PlaylistDto>(playlistSql, new { Query = queryTerm, Limit = limit, Offset = offset });
        result.Playlists = playlists;

        // Query Users
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
        // Note: For true total pages, we'd need to run 3 COUNT queries.

        return result;
    }
}
