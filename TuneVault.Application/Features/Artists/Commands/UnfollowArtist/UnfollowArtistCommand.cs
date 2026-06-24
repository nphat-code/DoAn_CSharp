using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Security;

namespace TuneVault.Application.Features.Artists.Commands.UnfollowArtist;

[Authorize]
public record UnfollowArtistCommand(Guid ArtistId) : IRequest<bool>;