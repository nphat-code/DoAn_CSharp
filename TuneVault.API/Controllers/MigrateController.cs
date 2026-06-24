using System.Data;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Interfaces;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MigrateController(IDbConnection dbConnection, IFileStorageService fileStorageService, IWebHostEnvironment env) : ControllerBase
{
    
    [HttpPost("migrate-to-cloudinary")]
    public async Task<IActionResult> MigrateToCloudinary(CancellationToken cancellationToken)
    {
        var wwwroot = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var results = new List<string>();

        
        var mediaItems = await dbConnection.QueryAsync<TuneVault.Domain.Entities.MediaItem>("SELECT Id, CoverUrl, FileUrl FROM MediaItems");
        foreach (var item in mediaItems)
        {
            var id = item.Id;
            var coverUrl = item.CoverUrl;
            var fileUrl = item.FileUrl;

            var newCoverUrl = await UploadToCloudinary(coverUrl, "covers", wwwroot, cancellationToken);
            var newFileUrl = await UploadToCloudinary(fileUrl, "audio", wwwroot, cancellationToken);

            if (newCoverUrl != coverUrl || newFileUrl != fileUrl)
            {
                if (newCoverUrl?.StartsWith("ERROR:") == true || newFileUrl?.StartsWith("ERROR:") == true)
                {
                    results.Add($"Failed for {id}: {newCoverUrl} | {newFileUrl}");
                    continue;
                }

                await dbConnection.ExecuteAsync(
                    "UPDATE MediaItems SET CoverUrl = @CoverUrl, FileUrl = @FileUrl WHERE Id = @Id",
                    new { CoverUrl = newCoverUrl ?? coverUrl, FileUrl = newFileUrl ?? fileUrl, Id = id }
                );
                results.Add($"Migrated MediaItem {id}");
            }
        }

        
        var artists = await dbConnection.QueryAsync<TuneVault.Domain.Entities.Artist>("SELECT Id, AvatarUrl FROM Artists");
        foreach (var item in artists)
        {
            var id = item.Id;
            var avatarUrl = item.AvatarUrl;
            var newAvatarUrl = await UploadToCloudinary(avatarUrl, "artists", wwwroot, cancellationToken);
            if (newAvatarUrl != avatarUrl)
            {
                await dbConnection.ExecuteAsync("UPDATE Artists SET AvatarUrl = @AvatarUrl WHERE Id = @Id", new { AvatarUrl = newAvatarUrl, Id = id });
                results.Add($"Migrated Artist {id}");
            }
        }

        
        var albums = await dbConnection.QueryAsync<TuneVault.Domain.Entities.Album>("SELECT Id, CoverUrl FROM Albums");
        foreach (var item in albums)
        {
            var id = item.Id;
            var cover = item.CoverUrl;
            var newCover = await UploadToCloudinary(cover, "albums", wwwroot, cancellationToken);
            if (newCover != cover)
            {
                await dbConnection.ExecuteAsync("UPDATE Albums SET CoverUrl = @CoverUrl WHERE Id = @Id", new { CoverUrl = newCover, Id = id });
                results.Add($"Migrated Album {id}");
            }
        }

        
        var playlists = await dbConnection.QueryAsync<TuneVault.Domain.Entities.Playlist>("SELECT Id, CoverUrl FROM Playlists");
        foreach (var item in playlists)
        {
            var id = item.Id;
            var cover = item.CoverUrl;
            var newCover = await UploadToCloudinary(cover, "playlists", wwwroot, cancellationToken);
            if (newCover != cover)
            {
                await dbConnection.ExecuteAsync("UPDATE Playlists SET CoverUrl = @CoverUrl WHERE Id = @Id", new { CoverUrl = newCover, Id = id });
                results.Add($"Migrated Playlist {id}");
            }
        }

        return Ok(new { Message = "Migration complete", MigratedCount = results.Count, Details = results });
    }

    private async Task<string?> UploadToCloudinary(string? localUrl, string folder, string wwwroot, CancellationToken ct)
    {
        
        if (string.IsNullOrEmpty(localUrl) || localUrl.StartsWith("http") || localUrl.StartsWith("/mock-")) return localUrl;

        var relativePath = localUrl.TrimStart('/');
        var physicalPath = Path.Combine(wwwroot, relativePath.Replace('/', Path.DirectorySeparatorChar));

        if (!System.IO.File.Exists(physicalPath)) return localUrl; 

        try
        {
            using var stream = new FileStream(physicalPath, FileMode.Open, FileAccess.Read);
            var fileName = Path.GetFileName(physicalPath);
            
            var cloudUrl = await fileStorageService.SaveFileAsync(stream, fileName, folder, ct);
            return cloudUrl;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error migrating {localUrl}: {ex.Message}");
            return $"ERROR: {ex.Message}";
        }
    }
}
