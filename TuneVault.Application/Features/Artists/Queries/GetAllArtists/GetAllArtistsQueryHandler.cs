using MediatR;
using TuneVault.Application.Features.Artists.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Artists.Queries.GetAllArtists;

public class GetAllArtistsQueryHandler(IArtistRepository artistRepository) 
    : IRequestHandler<GetAllArtistsQuery, IEnumerable<ArtistDto>>
{
    public async Task<IEnumerable<ArtistDto>> Handle(GetAllArtistsQuery request, CancellationToken cancellationToken)
    {
        var artists = await artistRepository.GetAllAsync(cancellationToken);
        
        return artists.Select(a => new ArtistDto(
            a.Id,
            a.Name,
            a.Bio,
            a.AvatarUrl,
            a.CreatedAt,
            a.RealMonthlyListeners
        ));
    }
}
