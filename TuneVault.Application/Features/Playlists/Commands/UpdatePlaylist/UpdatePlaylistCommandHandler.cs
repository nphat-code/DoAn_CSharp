using MediatR;
using TuneVault.Application.Interfaces;
using System.Text.RegularExpressions;

namespace TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist;

public class UpdatePlaylistCommandHandler(IPlaylistRepository playlistRepository, IFileStorageService fileStorageService) : IRequestHandler<UpdatePlaylistCommand, bool>
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
            var oldCoverUrl = playlist.CoverUrl;
            bool isChangingCover = false;

            if (request.CoverUrl == "")
            {
                playlist.CoverUrl = null;
                isChangingCover = true;
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
                        using var stream = new MemoryStream(bytes);
                        
                        var fileName = $"cover_{Guid.NewGuid()}.{ext}";
                        var url = await fileStorageService.SaveFileAsync(stream, fileName, "playlists", cancellationToken);
                        
                        playlist.CoverUrl = url;
                        isChangingCover = true;
                    }
                }
                catch
                {
                    // Fallback if parsing fails
                    playlist.CoverUrl = request.CoverUrl;
                }
            }
            else if (request.CoverUrl != playlist.CoverUrl)
            {
                playlist.CoverUrl = request.CoverUrl;
                // Note: if setting to a new existing URL, we don't necessarily delete the old one here unless we are sure it's orphaned, 
                // but usually the frontend sends either "" or "data:image...". 
                isChangingCover = true;
            }

            // Xóa ảnh cũ trên Cloudinary nếu có thay đổi và ảnh cũ là link Cloudinary
            if (isChangingCover && !string.IsNullOrEmpty(oldCoverUrl) && oldCoverUrl.StartsWith("http"))
            {
                try
                {
                    await fileStorageService.DeleteFileAsync(oldCoverUrl, cancellationToken);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Cloudinary Delete Old Cover Error] {ex.Message}");
                }
            }
        }

        await playlistRepository.UpdateAsync(playlist, cancellationToken);
        return true;
    }
}
