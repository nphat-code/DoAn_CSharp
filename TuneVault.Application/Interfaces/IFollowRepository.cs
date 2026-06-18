using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IFollowRepository
{
    Task<bool> FollowUserAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken);
    Task<bool> UnfollowUserAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken);
    Task<bool> IsFollowingAsync(Guid followerId, Guid followingId, CancellationToken cancellationToken);
    Task<int> GetFollowerCountAsync(Guid userId, CancellationToken cancellationToken);
    Task<int> GetFollowingCountAsync(Guid userId, CancellationToken cancellationToken);
    Task<IEnumerable<TuneVault.Application.Features.Profile.DTOs.ProfileDto>> GetFollowersAsync(Guid userId, CancellationToken cancellationToken);
    Task<IEnumerable<TuneVault.Application.Features.Profile.DTOs.ProfileDto>> GetFollowingAsync(Guid userId, CancellationToken cancellationToken);
}
