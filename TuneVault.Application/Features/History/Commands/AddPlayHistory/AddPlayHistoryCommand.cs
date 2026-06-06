using MediatR;

namespace TuneVault.Application.Features.History.Commands.AddPlayHistory;

public record AddPlayHistoryCommand(Guid UserId, Guid MediaItemId) : IRequest<bool>;
