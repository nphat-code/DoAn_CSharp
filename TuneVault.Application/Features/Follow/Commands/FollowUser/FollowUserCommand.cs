using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Follow.Commands.FollowUser;

public record FollowUserCommand(Guid FollowerId, Guid FollowingId) : IRequest<bool>;

public class FollowUserCommandHandler(IFollowRepository followRepository) : IRequestHandler<FollowUserCommand, bool>
{
    public async Task<bool> Handle(FollowUserCommand request, CancellationToken cancellationToken)
    {
        return await followRepository.FollowUserAsync(request.FollowerId, request.FollowingId, cancellationToken);
    }
}
