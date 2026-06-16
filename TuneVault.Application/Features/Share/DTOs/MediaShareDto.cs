namespace TuneVault.Application.Features.Share.DTOs;

public class MediaShareDto
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string? SenderAvatarUrl { get; set; }
    public Guid ReceiverId { get; set; }
    public Guid MediaItemId { get; set; }
    public string MediaTitle { get; set; } = string.Empty;
    public string? MediaCoverUrl { get; set; }
    public string MediaType { get; set; } = string.Empty;
    public string? MediaArtistName { get; set; }
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; }
}
