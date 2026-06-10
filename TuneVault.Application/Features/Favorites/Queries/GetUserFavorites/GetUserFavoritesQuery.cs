using MediatR;
using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Features.Favorites.Queries.GetUserFavorites;

public record GetUserFavoritesQuery(Guid UserId) : IRequest<IEnumerable<MediaItemDto>>;
