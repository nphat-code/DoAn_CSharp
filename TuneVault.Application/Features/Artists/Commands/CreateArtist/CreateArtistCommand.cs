using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Artists.Commands.CreateArtist;

[Authorize]
public record CreateArtistCommand(
    string Name,
    string? Bio,
    Stream? AvatarFileStream,
    string? AvatarFileName
) : IRequest<Guid>;
