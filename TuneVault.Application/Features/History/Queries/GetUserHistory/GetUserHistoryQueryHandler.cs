using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.History.Queries.GetUserHistory;

public class GetUserHistoryQueryHandler(IPlayHistoryRepository playHistoryRepository)
    : IRequestHandler<GetUserHistoryQuery, IEnumerable<PlayHistory>>
{
    public async Task<IEnumerable<PlayHistory>> Handle(GetUserHistoryQuery request, CancellationToken cancellationToken)
    {
        var history = await playHistoryRepository.GetUserHistoryAsync(request.UserId, cancellationToken);
        
        return history.Take(request.Limit);
    }
}
