using TuneVault.Application.Security;
using MediatR;

namespace TuneVault.Application.Features.Artists.Commands.DeleteArtist;

[Authorize]
public record DeleteArtistCommand(Guid Id) : IRequest;
