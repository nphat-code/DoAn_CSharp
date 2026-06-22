using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IUserRepository
{
    Task<UserProfile?> GetByUsernameAsync(string username, CancellationToken cancellationToken);
    Task<UserProfile?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<UserProfile?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task AddAsync(UserProfile user, CancellationToken cancellationToken);
    Task UpdateAvatarAsync(Guid userId, string? avatarUrl, CancellationToken cancellationToken);
    Task UpdateProfileAsync(Guid userId, string username, string? avatarUrl, string? bio, CancellationToken cancellationToken);
    Task<IEnumerable<UserProfile>> SearchUsersAsync(string query, CancellationToken cancellationToken);
}
