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
}