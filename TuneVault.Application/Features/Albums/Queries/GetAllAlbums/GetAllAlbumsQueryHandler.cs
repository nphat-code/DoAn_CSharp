using MediatR;
using TuneVault.Application.Features.Albums.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Albums.Queries.GetAllAlbums;

public class GetAllAlbumsQueryHandler(IAlbumRepository albumRepository) 
    : IRequestHandler<GetAllAlbumsQuery, IEnumerable<AlbumDto>>
{
    public async Task<IEnumerable<AlbumDto>> Handle(GetAllAlbumsQuery request, CancellationToken cancellationToken)
    {
        var albums = await albumRepository.GetAllAlbumsAsync(cancellationToken);
        
        return albums.Select(a => new AlbumDto(
            Id: a.Id,
            Title: a.Title,
            CoverUrl: a.CoverUrl,
            ReleaseDate: a.ReleaseDate,
            ArtistId: a.ArtistId,
            ArtistName: a.Artist?.Name ?? "Unknown Artist"
        ));
    }
}
