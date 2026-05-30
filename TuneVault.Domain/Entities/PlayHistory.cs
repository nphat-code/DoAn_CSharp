namespace TuneVault.Domain.Entities;

public class PlayHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;

    public Guid MediaItemId { get; set; }
    public MediaItem MediaItem { get; set; } = null!;

    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
}
