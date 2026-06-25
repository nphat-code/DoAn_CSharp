namespace TuneVault.Domain.Entities;

public class Artist
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int RealMonthlyListeners { get; set; }


    public ICollection<Album> Albums { get; set; } = new List<Album>();
    public ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}
