using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Albums.Commands.AddTrackToAlbum;

[Authorize]
public record AddTrackToAlbumCommand(Guid AlbumId, Guid TrackId) : IRequest<bool>;
