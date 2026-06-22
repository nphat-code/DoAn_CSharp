using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Profile.Commands.UpdateAvatar;

public class UpdateProfileAvatarCommandHandler(IUserRepository userRepository, IFileStorageService fileStorageService) : IRequestHandler<UpdateProfileAvatarCommand, bool>
{
    public async Task<bool> Handle(UpdateProfileAvatarCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new Exception("User not found");

        var avatarUrlToSave = request.AvatarUrl;
        var oldAvatarUrl = user.AvatarUrl;
        var isChangingAvatar = false;

        if (request.AvatarUrl == "")
        {
            avatarUrlToSave = null;
            isChangingAvatar = true;
        }
        else if (!string.IsNullOrEmpty(request.AvatarUrl) && request.AvatarUrl.StartsWith("data:image"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(request.AvatarUrl, @"data:image/(?<type>.+?),(?<data>.+)");
            if (match.Success)
            {
                var base64Data = match.Groups["data"].Value;
                var extension = match.Groups["type"].Value.Split(';')[0];
                var bytes = Convert.FromBase64String(base64Data);
                using var stream = new MemoryStream(bytes);
                avatarUrlToSave = await fileStorageService.SaveFileAsync(stream, $"avatar_{request.UserId}_{DateTime.UtcNow.Ticks}.{extension}", "avatars", cancellationToken);
                isChangingAvatar = true;
            }
        }
        else if (request.AvatarUrl != user.AvatarUrl)
        {
            isChangingAvatar = true;
        }

        if (isChangingAvatar && !string.IsNullOrEmpty(oldAvatarUrl) && oldAvatarUrl.StartsWith("http"))
        {
            try
            {
                await fileStorageService.DeleteFileAsync(oldAvatarUrl, cancellationToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Cloudinary Delete Old Avatar Error] {ex.Message}");
            }
        }

        await userRepository.UpdateAvatarAsync(request.UserId, avatarUrlToSave, cancellationToken);
        return true;
    }
}
