namespace TuneVault.Application.Interfaces;

public interface INotificationService
{
    Task SendNotificationToUserAsync(Guid userId, string message, string type, CancellationToken cancellationToken);
}
