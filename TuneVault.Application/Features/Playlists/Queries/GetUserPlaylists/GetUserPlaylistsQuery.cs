using MediatR;
using TuneVault.Application.Features.Playlists.DTOs;

namespace TuneVault.Application.Features.Playlists.Queries.GetUserPlaylists;

public record GetUserPlaylistsQuery(Guid UserId) : IRequest<List<PlaylistDto>>;
