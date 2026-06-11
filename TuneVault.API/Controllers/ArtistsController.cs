using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Artists.Commands.CreateArtist;
using TuneVault.Application.Features.Artists.Commands.DeleteArtist;
using TuneVault.Application.Features.Artists.Queries.GetAllArtists;

namespace TuneVault.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class ArtistsController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateArtist([FromForm] string name, [FromForm] string? bio, IFormFile? avatarFile)
    {
        using var stream = avatarFile?.OpenReadStream();
        var command = new CreateArtistCommand(name, bio, stream, avatarFile?.FileName);
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
    public async Task<IActionResult> DeleteArtist(Guid id)
    {
        await mediator.Send(new DeleteArtistCommand(id));
        return Ok(new { success = true, message = "Xóa nghệ sĩ thành công" });
    }
}