using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Follow.Commands.UnfollowUser;

public record UnfollowUserCommand(Guid FollowerId, Guid FollowingId) : IRequest<bool>;

public class UnfollowUserCommandHandler(IFollowRepository followRepository) : IRequestHandler<UnfollowUserCommand, bool>
{
    public async Task<bool> Handle(UnfollowUserCommand request, CancellationToken cancellationToken)
    {
        return await followRepository.UnfollowUserAsync(request.FollowerId, request.FollowingId, cancellationToken);
    }
}
