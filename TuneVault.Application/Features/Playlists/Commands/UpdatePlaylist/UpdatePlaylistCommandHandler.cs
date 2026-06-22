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
                var match = Regex.Match(request.CoverUrl, @"data:image/(?<type>.+?),(?<data>.+)");
                if (match.Success)
                {
                    var base64Data = match.Groups["data"].Value;
                    var ext = match.Groups["type"].Value.Split(';')[0];
                    if (ext == "jpeg") ext = "jpg";
                    var bytes = Convert.FromBase64String(base64Data);
                    
                    var fileName = $"{Guid.NewGuid()}.{ext}";
                    var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "playlists", fileName);
                    
                    Directory.CreateDirectory(Path.GetDirectoryName(path)!);
                    await File.WriteAllBytesAsync(path, bytes, cancellationToken);
                    
                    playlist.CoverUrl = $"/uploads/playlists/{fileName}";
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
