using MediatR;

namespace TuneVault.Application.Features.Albums.Commands.AddTrackToAlbum;

public record AddTrackToAlbumCommand(Guid AlbumId, Guid TrackId) : IRequest<bool>;
