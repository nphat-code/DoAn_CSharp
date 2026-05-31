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
    public async Task<IActionResult> UploadMedia([FromForm] string title, [FromForm] string? description, IFormFile file)
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

        var command = new UploadMediaCommand(
            UploaderId: uploaderId,
            Title: title,
            Description: description,
            FileStream: stream,
            FileName: file.FileName,
            ContentType: file.ContentType
        );

        var response = await mediator.Send(command);
        return Ok(response);
    }
}
