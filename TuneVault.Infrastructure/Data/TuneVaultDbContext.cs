using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Data;

public class TuneVaultDbContext : DbContext
{
    public TuneVaultDbContext(DbContextOptions<TuneVaultDbContext> options) : base(options)
    {
    }

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Artist> Artists => Set<Artist>();
    public DbSet<Album> Albums => Set<Album>();
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();
    public DbSet<Playlist> Playlists => Set<Playlist>();
    public DbSet<PlaylistTrack> PlaylistTracks => Set<PlaylistTrack>();
    public DbSet<MediaShare> MediaShares => Set<MediaShare>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<PlayHistory> PlayHistories => Set<PlayHistory>();
    public DbSet<Follow> Follows => Set<Follow>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Nếu tích hợp Identity, gọi: base.OnModelCreating(modelBuilder); và DbSet<UserProfile> sẽ map với AspNetUsers

        // 1. UserProfile (Map tới AspNetUsers nếu dùng Identity)
        modelBuilder.Entity<UserProfile>(entity =>
        {
            // Nếu dùng IdentityUser, Id đã được cấu hình tự động.
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
        });

        // 2. Artist
        modelBuilder.Entity<Artist>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
        });

        // 3. Album
        modelBuilder.Entity<Album>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.Artist)
                  .WithMany(a => a.Albums)
                  .HasForeignKey(e => e.ArtistId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 4. MediaItem
        modelBuilder.Entity<MediaItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.FileUrl).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.Album)
                  .WithMany(a => a.MediaItems)
                  .HasForeignKey(e => e.AlbumId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Artist)
                  .WithMany(a => a.MediaItems)
                  .HasForeignKey(e => e.ArtistId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // 5. Follow (User follows User)
        modelBuilder.Entity<Follow>(entity =>
        {
            entity.HasKey(e => new { e.FollowerId, e.FolloweeId });

            entity.HasOne(e => e.Follower)
                  .WithMany(u => u.Following)
                  .HasForeignKey(e => e.FollowerId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Followee)
                  .WithMany(u => u.Followers)
                  .HasForeignKey(e => e.FolloweeId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Các thực thể khác giữ nguyên như trước (Favorite, PlaylistTrack, MediaShare, ...)
        
        modelBuilder.Entity<Playlist>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.UserProfile).WithMany(u => u.Playlists).HasForeignKey(e => e.UserProfileId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlaylistTrack>(entity =>
        {
            entity.HasKey(e => new { e.PlaylistId, e.MediaItemId });
            entity.HasOne(e => e.Playlist).WithMany(p => p.PlaylistTracks).HasForeignKey(e => e.PlaylistId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.MediaItem).WithMany(m => m.PlaylistTracks).HasForeignKey(e => e.MediaItemId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasKey(e => new { e.UserProfileId, e.MediaItemId });
            entity.HasOne(e => e.UserProfile).WithMany(u => u.Favorites).HasForeignKey(e => e.UserProfileId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.MediaItem).WithMany(m => m.Favorites).HasForeignKey(e => e.MediaItemId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MediaShare>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Sender).WithMany(u => u.SentShares).HasForeignKey(e => e.SenderId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Receiver).WithMany(u => u.ReceivedShares).HasForeignKey(e => e.ReceiverId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.MediaItem).WithMany(m => m.Shares).HasForeignKey(e => e.MediaItemId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PlayHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.UserProfile).WithMany(u => u.PlayHistories).HasForeignKey(e => e.UserProfileId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.MediaItem).WithMany(m => m.PlayHistories).HasForeignKey(e => e.MediaItemId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.UserProfile).WithMany(u => u.Notifications).HasForeignKey(e => e.UserProfileId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
