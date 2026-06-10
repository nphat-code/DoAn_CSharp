namespace TuneVault.Application.Features.Albums.DTOs;

public record AlbumDto(
    Guid Id,
    string Title,
    string? CoverUrl,
    DateTime ReleaseDate,
    Guid ArtistId,
    string ArtistName
);
