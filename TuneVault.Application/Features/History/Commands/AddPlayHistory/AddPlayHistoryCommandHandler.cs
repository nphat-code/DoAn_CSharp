using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.History.Commands.AddPlayHistory;

public class AddPlayHistoryCommandHandler(IPlayHistoryRepository historyRepository) : IRequestHandler<AddPlayHistoryCommand, bool>
{
    public async Task<bool> Handle(AddPlayHistoryCommand request, CancellationToken cancellationToken)
    {
        var history = new PlayHistory
        {
            Id = Guid.NewGuid(),
            UserProfileId = request.UserId,
            MediaItemId = request.MediaItemId,
            PlayedAt = DateTime.UtcNow
        };

        await historyRepository.AddAsync(history, cancellationToken);
        return true;
    }
}
