using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.History.Commands.AddPlayHistory;

[Authorize]
public record AddPlayHistoryCommand(Guid UserId, Guid MediaItemId) : IRequest<bool>;
