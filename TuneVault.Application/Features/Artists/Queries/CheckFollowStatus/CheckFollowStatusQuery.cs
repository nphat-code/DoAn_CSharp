using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Security;

namespace TuneVault.Application.Features.Artists.Queries.CheckFollowStatus;

[Authorize]
public record CheckFollowStatusQuery(Guid ArtistId) : IRequest<bool>;

public class CheckFollowStatusQueryHandler(IArtistRepository artistRepository, ICurrentUserService currentUserService) 
    : IRequestHandler<CheckFollowStatusQuery, bool>
{
    public async Task<bool> Handle(CheckFollowStatusQuery request, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(currentUserService.UserId!);
        return await artistRepository.IsFollowingArtistAsync(userId, request.ArtistId, cancellationToken);
    }
}
