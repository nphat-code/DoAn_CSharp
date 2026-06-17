using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class PlayHistoryRepository(IDbConnection dbConnection) : IPlayHistoryRepository
{
    public async Task AddAsync(PlayHistory playHistory, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO ListeningHistory (Id, UserId, MediaItemId, ListenedAt)
            VALUES (@Id, @UserProfileId, @MediaItemId, @PlayedAt)";
            
        var command = new CommandDefinition(sql, playHistory, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }

    public async Task<IEnumerable<PlayHistory>> GetUserHistoryAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT 
                h.Id, h.UserId as UserProfileId, h.MediaItemId, h.ListenedAt as PlayedAt,
                m.Id, m.Title, m.FileUrl, m.MediaType, CAST(m.Duration AS interval) as Duration, m.Description, m.CoverUrl, m.ArtistId, m.CreatedAt,
                a.Id, a.Name, a.Bio, a.AvatarUrl
            FROM ListeningHistory h
            INNER JOIN MediaItems m ON h.MediaItemId = m.Id
            LEFT JOIN Artists a ON m.ArtistId = a.Id
            WHERE h.UserId = @UserId
            ORDER BY h.ListenedAt DESC";
            
        var command = new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken);
        
        return await dbConnection.QueryAsync<PlayHistory, MediaItem, Artist, PlayHistory>(
            command,
            (history, mediaItem, artist) => 
            {
                mediaItem.Artist = artist;
                history.MediaItem = mediaItem;
                return history;
            },
            splitOn: "Id,Id"
        );
    }
}
