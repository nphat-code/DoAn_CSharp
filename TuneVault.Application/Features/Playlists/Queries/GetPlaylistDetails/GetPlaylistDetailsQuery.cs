using MediatR;
using TuneVault.Application.Features.Playlists.DTOs;

namespace TuneVault.Application.Features.Playlists.Queries.GetPlaylistDetails;

public record GetPlaylistDetailsQuery(Guid PlaylistId) : IRequest<PlaylistDetailDto?>;
