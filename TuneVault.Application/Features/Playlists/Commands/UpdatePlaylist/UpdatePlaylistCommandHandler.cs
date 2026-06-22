using MediatR;
using TuneVault.Application.Interfaces;
using System.Text.RegularExpressions;

namespace TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist;

public class UpdatePlaylistCommandHandler(IPlaylistRepository playlistRepository) : IRequestHandler<UpdatePlaylistCommand, bool>
{
    public async Task<bool> Handle(UpdatePlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = await playlistRepository.GetByIdAsync(request.PlaylistId, cancellationToken);
        if (playlist == null) return false;

        if (playlist.UserProfileId != request.UserId)
            throw new UnauthorizedAccessException("Bạn không có quyền sửa playlist này.");

        playlist.Name = request.Name;
        playlist.Description = request.Description;
        if (request.IsPublic.HasValue)
        {
            playlist.IsPublic = request.IsPublic.Value;
        }

        if (request.CoverUrl != null)
        {
            if (request.CoverUrl == "")
            {
                playlist.CoverUrl = null;
            }
            else if (request.CoverUrl.StartsWith("data:image"))
            {
                try
                {
                    var parts = request.CoverUrl.Split(',', 2);
                    if (parts.Length == 2)
                    {
                        var meta = parts[0];
                        var base64Data = parts[1];
                        
                        var typePart = meta.Split(';')[0];
                        var ext = typePart.Split('/').LastOrDefault() ?? "jpg";
                        if (ext == "jpeg") ext = "jpg";
                        
                        var bytes = Convert.FromBase64String(base64Data.Trim());
                        
                        var fileName = $"{Guid.NewGuid()}.{ext}";
                        var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "playlists", fileName);
                        
                        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
                        await File.WriteAllBytesAsync(path, bytes, cancellationToken);
                        
                        playlist.CoverUrl = $"/uploads/playlists/{fileName}";
                    }
                }
                catch
                {
                    // Fallback if parsing fails
                    playlist.CoverUrl = request.CoverUrl;
                }
            }
            else
            {
                playlist.CoverUrl = request.CoverUrl;
            }
        }

        await playlistRepository.UpdateAsync(playlist, cancellationToken);
        return true;
    }
}
