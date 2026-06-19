namespace TuneVault.Application.Features.Media.DTOs;

public class MediaItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
    public Guid UploaderId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CoverUrl { get; set; }
    public string? ArtistName { get; set; }
    public string? ArtistBio { get; set; }
    public string? ArtistAvatarUrl { get; set; }
    public Guid? ArtistId { get; set; }
    public string? AlbumTitle { get; set; }
}
