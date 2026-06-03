using Microsoft.AspNetCore.SignalR;
using TuneVault.Application.Interfaces;
using TuneVault.Infrastructure.Hubs;

namespace TuneVault.Infrastructure.Services;

public class NotificationService(IHubContext<NotificationHub> hubContext) : INotificationService
{
    public async Task SendNotificationToUserAsync(Guid userId, string message, string type, CancellationToken cancellationToken)
    {
        // Gửi thông báo realtime đích danh tới UserId (SignalR tự động map JWT NameIdentifier sang UserId)
        await hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new { 
            Message = message, 
            Type = type, 
            CreatedAt = DateTime.UtcNow 
        }, cancellationToken: cancellationToken);
    }
}
