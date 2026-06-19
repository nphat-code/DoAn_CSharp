using MediatR;
using TuneVault.Application.Security;
using TuneVault.Application.Features.Artists.DTOs;

namespace TuneVault.Application.Features.Artists.Queries.GetFollowedArtists;

[Authorize]
public record GetFollowedArtistsQuery() : IRequest<IEnumerable<ArtistDto>>;
