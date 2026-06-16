namespace TuneVault.Domain.Entities;

public class MediaShare
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid SenderId { get; set; }
    public UserProfile Sender { get; set; } = null!;
    
    public Guid ReceiverId { get; set; }
    public UserProfile Receiver { get; set; } = null!;

    public Guid? MediaItemId { get; set; }
    public MediaItem? MediaItem { get; set; }

    public Guid? PlaylistId { get; set; }
    public Playlist? Playlist { get; set; }

    public Guid? AlbumId { get; set; }
    public Album? Album { get; set; }

    public string? Message { get; set; }
    public DateTime SharedAt { get; set; } = DateTime.UtcNow;
}
