using MediatR;

namespace TuneVault.Application.Features.Albums.Commands.RemoveTrackFromAlbum;

public record RemoveTrackFromAlbumCommand(Guid AlbumId, Guid TrackId) : IRequest<bool>;
