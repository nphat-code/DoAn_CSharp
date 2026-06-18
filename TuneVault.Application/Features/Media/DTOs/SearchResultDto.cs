
using TuneVault.Application.Features.Playlists.DTOs;
using TuneVault.Application.Features.Artists.DTOs;

namespace TuneVault.Application.Features.Media.DTOs;

public class SearchResultDto
{
    public IEnumerable<MediaItemDto> Tracks { get; set; } = new List<MediaItemDto>();
    public IEnumerable<ArtistDto> Artists { get; set; } = new List<ArtistDto>();
    public IEnumerable<TuneVault.Application.Features.Albums.DTOs.AlbumDto> Albums { get; set; } = new List<TuneVault.Application.Features.Albums.DTOs.AlbumDto>();
    public IEnumerable<PlaylistDto> Playlists { get; set; } = new List<PlaylistDto>();
    public IEnumerable<TuneVault.Application.Features.Profile.DTOs.ProfileDto> Users { get; set; } = new List<TuneVault.Application.Features.Profile.DTOs.ProfileDto>();
    
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
}
