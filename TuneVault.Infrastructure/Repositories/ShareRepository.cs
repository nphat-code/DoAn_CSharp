using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Repositories;

public class ShareRepository(IDbConnection dbConnection) : IShareRepository
{
    public async Task ShareMediaAsync(Guid senderId, Guid receiverId, Guid mediaId, string message, Guid notificationId, string notificationMessage, DateTime createdAt)
    {
        if (dbConnection.State == ConnectionState.Closed)
        {
            dbConnection.Open();
        }
        
        using var transaction = dbConnection.BeginTransaction();
        try
        {
            var isPlaylist = await dbConnection.ExecuteScalarAsync<bool>(
                "SELECT EXISTS(SELECT 1 FROM Playlists WHERE Id = @Id)", 
                new { Id = mediaId }, transaction);

            var isAlbum = !isPlaylist && await dbConnection.ExecuteScalarAsync<bool>(
                "SELECT EXISTS(SELECT 1 FROM Albums WHERE Id = @Id)", 
                new { Id = mediaId }, transaction);

            var shareSql = isPlaylist 
                ? @"INSERT INTO MediaShares (Id, SenderId, ReceiverId, PlaylistId, Message, CreatedAt)
                    VALUES (@Id, @SenderId, @ReceiverId, @MediaId, @Message, @CreatedAt)"
                : isAlbum 
                    ? @"INSERT INTO MediaShares (Id, SenderId, ReceiverId, AlbumId, Message, CreatedAt)
                        VALUES (@Id, @SenderId, @ReceiverId, @MediaId, @Message, @CreatedAt)"
                    : @"INSERT INTO MediaShares (Id, SenderId, ReceiverId, MediaItemId, Message, CreatedAt)
                        VALUES (@Id, @SenderId, @ReceiverId, @MediaId, @Message, @CreatedAt)";

            await dbConnection.ExecuteAsync(shareSql, new {
                Id = Guid.NewGuid(),
                SenderId = senderId,
                ReceiverId = receiverId,
                MediaId = mediaId,
                Message = message,
                CreatedAt = createdAt
            }, transaction);

            var notifSql = @"
                INSERT INTO Notifications (Id, UserId, Message, Type, IsRead, CreatedAt)
                VALUES (@Id, @UserId, @Message, @Type, @IsRead, @CreatedAt)";

            await dbConnection.ExecuteAsync(notifSql, new {
                Id = notificationId,
                UserId = receiverId,
                Message = notificationMessage,
                Type = "Share",
                IsRead = false,
                CreatedAt = createdAt
            }, transaction);

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<IEnumerable<TuneVault.Application.Features.Share.DTOs.MediaShareDto>> GetSharedWithMeAsync(Guid receiverId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT ms.Id, 
                   ms.SenderId, 
                   u.Username as SenderName, 
                   u.AvatarUrl as SenderAvatarUrl,
                   ms.ReceiverId, 
                   COALESCE(ms.MediaItemId, ms.PlaylistId, ms.AlbumId) as MediaItemId, 
                   COALESCE(m.Title, p.Title, al_shared.Title) as MediaTitle, 
                   COALESCE(m.CoverUrl, al_main.CoverUrl, p.CoverUrl, al_shared.CoverUrl, 
                       (SELECT COALESCE(m2.CoverUrl, al.CoverUrl) 
                        FROM PlaylistItems pi 
                        INNER JOIN MediaItems m2 ON pi.MediaItemId = m2.Id 
                        LEFT JOIN Albums al ON m2.AlbumId = al.Id
                        WHERE pi.PlaylistId = p.Id 
                        ORDER BY pi.AddedAt ASC LIMIT 1)) as MediaCoverUrl, 
                   CASE 
                       WHEN ms.PlaylistId IS NOT NULL THEN 'Playlist' 
                       WHEN ms.AlbumId IS NOT NULL THEN 'Album' 
                       ELSE m.MediaType 
                   END as MediaType, 
                   COALESCE(a.Name, a_album.Name) as MediaArtistName, 
                   ms.Message, 
                   ms.CreatedAt
            FROM MediaShares ms
            INNER JOIN UserProfiles u ON ms.SenderId = u.Id
            LEFT JOIN MediaItems m ON ms.MediaItemId = m.Id
            LEFT JOIN Albums al_main ON m.AlbumId = al_main.Id
            LEFT JOIN Playlists p ON ms.PlaylistId = p.Id
            LEFT JOIN Albums al_shared ON ms.AlbumId = al_shared.Id
            LEFT JOIN Artists a ON m.ArtistId = a.Id
            LEFT JOIN Artists a_album ON al_shared.ArtistId = a_album.Id
            WHERE ms.ReceiverId = @ReceiverId
            ORDER BY ms.CreatedAt DESC";

        var command = new CommandDefinition(sql, new { ReceiverId = receiverId }, cancellationToken: cancellationToken);
        return await dbConnection.QueryAsync<TuneVault.Application.Features.Share.DTOs.MediaShareDto>(command);
    }
}
