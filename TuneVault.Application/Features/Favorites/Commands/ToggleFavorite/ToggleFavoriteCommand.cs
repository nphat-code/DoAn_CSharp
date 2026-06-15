using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Favorites.Commands.ToggleFavorite;

[Authorize]
public record ToggleFavoriteCommand(Guid UserId, Guid MediaItemId) : IRequest<bool>;
