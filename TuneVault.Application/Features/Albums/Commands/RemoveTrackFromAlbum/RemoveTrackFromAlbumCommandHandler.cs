using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Albums.Commands.RemoveTrackFromAlbum;

public class RemoveTrackFromAlbumCommandHandler(IAlbumRepository albumRepository, IMediaItemRepository mediaItemRepository)
    : IRequestHandler<RemoveTrackFromAlbumCommand, bool>
{
    public async Task<bool> Handle(RemoveTrackFromAlbumCommand request, CancellationToken cancellationToken)
    {
        var album = await albumRepository.GetAlbumByIdAsync(request.AlbumId, cancellationToken);
        if (album == null)
            throw new KeyNotFoundException("Album không tồn tại");

        var track = await mediaItemRepository.GetByIdAsync(request.TrackId, cancellationToken);
        if (track == null)
            throw new KeyNotFoundException("Bài hát không tồn tại");

        if (track.AlbumId != request.AlbumId)
            throw new InvalidOperationException("Bài hát không thuộc album này");

        track.AlbumId = null;
        // Giữ nguyên ArtistId hoặc xóa nếu cần
        // track.ArtistId = null; 

        await mediaItemRepository.UpdateAsync(track, cancellationToken);

        return true;
    }
}
