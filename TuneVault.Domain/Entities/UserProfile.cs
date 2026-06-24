namespace TuneVault.Domain.Entities;



public class UserProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    
    public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<PlayHistory> PlayHistories { get; set; } = new List<PlayHistory>();
    
    public ICollection<MediaShare> SentShares { get; set; } = new List<MediaShare>();
    public ICollection<MediaShare> ReceivedShares { get; set; } = new List<MediaShare>();
    
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public ICollection<Follow> Following { get; set; } = new List<Follow>();
    public ICollection<Follow> Followers { get; set; } = new List<Follow>();
}
