namespace TuneVault.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid UserProfileId { get; set; }
    public UserProfile UserProfile { get; set; } = null!;

    public required string Title { get; set; }
    public required string Message { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
