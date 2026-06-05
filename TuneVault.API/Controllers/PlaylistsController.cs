using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Playlists.Commands.AddTrackToPlaylist;
using TuneVault.Application.Features.Playlists.Commands.CreatePlaylist;
using TuneVault.Application.Features.Playlists.Commands.DeletePlaylist;
using TuneVault.Application.Features.Playlists.Commands.RemoveTrackFromPlaylist;
using TuneVault.Application.Features.Playlists.Queries.GetPlaylistDetails;
using TuneVault.Application.Features.Playlists.Queries.GetUserPlaylists;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlaylistsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetUserPlaylists()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var query = new GetUserPlaylistsQuery(userId);
        var result = await mediator.Send(query);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id}")]
    [AllowAnonymous] // Hoặc Authorize tùy theo IsPublic
    public async Task<IActionResult> GetPlaylistDetails(Guid id)
    {
        var query = new GetPlaylistDetailsQuery(id);
        var result = await mediator.Send(query);
        if (result == null) return NotFound(new { success = false, message = "Playlist không tồn tại." });
        return Ok(new { success = true, data = result });
    }

    [HttpPost]
    public async Task<IActionResult> CreatePlaylist([FromBody] CreatePlaylistRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var command = new CreatePlaylistCommand(userId, request.Name, request.Description, request.IsPublic);
        var result = await mediator.Send(command);
        return Ok(new { success = true, data = result });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePlaylist(Guid id)
    {
        try
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var command = new DeletePlaylistCommand(id, userId);
            var result = await mediator.Send(command);
            return Ok(new { success = true });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPost("{playlistId}/tracks/{mediaItemId}")]
    public async Task<IActionResult> AddTrack(Guid playlistId, Guid mediaItemId)
    {
        var command = new AddTrackToPlaylistCommand(playlistId, mediaItemId);
        var result = await mediator.Send(command);
        return Ok(new { success = true });
    }

    [HttpDelete("{playlistId}/tracks/{mediaItemId}")]
    public async Task<IActionResult> RemoveTrack(Guid playlistId, Guid mediaItemId)
    {
        var command = new RemoveTrackFromPlaylistCommand(playlistId, mediaItemId);
        var result = await mediator.Send(command);
        return Ok(new { success = true });
    }
}

public class CreatePlaylistRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; }
}
