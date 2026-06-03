using MediatR;

namespace TuneVault.Application.Features.Share.Commands.ShareMedia;

public record ShareMediaCommand(Guid SenderId, Guid ReceiverId, Guid MediaId, string Message) : IRequest<bool>;
