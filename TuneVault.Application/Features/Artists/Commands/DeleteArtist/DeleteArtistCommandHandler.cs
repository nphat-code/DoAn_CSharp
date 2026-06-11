using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Artists.Commands.DeleteArtist;

public class DeleteArtistCommandHandler(IArtistRepository artistRepository) : IRequestHandler<DeleteArtistCommand>
{
    public async Task Handle(DeleteArtistCommand request, CancellationToken cancellationToken)
    {
        var artist = await artistRepository.GetByIdAsync(request.Id, cancellationToken);
        if (artist == null)
            throw new Exception("Artist not found");

        await artistRepository.DeleteAsync(request.Id, cancellationToken);
    }
}
