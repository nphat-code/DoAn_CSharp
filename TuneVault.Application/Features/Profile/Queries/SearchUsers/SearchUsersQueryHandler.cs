using MediatR;
using TuneVault.Application.Features.Profile.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Profile.Queries.SearchUsers;

public class SearchUsersQueryHandler(IUserRepository userRepository) : IRequestHandler<SearchUsersQuery, IEnumerable<ProfileDto>>
{
    public async Task<IEnumerable<ProfileDto>> Handle(SearchUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await userRepository.SearchUsersAsync(request.Query, cancellationToken);
        
        return users.Select(u => new ProfileDto(
            u.Id,
            u.Username,
            u.Email,
            u.AvatarUrl,
            u.Bio,
            u.CreatedAt
        ));
    }
}
