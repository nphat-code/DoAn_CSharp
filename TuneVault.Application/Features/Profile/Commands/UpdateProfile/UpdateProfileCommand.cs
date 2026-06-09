using MediatR;

namespace TuneVault.Application.Features.Profile.Commands.UpdateProfile;

public record UpdateProfileCommand(Guid UserId, string Username, string? AvatarUrl) : IRequest<bool>;
