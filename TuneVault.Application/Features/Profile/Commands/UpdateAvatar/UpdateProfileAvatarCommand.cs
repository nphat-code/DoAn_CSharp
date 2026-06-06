using MediatR;

namespace TuneVault.Application.Features.Profile.Commands.UpdateAvatar;

public record UpdateProfileAvatarCommand(Guid UserId, string AvatarUrl) : IRequest<bool>;
