using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Security;
using TuneVault.Application.Features.Artists.Commands.UnfollowArtist;

namespace TuneVault.Application.Features.Artists.Commands.UnfollowArtist;

public class UnfollowArtistCommandHandler(IArtistRepository artistRepository, ICurrentUserService currentUserService) 
    : IRequestHandler<UnfollowArtistCommand, bool>
{
    public async Task<bool> Handle(UnfollowArtistCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        return await artistRepository.UnfollowArtistAsync(userId, request.ArtistId, cancellationToken);
    }
}
