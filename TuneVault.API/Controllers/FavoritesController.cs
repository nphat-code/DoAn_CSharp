using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Favorites.Commands.ToggleFavorite;

namespace TuneVault.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class FavoritesController(IMediator mediator) : ControllerBase
{
    
    [HttpPost("toggle/{mediaId}")]
    public async Task<IActionResult> ToggleFavorite(Guid mediaId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Không thể xác thực danh tính người dùng.");
        }

        var isFavorited = await mediator.Send(new ToggleFavoriteCommand(userId, mediaId));

        return Ok(new { isFavorited });
    }

    
    [HttpGet("check/{mediaId}")]
    public async Task<IActionResult> CheckFavorite(Guid mediaId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Không thể xác thực danh tính người dùng.");
        }

        
        var repo = HttpContext.RequestServices.GetRequiredService<TuneVault.Application.Interfaces.IFavoriteRepository>();
        var isFavorited = await repo.IsFavoritedAsync(userId, mediaId, HttpContext.RequestAborted);

        return Ok(new { isFavorited });
    }

    
    [HttpGet]
    public async Task<IActionResult> GetFavorites()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized("Không thể xác thực danh tính người dùng.");
        }

        var query = new TuneVault.Application.Features.Favorites.Queries.GetUserFavorites.GetUserFavoritesQuery(userId);
        var favorites = await mediator.Send(query);

        return Ok(new { success = true, data = favorites });
    }
}
