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
            SELECT m.*, a.*, al.*
            FROM MediaItems m
            LEFT JOIN Artists a ON m.ArtistId = a.Id
            LEFT JOIN Albums al ON m.AlbumId = al.Id
            ORDER BY m.CreatedAt DESC";
        var command = new CommandDefinition(sql, cancellationToken: cancellationToken);
        
        return await dbConnection.QueryAsync<MediaItem, Artist, Album, MediaItem>(
            command,
            (mediaItem, artist, album) => 
            {
                mediaItem.Artist = artist;
                mediaItem.Album = album;
                return mediaItem;
            },
            splitOn: "Id,Id"
        );
    }

    public async Task<IEnumerable<MediaItem>> SearchAsync(string query, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT m.*, a.*, al.*
            FROM MediaItems m
            LEFT JOIN Artists a ON m.ArtistId = a.Id
            LEFT JOIN Albums al ON m.AlbumId = al.Id
            WHERE m.Title ILIKE @SearchTerm OR m.Description ILIKE @SearchTerm
            ORDER BY m.CreatedAt DESC";
        var command = new CommandDefinition(sql, new { SearchTerm = $"%{query}%" }, cancellationToken: cancellationToken);
        
        return await dbConnection.QueryAsync<MediaItem, Artist, Album, MediaItem>(
            command,
            (mediaItem, artist, album) => 
            {
                mediaItem.Artist = artist;
                mediaItem.Album = album;
                return mediaItem;
            },
            splitOn: "Id,Id"
        );
    }

    public async Task AddAsync(MediaItem mediaItem, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO MediaItems (Id, Title, Description, CoverUrl, FileUrl, MediaType, Duration, CreatedAt, UploaderId, AlbumId, ArtistId)
            VALUES (@Id, @Title, @Description, @CoverUrl, @FileUrl, @MediaType, @Duration, @CreatedAt, @UploaderId, @AlbumId, @ArtistId)";
            
        var command = new CommandDefinition(sql, mediaItem, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var sql = "DELETE FROM MediaItems WHERE Id = @Id";
        var command = new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }

    public async Task<IEnumerable<MediaItem>> GetByUploaderIdAsync(Guid uploaderId, CancellationToken cancellationToken)
    {
        var sql = "SELECT * FROM MediaItems WHERE UploaderId = @UploaderId";
        var command = new CommandDefinition(sql, new { UploaderId = uploaderId }, cancellationToken: cancellationToken);
        return await dbConnection.QueryAsync<MediaItem>(command);
    }

    public async Task UpdateAsync(MediaItem mediaItem, CancellationToken cancellationToken)
    {
        var sql = @"
            UPDATE MediaItems 
            SET Title = @Title, Description = @Description, CoverUrl = @CoverUrl, 
                FileUrl = @FileUrl, MediaType = @MediaType, Duration = @Duration, 
                UploaderId = @UploaderId, AlbumId = @AlbumId, ArtistId = @ArtistId
            WHERE Id = @Id";
            
        var command = new CommandDefinition(sql, mediaItem, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }
}
