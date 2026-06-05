using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Features.Playlists.DTOs;

public class PlaylistDetailDto : PlaylistDto
{
    public List<MediaItemDto> Tracks { get; set; } = new();
}
