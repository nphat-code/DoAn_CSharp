namespace TuneVault.Application.Features.Profile.DTOs;

public class UpdateProfileDto
{
    public required string Username { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
}
