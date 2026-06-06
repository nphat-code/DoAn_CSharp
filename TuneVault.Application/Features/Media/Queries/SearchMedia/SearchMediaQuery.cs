using MediatR;
using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Features.Media.Queries.SearchMedia;

public record SearchMediaQuery(string Query) : IRequest<IEnumerable<MediaItemDto>>;
