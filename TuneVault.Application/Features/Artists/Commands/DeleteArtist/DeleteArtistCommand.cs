using MediatR;

namespace TuneVault.Application.Features.Artists.Commands.DeleteArtist;

public record DeleteArtistCommand(Guid Id) : IRequest;
