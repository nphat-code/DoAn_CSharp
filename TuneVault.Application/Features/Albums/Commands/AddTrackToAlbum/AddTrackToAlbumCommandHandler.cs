using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Albums.Commands.AddTrackToAlbum;

public class AddTrackToAlbumCommandHandler(IAlbumRepository albumRepository, IMediaItemRepository mediaItemRepository)
    : IRequestHandler<AddTrackToAlbumCommand, bool>
{
    public async Task<bool> Handle(AddTrackToAlbumCommand request, CancellationToken cancellationToken)
    {
        var album = await albumRepository.GetAlbumByIdAsync(request.AlbumId, cancellationToken);
        if (album == null)
            throw new KeyNotFoundException("Album không tồn tại");

        var track = await mediaItemRepository.GetByIdAsync(request.TrackId, cancellationToken);
        if (track == null)
            throw new KeyNotFoundException("Bài hát không tồn tại");

        track.AlbumId = request.AlbumId;

        await mediaItemRepository.UpdateAsync(track, cancellationToken);

        return true;
    }
}
