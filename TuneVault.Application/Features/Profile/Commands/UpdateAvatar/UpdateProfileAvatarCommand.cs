using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Profile.Commands.UpdateAvatar;

[Authorize]
public record UpdateProfileAvatarCommand(Guid UserId, string AvatarUrl) : IRequest<bool>;
