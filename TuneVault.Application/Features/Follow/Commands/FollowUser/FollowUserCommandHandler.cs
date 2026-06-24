using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Follow.Commands.FollowUser;

public class FollowUserCommandHandler(
    IFollowRepository followRepository,
    IUserRepository userRepository,
    INotificationService notificationService) : IRequestHandler<FollowUserCommand, bool>
{
    public async Task<bool> Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        var success = await followRepository.FollowUserAsync(request.FollowerId, request.FollowingId, cancellationToken);
        
        if (success)
        {
            var follower = await userRepository.GetByIdAsync(request.FollowerId, cancellationToken);
            var followerName = follower?.Username ?? "Một người dùng";
            var notificationMessage = $"{followerName} đã bắt đầu theo dõi bạn";
            
            await notificationService.SendNotificationToUserAsync(
                request.FollowingId,
                notificationMessage,
                "Follow",
                cancellationToken);
        }
        
        return success;
    }
}
