using MediatR;
using TuneVault.Application.Features.Share.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Share.Queries.GetSharedByMe;

public class GetSharedByMeQueryHandler(IShareRepository shareRepository) : IRequestHandler<GetSharedByMeQuery, IEnumerable<MediaShareDto>>
{
    public async Task<IEnumerable<MediaShareDto>> Handle(GetSharedByMeQuery request, CancellationToken cancellationToken)
    {
        return await shareRepository.GetSharedByMeAsync(request.SenderId, cancellationToken);
    }
}
