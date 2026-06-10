using MediatR;
using TuneVault.Application.Features.Albums.DTOs;

namespace TuneVault.Application.Features.Albums.Queries.GetAlbumById;

public record GetAlbumByIdQuery(Guid Id) : IRequest<AlbumDetailDto?>;
