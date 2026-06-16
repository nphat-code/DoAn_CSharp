
using TuneVault.Application.Features.Playlists.DTOs;
using TuneVault.Application.Features.Artists.DTOs;

namespace TuneVault.Application.Features.Media.DTOs;

public class SearchResultDto
{
    public IEnumerable<MediaItemDto> Tracks { get; set; } = new List<MediaItemDto>();
    public IEnumerable<ArtistDto> Artists { get; set; } = new List<ArtistDto>();
    public IEnumerable<PlaylistDto> Playlists { get; set; } = new List<PlaylistDto>();
    
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int TotalItems { get; set; }
}
