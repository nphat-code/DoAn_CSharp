using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Albums.Commands.DeleteAlbum;

[Authorize]
public record DeleteAlbumCommand(Guid Id) : IRequest;
