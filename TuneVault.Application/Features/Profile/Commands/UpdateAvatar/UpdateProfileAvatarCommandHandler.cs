using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Profile.Commands.UpdateAvatar;

public class UpdateProfileAvatarCommandHandler(IUserRepository userRepository) : IRequestHandler<UpdateProfileAvatarCommand, bool>
{
    public async Task<bool> Handle(UpdateProfileAvatarCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new Exception("User not found");

        await userRepository.UpdateAvatarAsync(request.UserId, request.AvatarUrl, cancellationToken);
        return true;
    }
}
