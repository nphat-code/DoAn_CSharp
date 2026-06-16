using MediatR;
using TuneVault.Application.Features.Notifications.DTOs;

namespace TuneVault.Application.Features.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery(Guid UserId) : IRequest<IEnumerable<NotificationDto>>;
