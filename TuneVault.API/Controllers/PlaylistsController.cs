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
using TuneVault.Application.Features.Playlists.Commands.UpdatePlaylist;

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

    [HttpGet("user/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUserPublicPlaylists(Guid userId)
    {
        var query = new GetUserPlaylistsQuery(userId);
        var result = await mediator.Send(query);
        
        var currentUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        bool isOwner = currentUserIdString != null && Guid.TryParse(currentUserIdString, out var currentUserId) && currentUserId == userId;
        
        if (!isOwner)
        {
            result = result.Where(p => p.IsPublic).ToList();
        }
        
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

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePlaylist(Guid id, [FromBody] UpdatePlaylistRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var command = new UpdatePlaylistCommand(id, userId, request.Name, request.Description, request.CoverUrl);
        var result = await mediator.Send(command);
        if (!result) return NotFound();
        return Ok(new { success = true });
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
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var command = new AddTrackToPlaylistCommand(playlistId, mediaItemId, userId);
        var result = await mediator.Send(command);
        return Ok(new { success = true });
    }

    [HttpDelete("{playlistId}/tracks/{mediaItemId}")]
    public async Task<IActionResult> RemoveTrack(Guid playlistId, Guid mediaItemId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var command = new RemoveTrackFromPlaylistCommand(playlistId, mediaItemId, userId);
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

public class UpdatePlaylistRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverUrl { get; set; }
}
