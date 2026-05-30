namespace TuneVault.Domain.Entities;

// Junction Table (Bảng trung gian) cho quan hệ Nhiều-Nhiều giữa Playlist và MediaItem
public class PlaylistTrack
{
    public Guid PlaylistId { get; set; }
    public Playlist Playlist { get; set; } = null!;

    public Guid MediaItemId { get; set; }
    public MediaItem MediaItem { get; set; } = null!;

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    
    // Thứ tự phát nhạc trong Playlist
    public int DisplayOrder { get; set; }
}
