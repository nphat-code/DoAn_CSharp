using MediatR;
using TuneVault.Application.Features.Share.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Share.Queries.GetSharedWithMe;

public class GetSharedWithMeQueryHandler(IShareRepository shareRepository) : IRequestHandler<GetSharedWithMeQuery, IEnumerable<MediaShareDto>>
{
    public async Task<IEnumerable<MediaShareDto>> Handle(GetSharedWithMeQuery request, CancellationToken cancellationToken)
    {
        return await shareRepository.GetSharedWithMeAsync(request.UserId, cancellationToken);
    }
}
