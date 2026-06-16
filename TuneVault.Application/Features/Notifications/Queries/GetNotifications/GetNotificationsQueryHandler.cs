using MediatR;
using TuneVault.Application.Features.Notifications.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Notifications.Queries.GetNotifications;

public class GetNotificationsQueryHandler(INotificationRepository notificationRepository) 
    : IRequestHandler<GetNotificationsQuery, IEnumerable<NotificationDto>>
{
    public async Task<IEnumerable<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = await notificationRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        
        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            UserId = n.UserId,
            Message = n.Message,
            Type = n.Type,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        });
    }
}
