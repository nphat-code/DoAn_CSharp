using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Profile.Commands.DeleteUser;

public class DeleteUserCommandHandler(
    IUserRepository userRepository,
    IMediaItemRepository mediaRepository,
    IPlaylistRepository playlistRepository,
    IFileStorageService fileStorageService) : IRequestHandler<DeleteUserCommand, bool>
{
    public async Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new Exception("User not found");

        // 1. Delete Avatar
        if (!string.IsNullOrEmpty(user.AvatarUrl) && user.AvatarUrl.StartsWith("http"))
        {
            try { await fileStorageService.DeleteFileAsync(user.AvatarUrl, cancellationToken); } catch { }
        }

        // 2. Delete Media Items uploaded by user
        var userMedia = await mediaRepository.GetByUploaderIdAsync(request.UserId, cancellationToken);
        foreach (var media in userMedia)
        {
            if (!string.IsNullOrEmpty(media.FileUrl) && media.FileUrl.StartsWith("http"))
            {
                try { await fileStorageService.DeleteFileAsync(media.FileUrl, cancellationToken); } catch { }
            }
            if (!string.IsNullOrEmpty(media.CoverUrl) && media.CoverUrl.StartsWith("http"))
            {
                try { await fileStorageService.DeleteFileAsync(media.CoverUrl, cancellationToken); } catch { }
            }
        }

        // 3. Delete Playlists created by user
        var userPlaylists = await playlistRepository.GetUserPlaylistsAsync(request.UserId, cancellationToken);
        foreach (var playlist in userPlaylists)
        {
            if (!string.IsNullOrEmpty(playlist.CoverUrl) && playlist.CoverUrl.StartsWith("http"))
            {
                try { await fileStorageService.DeleteFileAsync(playlist.CoverUrl, cancellationToken); } catch { }
            }
        }

        // 4. Delete user from DB (Cascades to history, likes, etc.)
        await userRepository.DeleteAsync(request.UserId, cancellationToken);

        return true;
    }
}
