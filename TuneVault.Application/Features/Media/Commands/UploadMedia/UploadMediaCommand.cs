using TuneVault.Application.Security;
using MediatR;
using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Features.Media.Commands.UploadMedia;


[Authorize]
public record UploadMediaCommand(
    Guid UploaderId,
    string Title,
    string? Description,
    Stream FileStream,
    string FileName,
    string ContentType,
    Stream? CoverImageStream = null,
    string? CoverImageFileName = null,
    Guid? AlbumId = null,
    Guid? ArtistId = null
) : IRequest<MediaItemDto>;
