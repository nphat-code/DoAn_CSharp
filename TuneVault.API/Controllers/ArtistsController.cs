using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Artists.Commands.CreateArtist;
using TuneVault.Application.Features.Artists.Commands.DeleteArtist;
using TuneVault.Application.Features.Artists.Queries.GetAllArtists;

namespace TuneVault.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ArtistsController(IMediator mediator) : ControllerBase
{
    public class CreateArtistRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public IFormFile? AvatarFile { get; set; }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateArtist([FromForm] CreateArtistRequest request)
    {
        using var stream = request.AvatarFile?.OpenReadStream();
        var command = new CreateArtistCommand(request.Name, request.Bio, stream, request.AvatarFile?.FileName);
        var artistId = await mediator.Send(command);
        return Ok(new { id = artistId, message = "Artist created successfully" });
    }

    [HttpGet]
    public async Task<IActionResult> GetAllArtists()
    {
        var result = await mediator.Send(new GetAllArtistsQuery());
        return Ok(new { success = true, data = result });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteArtist(Guid id)
    {
        await mediator.Send(new DeleteArtistCommand(id));
        return Ok(new { success = true, message = "Xóa nghệ sĩ thành công" });
    }

    [HttpPost("{id}/follow")]
    [Authorize] 
    public async Task<IActionResult> FollowArtist(Guid id)
    {
        var result = await mediator.Send(new TuneVault.Application.Features.Artists.Commands.FollowArtist.FollowArtistCommand(id));
        return Ok(new { success = true, data = result });
    }

    [HttpDelete("{id}/follow")]
    [Authorize]
    public async Task<IActionResult> UnfollowArtist(Guid id)
    {
        var result = await mediator.Send(new TuneVault.Application.Features.Artists.Commands.UnfollowArtist.UnfollowArtistCommand(id));
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id}/follow-status")]
    [Authorize]
    public async Task<IActionResult> GetFollowStatus(Guid id)
    {
        var result = await mediator.Send(new TuneVault.Application.Features.Artists.Queries.CheckFollowStatus.CheckFollowStatusQuery(id));
        return Ok(new { success = true, data = result });
    }

    [HttpGet("followed")]
    [Authorize]
    public async Task<IActionResult> GetFollowedArtists()
    {
        var result = await mediator.Send(new TuneVault.Application.Features.Artists.Queries.GetFollowedArtists.GetFollowedArtistsQuery());
        return Ok(new { success = true, data = result });
    }
}