using MediatR;
using TuneVault.Application.Features.Artists.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Artists.Queries.GetFollowedArtists;

public class GetFollowedArtistsQueryHandler(IArtistRepository artistRepository, ICurrentUserService currentUserService) 
    : IRequestHandler<GetFollowedArtistsQuery, IEnumerable<ArtistDto>>
{
    public async Task<IEnumerable<ArtistDto>> Handle(GetFollowedArtistsQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        var artists = await artistRepository.GetFollowedArtistsAsync(userId, cancellationToken);

        return artists.Select(a => new ArtistDto(
            a.Id,
            a.Name,
            a.Bio,
            a.AvatarUrl,
            a.CreatedAt
        ));
    }
}
