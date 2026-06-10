using MediatR;
using TuneVault.Application.Interfaces;
using System.Collections.Generic;

namespace TuneVault.Application.Features.Albums.Commands.DeleteAlbum;

public class DeleteAlbumCommandHandler(IAlbumRepository albumRepository) : IRequestHandler<DeleteAlbumCommand>
{
    public async Task Handle(DeleteAlbumCommand request, CancellationToken cancellationToken)
    {
        var album = await albumRepository.GetAlbumByIdAsync(request.Id, cancellationToken);
        if (album == null)
        {
            throw new KeyNotFoundException("Album not found.");
        }

        await albumRepository.DeleteAsync(request.Id, cancellationToken);
    }
}
