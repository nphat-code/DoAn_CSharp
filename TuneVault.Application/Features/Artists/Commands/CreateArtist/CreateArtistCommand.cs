using MediatR;

namespace TuneVault.Application.Features.Artists.Commands.CreateArtist;

public record CreateArtistCommand(
    string Name,
    string? Bio,
    Stream? AvatarFileStream,
    string? AvatarFileName
) : IRequest<Guid>;