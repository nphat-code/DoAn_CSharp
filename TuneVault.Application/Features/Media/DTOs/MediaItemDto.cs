namespace TuneVault.Application.Features.Media.DTOs;

public record MediaItemDto(
    Guid Id,
    string Title,
    string? Description,
    string FileUrl,
    string MediaType,
    TimeSpan Duration,
    Guid UploaderId,
    DateTime CreatedAt,
    string? ArtistName = null,
    string? ArtistBio = null,
    string? ArtistAvatarUrl = null
);
