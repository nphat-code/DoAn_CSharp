using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Albums.Commands.CreateAlbum;

public class CreateAlbumCommandHandler(
    IAlbumRepository albumRepository,
    IArtistRepository artistRepository,
    IFileStorageService fileStorageService) : IRequestHandler<CreateAlbumCommand, Guid>
{
    public async Task<Guid> Handle(CreateAlbumCommand request, CancellationToken cancellationToken)
    {
        // 1. Lưu ảnh bìa
        string? coverUrl = null;
        if (request.CoverImageStream != null && !string.IsNullOrWhiteSpace(request.CoverImageFileName))
        {
            coverUrl = await fileStorageService.SaveFileAsync(request.CoverImageStream, request.CoverImageFileName, cancellationToken);
        }

        // 2. Xử lý Nghệ sĩ
        Guid artistId;
        var artistName = request.ArtistName.Trim();
        var existingArtist = await artistRepository.GetByNameAsync(artistName, cancellationToken);
        
        if (existingArtist != null)
        {
            artistId = existingArtist.Id;
        }
        else
        {
            var newArtist = new Artist
            {
                Id = Guid.NewGuid(),
                Name = artistName,
                CreatedAt = DateTime.UtcNow
            };
            await artistRepository.AddAsync(newArtist, cancellationToken);
            artistId = newArtist.Id;
        }

        // 3. Tạo Album
        var album = new Album
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            ArtistId = artistId,
            CoverUrl = coverUrl,
            ReleaseDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await albumRepository.AddAsync(album, cancellationToken);
        return album.Id;
    }
}
