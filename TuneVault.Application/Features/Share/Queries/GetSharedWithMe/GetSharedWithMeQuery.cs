using MediatR;
using TuneVault.Application.Features.Share.DTOs;

namespace TuneVault.Application.Features.Share.Queries.GetSharedWithMe;

public record GetSharedWithMeQuery(Guid UserId) : IRequest<IEnumerable<MediaShareDto>>;
