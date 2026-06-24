using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class ArtistRepository(IDbConnection dbConnection) : IArtistRepository
{
    public async Task<Artist?> GetByNameAsync(string name, CancellationToken cancellationToken)
    {
        var sql = "SELECT * FROM Artists WHERE Name ILIKE @Name LIMIT 1";
        var command = new CommandDefinition(sql, new { Name = name }, cancellationToken: cancellationToken);
        return await dbConnection.QueryFirstOrDefaultAsync<Artist>(command);
    }

    public async Task<Artist?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sql = "SELECT * FROM Artists WHERE Id = @Id";
        var command = new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken);
        return await dbConnection.QuerySingleOrDefaultAsync<Artist>(command);
    }

    public async Task AddAsync(Artist artist, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO Artists (Id, Name, Bio, AvatarUrl, CreatedAt)
            VALUES (@Id, @Name, @Bio, @AvatarUrl, @CreatedAt)";
        var command = new CommandDefinition(sql, artist, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }

    public async Task<IEnumerable<Artist>> GetAllAsync(CancellationToken cancellationToken)
    {
        var sql = "SELECT * FROM Artists ORDER BY CreatedAt DESC";
        var command = new CommandDefinition(sql, cancellationToken: cancellationToken);
        return await dbConnection.QueryAsync<Artist>(command);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        
        var deleteMediaSql = "DELETE FROM MediaItems WHERE ArtistId = @Id";
        await dbConnection.ExecuteAsync(new CommandDefinition(deleteMediaSql, new { Id = id }, cancellationToken: cancellationToken));

        var deleteAlbumsSql = "DELETE FROM Albums WHERE ArtistId = @Id";
        await dbConnection.ExecuteAsync(new CommandDefinition(deleteAlbumsSql, new { Id = id }, cancellationToken: cancellationToken));

        var sql = "DELETE FROM Artists WHERE Id = @Id";
        var command = new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }

    public async Task<bool> FollowArtistAsync(Guid userId, Guid artistId, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO ArtistFollows (UserId, ArtistId, FollowedAt)
            VALUES (@UserId, @ArtistId, CURRENT_TIMESTAMP)
            ON CONFLICT (UserId, ArtistId) DO NOTHING;";

        var rowsAffected = await dbConnection.ExecuteAsync(new CommandDefinition(sql, new { UserId = userId, ArtistId = artistId }, cancellationToken: cancellationToken));
        return rowsAffected > 0;
    }

    public async Task<bool> UnfollowArtistAsync(Guid userId, Guid artistId, CancellationToken cancellationToken)
    {
        var sql = @"
            DELETE FROM ArtistFollows
            WHERE UserId = @UserId AND ArtistId = @ArtistId;";

        var rowsAffected = await dbConnection.ExecuteAsync(new CommandDefinition(sql, new { UserId = userId, ArtistId = artistId }, cancellationToken: cancellationToken));
        return rowsAffected > 0;
    }

    public async Task<bool> IsFollowingArtistAsync(Guid userId, Guid artistId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT COUNT(1)
            FROM ArtistFollows
            WHERE UserId = @UserId AND ArtistId = @ArtistId;";

        var count = await dbConnection.ExecuteScalarAsync<int>(new CommandDefinition(sql, new { UserId = userId, ArtistId = artistId }, cancellationToken: cancellationToken));
        return count > 0;
    }

    public async Task<IEnumerable<Artist>> GetFollowedArtistsAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT a.* 
            FROM Artists a
            INNER JOIN ArtistFollows af ON a.Id = af.ArtistId
            WHERE af.UserId = @UserId
            ORDER BY af.FollowedAt DESC;";
            
        return await dbConnection.QueryAsync<Artist>(new CommandDefinition(sql, new { UserId = userId }, cancellationToken: cancellationToken));
    }
}