using MediatR;

namespace TuneVault.Application.Features.Media.Commands.DeleteMedia;

public record DeleteMediaCommand(Guid Id, Guid RequesterId) : IRequest<bool>;
