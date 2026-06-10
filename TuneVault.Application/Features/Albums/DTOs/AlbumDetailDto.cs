using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Features.Albums.DTOs;

public record AlbumDetailDto(
    Guid Id,
    string Title,
    string? CoverUrl,
    DateTime ReleaseDate,
    Guid ArtistId,
    string ArtistName,
    string? ArtistImageUrl,
    IEnumerable<MediaItemDto> Tracks
);
