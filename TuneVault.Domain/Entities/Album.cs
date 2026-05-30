namespace TuneVault.Domain.Entities;

public class Album
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public required string Title { get; set; }
    public string? CoverUrl { get; set; }
    public DateTime ReleaseDate { get; set; }
    
    public Guid ArtistId { get; set; }
    public Artist Artist { get; set; } = null!;
    
    public ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}
