using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Artists.Commands.CreateArtist;

public class CreateArtistCommandHandler(
    IArtistRepository artistRepository,
    IFileStorageService fileStorageService) : IRequestHandler<CreateArtistCommand, Guid>
{
    public async Task<Guid> Handle(CreateArtistCommand request, CancellationToken cancellationToken)
    {
        string? avatarUrl = null;
        if (request.AvatarFileStream != null && !string.IsNullOrEmpty(request.AvatarFileName))
        {
            avatarUrl = await fileStorageService.SaveFileAsync(request.AvatarFileStream, request.AvatarFileName, cancellationToken);
        }

        var artist = new Artist
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Bio = request.Bio,
            AvatarUrl = avatarUrl,
            CreatedAt = DateTime.UtcNow
        };

        await artistRepository.AddAsync(artist, cancellationToken);

        return artist.Id;
    }
}