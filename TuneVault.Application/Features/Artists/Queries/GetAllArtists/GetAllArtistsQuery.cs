using MediatR;
using TuneVault.Application.Features.Artists.DTOs;

namespace TuneVault.Application.Features.Artists.Queries.GetAllArtists;

public record GetAllArtistsQuery() : IRequest<IEnumerable<ArtistDto>>;
