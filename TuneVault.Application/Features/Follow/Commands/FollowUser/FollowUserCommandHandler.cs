using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Follow.Commands.FollowUser;

public class FollowUserCommandHandler(
    IFollowRepository followRepository,
    IUserRepository userRepository,
    INotificationService notificationService,
    INotificationRepository notificationRepository) : IRequestHandler<FollowUserCommand, bool>
{
    public async Task<bool> Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        var success = await followRepository.FollowUserAsync(request.FollowerId, request.FollowingId, cancellationToken);
        
        if (success)
        {
            var follower = await userRepository.GetByIdAsync(request.FollowerId, cancellationToken);
            var followerName = follower?.Username ?? "Một người dùng";
            var notificationMessage = $"{followerName} đã bắt đầu theo dõi bạn";
            var notifId = Guid.NewGuid();
            var createdAt = DateTime.UtcNow;
            
            // 1. Lưu thông báo vào Database
            await notificationRepository.AddNotificationAsync(new TuneVault.Domain.Entities.Notification
            {
                Id = notifId,
                UserId = request.FollowingId,
                Message = notificationMessage,
                Type = "Follow",
                IsRead = false,
                CreatedAt = createdAt
            }, cancellationToken);

            // 2. Gửi realtime thông báo cho User
            await notificationService.SendNotificationToUserAsync(
                request.FollowingId,
                notifId,
                notificationMessage,
                "Follow",
                createdAt,
                cancellationToken);
        }
        
        return success;
    }
}
