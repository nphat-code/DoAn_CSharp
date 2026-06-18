using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Follow.Commands.FollowUser;
using TuneVault.Application.Features.Follow.Commands.UnfollowUser;
using TuneVault.Application.Features.Follow.Queries.CheckFollowStatus;

namespace TuneVault.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FollowController(IMediator mediator) : ControllerBase
{
    [HttpPost("{id}")]
    public async Task<IActionResult> FollowUser(Guid id)
    {
        var currentUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(currentUserIdString, out var currentUserId))
            return Unauthorized();

        var success = await mediator.Send(new FollowUserCommand(currentUserId, id));
        return Ok(new { success });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> UnfollowUser(Guid id)
    {
        var currentUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(currentUserIdString, out var currentUserId))
            return Unauthorized();

        var success = await mediator.Send(new UnfollowUserCommand(currentUserId, id));
        return Ok(new { success });
    }

    [HttpGet("status/{id}")]
    public async Task<IActionResult> CheckFollowStatus(Guid id)
    {
        var currentUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(currentUserIdString, out var currentUserId))
            return Unauthorized();

        var isFollowing = await mediator.Send(new CheckFollowStatusQuery(currentUserId, id));
        return Ok(new { isFollowing });
    }

    [HttpGet("{id}/followers")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFollowers(Guid id)
    {
        var followers = await mediator.Send(new TuneVault.Application.Features.Follow.Queries.GetFollowData.GetFollowersQuery(id));
        return Ok(new { success = true, data = followers });
    }

    [HttpGet("{id}/following")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFollowing(Guid id)
    {
        var following = await mediator.Send(new TuneVault.Application.Features.Follow.Queries.GetFollowData.GetFollowingQuery(id));
        return Ok(new { success = true, data = following });
    }

    [HttpGet("{id}/counts")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFollowCounts(Guid id)
    {
        var (followers, following) = await mediator.Send(new TuneVault.Application.Features.Follow.Queries.GetFollowData.GetFollowCountsQuery(id));
        return Ok(new { success = true, data = new { followersCount = followers, followingCount = following } });
    }
}
