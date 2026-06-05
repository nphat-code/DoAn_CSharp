using MediatR;
using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Features.Media.Queries.GetMediaList;

public record GetMediaListQuery() : IRequest<IEnumerable<MediaItemDto>>;
