namespace TuneVault.Application.Features.Artists.DTOs;

public record ArtistDto(
    Guid Id,
    string Name,
    string? Bio,
    string? AvatarUrl,
    DateTime CreatedAt
);
