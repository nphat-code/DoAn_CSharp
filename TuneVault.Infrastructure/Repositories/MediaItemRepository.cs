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

    public async Task AddAsync(MediaItem mediaItem, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO MediaItems (Id, Title, Description, FileUrl, MediaType, Duration, CreatedAt, UploaderId, AlbumId, ArtistId)
            VALUES (@Id, @Title, @Description, @FileUrl, @MediaType, @Duration, @CreatedAt, @UploaderId, @AlbumId, @ArtistId)";
            
        var command = new CommandDefinition(sql, mediaItem, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }
}
