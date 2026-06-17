using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.History.Commands.AddPlayHistory;

namespace TuneVault.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class HistoryController(IMediator mediator) : ControllerBase
{
    [HttpPost("play/{mediaId}")]
    public async Task<IActionResult> RecordPlayHistory(Guid mediaId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Không thể xác thực danh tính người dùng.");
        }

        var command = new AddPlayHistoryCommand(userId, mediaId);
        var success = await mediator.Send(command);

        return Ok(new { success });
    }

    [HttpGet]
    public async Task<IActionResult> GetRecentHistory([FromQuery] int limit = 10)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Không thể xác thực danh tính người dùng.");
        }

        var query = new TuneVault.Application.Features.History.Queries.GetUserHistory.GetUserHistoryQuery(userId, limit);
        var history = await mediator.Send(query);

        return Ok(new { success = true, data = history });
    }
}
