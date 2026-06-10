using MediatR;
using TuneVault.Application.Features.Albums.DTOs;

namespace TuneVault.Application.Features.Albums.Queries.GetAllAlbums;

public record GetAllAlbumsQuery() : IRequest<IEnumerable<AlbumDto>>;
