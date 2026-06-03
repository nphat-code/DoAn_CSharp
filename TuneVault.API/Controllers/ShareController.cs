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
}

public class ShareMediaRequest
{
    public Guid ReceiverId { get; set; }
    public Guid MediaId { get; set; }
    public string Message { get; set; } = string.Empty;
}
