using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Media.Commands.UploadMedia;

namespace TuneVault.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] 
public class MediaController(IMediator mediator) : ControllerBase
{
    [HttpPost("upload")]
    [Authorize(Roles = "Admin")]
    
    public async Task<IActionResult> UploadMedia([FromForm] string title, [FromForm] string? description, IFormFile file, IFormFile? coverImage, [FromForm] Guid? albumId = null, [FromForm] Guid? artistId = null)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Vui lòng đính kèm file media.");
        }

        
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var uploaderId))
        {
            return Unauthorized("Không thể xác thực danh tính người dùng.");
        }

        using var stream = file.OpenReadStream();
        Stream? coverStream = coverImage?.OpenReadStream();

        var command = new UploadMediaCommand(
            UploaderId: uploaderId,
            Title: title,
            Description: description,
            FileStream: stream,
            FileName: file.FileName,
            ContentType: file.ContentType,
            CoverImageStream: coverStream,
            CoverImageFileName: coverImage?.FileName,
            AlbumId: albumId,
            ArtistId: artistId
        );

        var response = await mediator.Send(command);
        coverStream?.Dispose();
        return Ok(new { success = true, data = response });
    }

    [HttpGet]
    [AllowAnonymous] 
    public async Task<IActionResult> GetMediaList()
    {
        var query = new TuneVault.Application.Features.Media.Queries.GetMediaList.GetMediaListQuery();
        var result = await mediator.Send(query);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id}/stream")]
    [AllowAnonymous] 
    public async Task<IActionResult> StreamMedia(Guid id)
    {
        var query = new TuneVault.Application.Features.Media.Queries.GetMediaStream.GetMediaStreamQuery(id);
        var result = await mediator.Send(query);

        
        return PhysicalFile(result.PhysicalPath, result.ContentType, enableRangeProcessing: true);
    }

    [HttpGet("search")]
    [AllowAnonymous]
    public async Task<IActionResult> Search([FromQuery] string q = "", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var query = new TuneVault.Application.Features.Media.Queries.SearchMedia.SearchMediaQuery(q, page, pageSize);
            var result = await mediator.Send(query);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteMedia(Guid id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var uploaderId))
        {
            return Unauthorized("Không thể xác thực danh tính người dùng.");
        }

        var isAdmin = User.IsInRole("Admin");
        var command = new TuneVault.Application.Features.Media.Commands.DeleteMedia.DeleteMediaCommand(id, uploaderId, isAdmin);
        var result = await mediator.Send(command);
        
        if (!result)
        {
            return NotFound("Không tìm thấy media hoặc bạn không có quyền xóa.");
        }

        return Ok(new { success = true, message = "Đã xóa thành công" });
    }
}
