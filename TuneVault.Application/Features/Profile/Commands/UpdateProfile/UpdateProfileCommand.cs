using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Profile.Commands.UpdateProfile;

[Authorize]
public record UpdateProfileCommand(Guid UserId, string Username, string? AvatarUrl, string? Bio) : IRequest<bool>;
