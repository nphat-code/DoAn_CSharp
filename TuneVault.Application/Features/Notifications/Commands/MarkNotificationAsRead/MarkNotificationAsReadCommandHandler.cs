using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Notifications.Commands.MarkNotificationAsRead;

public class MarkNotificationAsReadCommandHandler(INotificationRepository notificationRepository) 
    : IRequestHandler<MarkNotificationAsReadCommand>
{
    public async Task Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        await notificationRepository.MarkAsReadAsync(request.NotificationId, cancellationToken);
    }
}
