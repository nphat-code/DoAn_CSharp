using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Media.Commands.DeleteMedia;

[Authorize]
public record DeleteMediaCommand(Guid Id, Guid RequesterId, bool IsAdmin) : IRequest<bool>;
