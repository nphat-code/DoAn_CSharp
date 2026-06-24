using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class FavoriteRepository(IDbConnection dbConnection) : IFavoriteRepository
{
    public async Task<bool> IsFavoritedAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken)
    {
        var sql = "SELECT COUNT(1) FROM UserLikes WHERE UserId = @UserId AND MediaItemId = @MediaId";
        var count = await dbConnection.ExecuteScalarAsync<int>(new CommandDefinition(sql, new { UserId = userId, MediaId = mediaId }, cancellationToken: cancellationToken));
        return count > 0;
    }

    public async Task<bool> ToggleFavoriteAsync(Guid userId, Guid mediaId, CancellationToken cancellationToken)
    {
        bool isFavorited = await IsFavoritedAsync(userId, mediaId, cancellationToken);

        if (isFavorited)
        {
            
            var sqlDelete = "DELETE FROM UserLikes WHERE UserId = @UserId AND MediaItemId = @MediaId";
            await dbConnection.ExecuteAsync(new CommandDefinition(sqlDelete, new { UserId = userId, MediaId = mediaId }, cancellationToken: cancellationToken));
            return false;
        }
        else
        {
            
            var sqlInsert = "INSERT INTO UserLikes (UserId, MediaItemId, LikedAt) VALUES (@UserId, @MediaId, @LikedAt)";
            await dbConnection.ExecuteAsync(new CommandDefinition(sqlInsert, new { UserId = userId, MediaId = mediaId, LikedAt = DateTime.UtcNow }, cancellationToken: cancellationToken));
            return true;
        }
    }

    public async Task<IEnumerable<Favorite>> GetUserFavoritesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT 
                l.UserId as UserProfileId, l.MediaItemId, l.LikedAt as FavoritedAt,
                m.*,
                ar.*,
                al.*
            FROM UserLikes l
            INNER JOIN MediaItems m ON l.MediaItemId = m.Id
            LEFT JOIN Artists ar ON m.ArtistId = ar.Id
            LEFT JOIN Albums al ON m.AlbumId = al.Id
            WHERE l.UserId = @UserId
            ORDER BY l.LikedAt DESC";
            
        return await dbConnection.QueryAsync<Favorite, MediaItem, Artist, Album, Favorite>(
            new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken),
            (favorite, mediaItem, artist, album) => 
            {
                if (artist != null) mediaItem.Artist = artist;
                if (album != null) mediaItem.Album = album;
                favorite.MediaItem = mediaItem;
                return favorite;
            },
            splitOn: "Id,Id,Id"
        );
    }
}
