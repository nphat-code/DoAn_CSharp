using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Artists.Commands.CreateArtist;

namespace TuneVault.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
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
}