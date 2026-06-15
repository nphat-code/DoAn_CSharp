namespace TuneVault.Application.Features.Profile.DTOs;

public record ProfileDto(
    Guid Id,
    string Username,
    string Email,
    string? AvatarUrl,
    string? Bio,
    DateTime CreatedAt
);
