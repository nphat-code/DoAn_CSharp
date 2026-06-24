namespace TuneVault.Application.Interfaces;

public interface INotificationService
{
    Task SendNotificationToUserAsync(Guid userId, Guid notificationId, string message, string type, DateTime createdAt, CancellationToken cancellationToken);
}
