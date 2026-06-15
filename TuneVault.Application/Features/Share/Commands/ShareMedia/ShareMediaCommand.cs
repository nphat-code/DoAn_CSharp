using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Share.Commands.ShareMedia;

[Authorize]
public record ShareMediaCommand(Guid SenderId, Guid ReceiverId, Guid MediaId, string Message) : IRequest<bool>;
