using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.Application.Features.Share.Commands.ShareMedia;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShareController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> ShareMedia([FromBody] ShareMediaRequest request)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var command = new ShareMediaCommand(
            Guid.Parse(userIdString), 
            request.ReceiverId, 
            request.MediaId, 
            request.Message);

        var result = await mediator.Send(command);
        return Ok(new { Success = result });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetSharedWithMe()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var query = new TuneVault.Application.Features.Share.Queries.GetSharedWithMe.GetSharedWithMeQuery(Guid.Parse(userIdString));
        var result = await mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("by-me")]
    public async Task<IActionResult> GetSharedByMe()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var query = new TuneVault.Application.Features.Share.Queries.GetSharedByMe.GetSharedByMeQuery(Guid.Parse(userIdString));
        var result = await mediator.Send(query);
        return Ok(result);
    }
}

public class ShareMediaRequest
{
    public Guid ReceiverId { get; set; }
    public Guid MediaId { get; set; }
    public string Message { get; set; } = string.Empty;
}
