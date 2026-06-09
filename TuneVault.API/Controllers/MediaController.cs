using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Media.Commands.UploadMedia;

namespace TuneVault.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Bảo vệ endpoint, yêu cầu phải đăng nhập
public class MediaController(IMediator mediator) : ControllerBase
{
    [HttpPost("upload")]
    // Tắt Validate AntiForgeryToken cho API và config upload file size qua server nếu cần
    public async Task<IActionResult> UploadMedia([FromForm] string title, [FromForm] string? description, IFormFile file, IFormFile? coverImage)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("Vui lòng đính kèm file media.");
        }

        // Lấy UploaderId từ User Claims (đã xác thực qua JWT)
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
            CoverImageFileName: coverImage?.FileName
        );

        var response = await mediator.Send(command);
        coverStream?.Dispose();
        return Ok(response);
    }

    [HttpGet]
    [AllowAnonymous] // Cho phép truy cập danh sách nhạc không cần đăng nhập (hoặc bạn có thể bỏ AllowAnonymous nếu muốn bảo vệ)
    public async Task<IActionResult> GetMediaList()
    {
        var query = new TuneVault.Application.Features.Media.Queries.GetMediaList.GetMediaListQuery();
        var result = await mediator.Send(query);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id}/stream")]
    [AllowAnonymous] // Phát nhạc thì có thể không cần đăng nhập tùy business, nhưng mình cứ để anonymous cho player test dễ
    public async Task<IActionResult> StreamMedia(Guid id)
    {
        var query = new TuneVault.Application.Features.Media.Queries.GetMediaStream.GetMediaStreamQuery(id);
        var result = await mediator.Send(query);

        // enableRangeProcessing: true là chìa khóa để hỗ trợ Range Requests (seek/tua video)
        return PhysicalFile(result.PhysicalPath, result.ContentType, enableRangeProcessing: true);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest("Search query cannot be empty");

        var query = new TuneVault.Application.Features.Media.Queries.SearchMedia.SearchMediaQuery(q);
        var result = await mediator.Send(query);
        return Ok(new { success = true, data = result });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedia(Guid id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var uploaderId))
        {
            return Unauthorized("Không thể xác thực danh tính người dùng.");
        }

        var command = new TuneVault.Application.Features.Media.Commands.DeleteMedia.DeleteMediaCommand(id, uploaderId);
        var result = await mediator.Send(command);
        
        if (!result)
        {
            return NotFound("Không tìm thấy media hoặc bạn không có quyền xóa.");
        }

        return Ok(new { success = true, message = "Đã xóa thành công" });
    }
}
