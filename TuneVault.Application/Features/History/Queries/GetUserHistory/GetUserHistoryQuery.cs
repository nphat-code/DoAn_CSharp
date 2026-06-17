using MediatR;
using TuneVault.Domain.Entities;
using TuneVault.Application.Security;

namespace TuneVault.Application.Features.History.Queries.GetUserHistory;

[Authorize]
public record GetUserHistoryQuery(Guid UserId, int Limit = 10) : IRequest<IEnumerable<PlayHistory>>;
