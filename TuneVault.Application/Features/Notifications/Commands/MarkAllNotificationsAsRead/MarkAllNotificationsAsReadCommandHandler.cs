using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Notifications.Commands.MarkAllNotificationsAsRead;

public class MarkAllNotificationsAsReadCommandHandler(INotificationRepository notificationRepository) 
    : IRequestHandler<MarkAllNotificationsAsReadCommand>
{
    public async Task Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
    {
        await notificationRepository.MarkAllAsReadAsync(request.UserId, cancellationToken);
    }
}
