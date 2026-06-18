using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Repositories;

public class FollowRepository(IDbConnection dbConnection) : IFollowRepository
{
    public async Task<bool> FollowUserAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken)
    {
        if (followerId == followingId) return false;

        var sql = @"
            INSERT INTO UserFollows (FollowerId, FollowingId, FollowedAt)
            VALUES (@FollowerId, @FollowingId, CURRENT_TIMESTAMP)
            ON CONFLICT (FollowerId, FollowingId) DO NOTHING;";

        var rowsAffected = await dbConnection.ExecuteAsync(sql, new { FollowerId = followerId, FollowingId = followingId });
        return rowsAffected > 0;
    }

    public async Task<bool> UnfollowUserAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken)
    {
        var sql = @"
            DELETE FROM UserFollows
            WHERE FollowerId = @FollowerId AND FollowingId = @FollowingId;";

        var rowsAffected = await dbConnection.ExecuteAsync(sql, new { FollowerId = followerId, FollowingId = followingId });
        return rowsAffected > 0;
    }

    public async Task<bool> IsFollowingAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT COUNT(1)
            FROM UserFollows
            WHERE FollowerId = @FollowerId AND FollowingId = @FollowingId;";

        var count = await dbConnection.ExecuteScalarAsync<int>(sql, new { FollowerId = followerId, FollowingId = followingId });
        return count > 0;
    }

    public async Task<int> GetFollowerCountAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = "SELECT COUNT(1) FROM UserFollows WHERE FollowingId = @UserId;";
        return await dbConnection.ExecuteScalarAsync<int>(sql, new { UserId = userId });
    }

    public async Task<int> GetFollowingCountAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = "SELECT COUNT(1) FROM UserFollows WHERE FollowerId = @UserId;";
        return await dbConnection.ExecuteScalarAsync<int>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<TuneVault.Application.Features.Profile.DTOs.ProfileDto>> GetFollowersAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT u.Id, u.Username, u.Email, u.AvatarUrl, u.Bio, u.CreatedAt
            FROM UserFollows uf
            INNER JOIN UserProfiles u ON uf.FollowerId = u.Id
            WHERE uf.FollowingId = @UserId;";
            
        return await dbConnection.QueryAsync<TuneVault.Application.Features.Profile.DTOs.ProfileDto>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<TuneVault.Application.Features.Profile.DTOs.ProfileDto>> GetFollowingAsync(Guid userId, CancellationToken cancellationToken)
    {
        var sql = @"
            SELECT u.Id, u.Username, u.Email, u.AvatarUrl, u.Bio, u.CreatedAt
            FROM UserFollows uf
            INNER JOIN UserProfiles u ON uf.FollowingId = u.Id
            WHERE uf.FollowerId = @UserId;";
            
        return await dbConnection.QueryAsync<TuneVault.Application.Features.Profile.DTOs.ProfileDto>(sql, new { UserId = userId });
    }
}
