using MediatR;
using TuneVault.Application.Features.Playlists.DTOs;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Playlists.Commands.CreatePlaylist;

public class CreatePlaylistCommandHandler(IPlaylistRepository playlistRepository) : IRequestHandler<CreatePlaylistCommand, PlaylistDto>
{
    public async Task<PlaylistDto> Handle(CreatePlaylistCommand request, CancellationToken cancellationToken)
    {
        var playlist = new Playlist
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            IsPublic = request.IsPublic,
            UserProfileId = request.UserId,
            CreatedAt = DateTime.UtcNow
        };

        await playlistRepository.AddAsync(playlist, cancellationToken);

        return new PlaylistDto
        {
            Id = playlist.Id,
            Name = playlist.Name,
            Description = playlist.Description,
            IsPublic = playlist.IsPublic,
            UserProfileId = playlist.UserProfileId,
            CreatedAt = playlist.CreatedAt
        };
    }
}
