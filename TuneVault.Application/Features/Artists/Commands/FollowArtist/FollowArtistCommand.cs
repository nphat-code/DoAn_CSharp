using MediatR;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Security;

namespace TuneVault.Application.Features.Artists.Commands.FollowArtist;

[Authorize]
public record FollowArtistCommand(Guid ArtistId) : IRequest<bool>;