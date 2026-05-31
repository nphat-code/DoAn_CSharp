using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class UserRepository(IDbConnection dbConnection) : IUserRepository
{
    public async Task<UserProfile?> GetByUsernameAsync(string username, CancellationToken cancellationToken)
    {
        var sql = "SELECT * FROM UserProfiles WHERE Username = @Username";
        var command = new CommandDefinition(sql, new { Username = username }, cancellationToken: cancellationToken);
        
        return await dbConnection.QuerySingleOrDefaultAsync<UserProfile>(command);
    }

    public async Task AddAsync(UserProfile user, CancellationToken cancellationToken)
    {
        var sql = @"
            INSERT INTO UserProfiles (Id, Username, Email, PasswordHash, AvatarUrl, CreatedAt)
            VALUES (@Id, @Username, @Email, @PasswordHash, @AvatarUrl, @CreatedAt)";
            
        var command = new CommandDefinition(sql, user, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }
}
