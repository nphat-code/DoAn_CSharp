using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Security;
using TuneVault.Application.Features.Artists.Commands.FollowArtist;

namespace TuneVault.Application.Features.Artists.Commands.FollowArtist;

public class FollowArtistCommandHandler(IArtistRepository artistRepository, ICurrentUserService currentUserService) 
    : IRequestHandler<FollowArtistCommand, bool>
{
    public async Task<bool> Handle(FollowArtistCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        return await artistRepository.FollowArtistAsync(userId, request.ArtistId, cancellationToken);
    }
}
