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

    public async Task<UserProfile?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var sql = "SELECT * FROM UserProfiles WHERE Email = @Email";
        var command = new CommandDefinition(sql, new { Email = email }, cancellationToken: cancellationToken);
        
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

    public async Task<UserProfile?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var sql = "SELECT * FROM UserProfiles WHERE Id = @Id";
        var command = new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken);
        
        return await dbConnection.QuerySingleOrDefaultAsync<UserProfile>(command);
    }

    public async Task UpdateAvatarAsync(Guid userId, string avatarUrl, CancellationToken cancellationToken)
    {
        var sql = "UPDATE UserProfiles SET AvatarUrl = @AvatarUrl, UpdatedAt = @UpdatedAt WHERE Id = @Id";
        var command = new CommandDefinition(sql, new { AvatarUrl = avatarUrl, UpdatedAt = DateTime.UtcNow, Id = userId }, cancellationToken: cancellationToken);
        await dbConnection.ExecuteAsync(command);
    }
}
