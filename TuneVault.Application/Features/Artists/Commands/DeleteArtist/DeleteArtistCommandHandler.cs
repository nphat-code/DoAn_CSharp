using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Artists.Commands.DeleteArtist;

public class DeleteArtistCommandHandler(
    IArtistRepository artistRepository,
    IAlbumRepository albumRepository,
    IMediaItemRepository mediaItemRepository,
    IFileStorageService fileStorageService) : IRequestHandler<DeleteArtistCommand>
{
    public async Task Handle(DeleteArtistCommand request, CancellationToken cancellationToken)
    {
        var artist = await artistRepository.GetByIdAsync(request.Id, cancellationToken);
        if (artist == null)
            throw new Exception("Artist not found");

        
        var mediaItems = await mediaItemRepository.GetByArtistIdAsync(request.Id, cancellationToken);
        foreach (var mediaItem in mediaItems)
        {
            if (!string.IsNullOrEmpty(mediaItem.FileUrl))
            {
                await fileStorageService.DeleteFileAsync(mediaItem.FileUrl, cancellationToken);
            }
            if (!string.IsNullOrEmpty(mediaItem.CoverUrl))
            {
                await fileStorageService.DeleteFileAsync(mediaItem.CoverUrl, cancellationToken);
            }
        }

        
        var albums = await albumRepository.GetAlbumsByArtistIdAsync(request.Id, cancellationToken);
        foreach (var album in albums)
        {
            if (!string.IsNullOrEmpty(album.CoverUrl))
            {
                await fileStorageService.DeleteFileAsync(album.CoverUrl, cancellationToken);
            }
        }

        
        if (!string.IsNullOrEmpty(artist.AvatarUrl))
        {
            await fileStorageService.DeleteFileAsync(artist.AvatarUrl, cancellationToken);
        }

        await artistRepository.DeleteAsync(request.Id, cancellationToken);
    }
}
