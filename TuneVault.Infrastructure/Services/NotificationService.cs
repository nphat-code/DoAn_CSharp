using Microsoft.AspNetCore.SignalR;
using TuneVault.Application.Interfaces;
using TuneVault.Infrastructure.Hubs;
using Dapper;

namespace TuneVault.Infrastructure.Services;

public class NotificationService(IHubContext<NotificationHub> hubContext) : INotificationService
{
    public async Task SendNotificationToUserAsync(Guid userId, Guid notificationId, string message, string type, DateTime createdAt, CancellationToken cancellationToken)
    {
        // Gửi thông báo realtime đích danh tới UserId (SignalR tự động map JWT NameIdentifier sang UserId)
        await hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new { 
            Id = notificationId,
            Message = message, 
            Type = type, 
            IsRead = false,
            CreatedAt = createdAt 
        }, cancellationToken: cancellationToken);
    }
}
