namespace TuneVault.Domain.Entities;

public class MediaItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public required string FileUrl { get; set; }
    public string? Description { get; set; }
    public string? CoverUrl { get; set; }
    public required string MediaType { get; set; }
    public TimeSpan Duration { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid UploaderId { get; set; }
    public UserProfile Uploader { get; set; } = null!;

    public Guid? AlbumId { get; set; }
    public Album? Album { get; set; }

    public Guid? ArtistId { get; set; }
    public Artist? Artist { get; set; }

    // Navigation properties
    public ICollection<PlaylistTrack> PlaylistTracks { get; set; } = new List<PlaylistTrack>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<PlayHistory> PlayHistories { get; set; } = new List<PlayHistory>();
    public ICollection<MediaShare> Shares { get; set; } = new List<MediaShare>();
}
