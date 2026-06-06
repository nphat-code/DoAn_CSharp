using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Favorites.Commands.ToggleFavorite;

public class ToggleFavoriteCommandHandler(IFavoriteRepository favoriteRepository) : IRequestHandler<ToggleFavoriteCommand, bool>
{
    public async Task<bool> Handle(ToggleFavoriteCommand request, CancellationToken cancellationToken)
    {
        return await favoriteRepository.ToggleFavoriteAsync(request.UserId, request.MediaItemId, cancellationToken);
    }
}
