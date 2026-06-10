using MediatR;

namespace TuneVault.Application.Features.Albums.Commands.DeleteAlbum;

public record DeleteAlbumCommand(Guid Id) : IRequest;
