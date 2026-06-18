using MediatR;
using TuneVault.Application.Features.Profile.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Follow.Queries.GetFollowData;

public record GetFollowersQuery(Guid UserId) : IRequest<IEnumerable<ProfileDto>>;
public record GetFollowingQuery(Guid UserId) : IRequest<IEnumerable<ProfileDto>>;
public record GetFollowCountsQuery(Guid UserId) : IRequest<(int Followers, int Following)>;

public class GetFollowDataHandlers(IFollowRepository followRepository) : 
    IRequestHandler<GetFollowersQuery, IEnumerable<ProfileDto>>,
    IRequestHandler<GetFollowingQuery, IEnumerable<ProfileDto>>,
    IRequestHandler<GetFollowCountsQuery, (int Followers, int Following)>
{
    public async Task<IEnumerable<ProfileDto>> Handle(GetFollowersQuery request, CancellationToken cancellationToken)
    {
        return await followRepository.GetFollowersAsync(request.UserId, cancellationToken);
    }

    public async Task<IEnumerable<ProfileDto>> Handle(GetFollowingQuery request, CancellationToken cancellationToken)
    {
        return await followRepository.GetFollowingAsync(request.UserId, cancellationToken);
    }

    public async Task<(int Followers, int Following)> Handle(GetFollowCountsQuery request, CancellationToken cancellationToken)
    {
        var followers = await followRepository.GetFollowerCountAsync(request.UserId, cancellationToken);
        var following = await followRepository.GetFollowingCountAsync(request.UserId, cancellationToken);
        return (followers, following);
    }
}
