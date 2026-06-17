using MediatR;
using TuneVault.Application.Features.Share.DTOs;

namespace TuneVault.Application.Features.Share.Queries.GetSharedByMe;

public record GetSharedByMeQuery(Guid SenderId) : IRequest<IEnumerable<MediaShareDto>>;
