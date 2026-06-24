using MediatR;
using TuneVault.Application.Interfaces;
using System.Collections.Generic;

namespace TuneVault.Application.Features.Albums.Commands.DeleteAlbum;

public class DeleteAlbumCommandHandler(
    IAlbumRepository albumRepository,
    IFileStorageService fileStorageService) : IRequestHandler<DeleteAlbumCommand>
{
    public async Task Handle(DeleteAlbumCommand request, CancellationToken cancellationToken)
    {
        var album = await albumRepository.GetAlbumByIdAsync(request.Id, cancellationToken);
        if (album == null)
        {
            throw new KeyNotFoundException("Album not found.");
        }

        if (!string.IsNullOrEmpty(album.CoverUrl))
        {
            await fileStorageService.DeleteFileAsync(album.CoverUrl, cancellationToken);
        }

        await albumRepository.DeleteAsync(request.Id, cancellationToken);
    }
}
