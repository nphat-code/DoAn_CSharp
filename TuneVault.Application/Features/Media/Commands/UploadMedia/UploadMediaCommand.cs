using MediatR;
using TuneVault.Application.Features.Media.DTOs;

namespace TuneVault.Application.Features.Media.Commands.UploadMedia;

// Note: Passing Stream instead of IFormFile ensures Application Layer is decoupled from ASP.NET Core HTTP concerns.
public record UploadMediaCommand(
    Guid UploaderId,
    string Title,
    string? Description,
    Stream FileStream,
    string FileName,
    string ContentType,
    Stream? CoverImageStream = null,
    string? CoverImageFileName = null
) : IRequest<MediaItemDto>;
