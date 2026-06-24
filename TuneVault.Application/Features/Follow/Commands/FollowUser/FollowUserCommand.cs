using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Follow.Commands.FollowUser;

public record FollowUserCommand(Guid FollowerId, Guid FollowingId) : IRequest<bool>;