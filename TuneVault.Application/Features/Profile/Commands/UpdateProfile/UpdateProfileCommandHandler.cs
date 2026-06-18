using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Profile.Commands.UpdateProfile;

public class UpdateProfileCommandHandler(IUserRepository userRepository, IFileStorageService fileStorageService) : IRequestHandler<UpdateProfileCommand, bool>
{
    public async Task<bool> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new Exception("User not found");

        var avatarUrlToSave = request.AvatarUrl;

        if (!string.IsNullOrEmpty(request.AvatarUrl) && request.AvatarUrl.StartsWith("data:image"))
        {
            var match = System.Text.RegularExpressions.Regex.Match(request.AvatarUrl, @"data:image/(?<type>.+?),(?<data>.+)");
            if (match.Success)
            {
                var base64Data = match.Groups["data"].Value;
                var extension = match.Groups["type"].Value.Split(';')[0];
                var bytes = Convert.FromBase64String(base64Data);
                using var stream = new MemoryStream(bytes);
                avatarUrlToSave = await fileStorageService.SaveFileAsync(stream, $"avatar_{request.UserId}.{extension}", "covers", cancellationToken);
            }
        }

        await userRepository.UpdateProfileAsync(request.UserId, request.Username, avatarUrlToSave, request.Bio, cancellationToken);
        return true;
    }
}
