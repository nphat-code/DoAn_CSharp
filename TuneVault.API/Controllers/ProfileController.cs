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

    // GET /api/profile/{id}
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ProfileDto>> GetProfileById(Guid id)
    {
        try 
        {
            var profile = await mediator.Send(new GetProfileQuery(id));
            return Ok(new { success = true, data = profile });
        }
        catch (Exception ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
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

    // PUT /api/profile
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized("Không thể xác thực danh tính người dùng.");

        var success = await mediator.Send(new TuneVault.Application.Features.Profile.Commands.UpdateProfile.UpdateProfileCommand(userId, dto.Username, dto.AvatarUrl, dto.Bio));
        return Ok(new { success });
    }

    // GET /api/profile/search
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProfileDto>>> SearchUsers([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new List<ProfileDto>());

        var result = await mediator.Send(new TuneVault.Application.Features.Profile.Queries.SearchUsers.SearchUsersQuery(q));
        return Ok(result);
    }

    // DELETE /api/profile
    [HttpDelete]
    public async Task<IActionResult> DeleteProfile()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized("Không thể xác thực danh tính người dùng.");

        var success = await mediator.Send(new TuneVault.Application.Features.Profile.Commands.DeleteUser.DeleteUserCommand(userId));
        return Ok(new { success });
    }

    // DELETE /api/profile/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUserAsAdmin(Guid id)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Admin")
            return Forbid("Chỉ có quản trị viên mới có quyền xóa người dùng khác.");

        var success = await mediator.Send(new TuneVault.Application.Features.Profile.Commands.DeleteUser.DeleteUserCommand(id));
        return Ok(new { success });
    }
}
