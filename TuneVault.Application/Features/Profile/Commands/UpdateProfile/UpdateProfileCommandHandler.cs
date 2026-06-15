using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Profile.Commands.UpdateProfile;

public class UpdateProfileCommandHandler(IUserRepository userRepository) : IRequestHandler<UpdateProfileCommand, bool>
{
    public async Task<bool> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new Exception("User not found");

        await userRepository.UpdateProfileAsync(request.UserId, request.Username, request.AvatarUrl, request.Bio, cancellationToken);
        return true;
    }
}
