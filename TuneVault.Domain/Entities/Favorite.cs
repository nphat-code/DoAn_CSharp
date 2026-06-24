namespace TuneVault.Domain.Entities;


public class Favorite
{
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;

    public Guid MediaItemId { get; set; }
    public MediaItem MediaItem { get; set; } = null!;

    public DateTime FavoritedAt { get; set; } = DateTime.UtcNow;
}
