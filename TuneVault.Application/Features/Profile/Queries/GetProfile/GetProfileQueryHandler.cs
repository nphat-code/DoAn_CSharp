using MediatR;
using TuneVault.Application.Features.Profile.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Profile.Queries.GetProfile;

public class GetProfileQueryHandler(IUserRepository userRepository) : IRequestHandler<GetProfileQuery, ProfileDto>
{
    public async Task<ProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new Exception("User not found");

        return new ProfileDto(
            user.Id,
            user.Username,
            user.Email,
            user.AvatarUrl,
            user.CreatedAt
        );
    }
}
