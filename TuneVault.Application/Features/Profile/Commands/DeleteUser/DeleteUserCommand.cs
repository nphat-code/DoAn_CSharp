using MediatR;

namespace TuneVault.Application.Features.Profile.Commands.DeleteUser;

public record DeleteUserCommand(Guid UserId) : IRequest<bool>;
