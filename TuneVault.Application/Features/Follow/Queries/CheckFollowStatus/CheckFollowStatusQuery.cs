using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Follow.Queries.CheckFollowStatus;

public record CheckFollowStatusQuery(Guid FollowerId, Guid FollowingId) : IRequest<bool>;

public class CheckFollowStatusQueryHandler(IFollowRepository followRepository) : IRequestHandler<CheckFollowStatusQuery, bool>
{
    public async Task<bool> Handle(CheckFollowStatusQuery request, CancellationToken cancellationToken)
    {
        return await followRepository.IsFollowingAsync(request.FollowerId, request.FollowingId, cancellationToken);
    }
}
