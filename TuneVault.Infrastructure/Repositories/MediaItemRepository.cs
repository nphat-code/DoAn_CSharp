using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class MediaItemRepository(IDbConnection dbConnection) : IMediaItemRepository
{
    public async Task<MediaItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sql = "SELECT * FROM MediaItems WHERE Id = @Id";
        var command = new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken);
        
        return await dbConnection.QuerySingleOrDefaultAsync<MediaItem>(command);
    }

    public async Task<IEnumerable<MediaItem>> GetAllAsync(CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT m.*, a.* 
            FROM MediaItems m
            LEFT JOIN Artists a ON m.ArtistId = a.Id
            ORDER BY m.CreatedAt DESC";
        var command = new CommandDefinition(sql, cancellationToken: cancellationToken);
        
        return await dbConnection.QueryAsync<MediaItem, Artist, MediaItem>(
            command,
            (mediaItem, artist) => 
            {
                mediaItem.Artist = artist;
                return mediaItem;
            },
            splitOn: "Id"
        );
    }

    public async Task<IEnumerable<MediaItem>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT * FROM MediaItems 
            WHERE Title ILIKE @SearchTerm OR Description ILIKE @SearchTerm
            ORDER BY CreatedAt DESC";
        var command = new CommandDefinition(sql, new { SearchTerm = $"%{query}%" }, cancellationToken: cancellationToken);
        
        return await dbConnection.QueryAsync<MediaItem>(command);
    }

    public async Task AddAsync(MediaItem mediaItem, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO MediaItems (Id, Title, Description, FileUrl, MediaType, Duration, CreatedAt, UploaderId, AlbumId, ArtistId)
            VALUES (@Id, @Title, @Description, @FileUrl, @MediaType, @Duration, @CreatedAt, @UploaderId, @AlbumId, @ArtistId)";
            
        var command = new CommandDefinition(sql, mediaItem, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var sql = "DELETE FROM MediaItems WHERE Id = @Id";
        var command = new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }
}
