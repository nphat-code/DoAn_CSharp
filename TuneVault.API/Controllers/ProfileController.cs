using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Profile.Commands.UpdateAvatar;
using TuneVault.Application.Features.Profile.DTOs;
using TuneVault.Application.Features.Profile.Queries.GetProfile;

namespace TuneVault.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ProfileController(IMediator mediator) : ControllerBase
{
    // GET /api/profile
    [HttpGet]
    public async Task<ActionResult<ProfileDto>> GetMyProfile()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized("Không thể xác thực danh tính người dùng.");

        var profile = await mediator.Send(new GetProfileQuery(userId));
        return Ok(new { success = true, data = profile });
    }

    // PUT /api/profile/avatar
    [HttpPut("avatar")]
    public async Task<IActionResult> UpdateAvatar([FromBody] string avatarUrl)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized("Không thể xác thực danh tính người dùng.");

        var success = await mediator.Send(new UpdateProfileAvatarCommand(userId, avatarUrl));
        return Ok(new { success });
    }
}
