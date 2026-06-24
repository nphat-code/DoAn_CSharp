namespace TuneVault.Application.Interfaces;

using TuneVault.Domain.Entities;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task MarkAsReadAsync(Guid notificationId, CancellationToken cancellationToken);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken);
    Task AddNotificationAsync(Notification notification, CancellationToken cancellationToken);
}
