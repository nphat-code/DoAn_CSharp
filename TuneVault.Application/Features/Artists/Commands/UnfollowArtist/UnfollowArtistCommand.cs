using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Security;

namespace TuneVault.Application.Features.Artists.Commands.UnfollowArtist;

[Authorize]
public record UnfollowArtistCommand(Guid ArtistId) : IRequest<bool>;

public class UnfollowArtistCommandHandler(IArtistRepository artistRepository, ICurrentUserService currentUserService) 
    : IRequestHandler<UnfollowArtistCommand, bool>
{
    public async Task<bool> Handle(UnfollowArtistCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        return await artistRepository.UnfollowArtistAsync(userId, request.ArtistId, cancellationToken);
    }
}
