using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IUserRepository
{
    Task<UserProfile?> GetByUsernameAsync(string username, CancellationToken cancellationToken);
    Task<UserProfile?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task AddAsync(UserProfile user, CancellationToken cancellationToken);
}
