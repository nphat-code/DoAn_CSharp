using TuneVault.Application.Security;
using MediatR;
using System.IO;

namespace TuneVault.Application.Features.Albums.Commands.CreateAlbum;

[Authorize]
public record CreateAlbumCommand(
    string Title,
    string ArtistName,
    Stream? CoverImageStream = null,
    string? CoverImageFileName = null
) : IRequest<Guid>;
