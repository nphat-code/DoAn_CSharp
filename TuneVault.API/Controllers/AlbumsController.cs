using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TuneVault.Application.Features.Albums.Queries.GetAllAlbums;
using TuneVault.Application.Features.Albums.Queries.GetAlbumById;
using TuneVault.Application.Features.Albums.Commands.CreateAlbum;
using TuneVault.Application.Features.Albums.Commands.AddTrackToAlbum;

namespace TuneVault.API.Controllers;

public class CreateAlbumRequest
{
    public required string Title { get; set; }
    public required string ArtistName { get; set; }
    public IFormFile? CoverFile { get; set; }
}

[Route("api/[controller]")]
[ApiController]
public class AlbumsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllAlbums()
    {
        var result = await mediator.Send(new GetAllAlbumsQuery());
        return Ok(new { success = true, data = result });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAlbumById(Guid id)
    {
        var result = await mediator.Send(new GetAlbumByIdQuery(id));
        if (result == null)
            return NotFound(new { success = false, message = "Không tìm thấy Album" });
            
        return Ok(new { success = true, data = result });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateAlbum([FromForm] CreateAlbumRequest request)
    {
        Stream? coverStream = null;
        string? coverFileName = null;

        if (request.CoverFile != null)
        {
            coverStream = request.CoverFile.OpenReadStream();
            coverFileName = request.CoverFile.FileName;
        }

        var command = new CreateAlbumCommand(
            request.Title,
            request.ArtistName,
            coverStream,
            coverFileName
        );

        var result = await mediator.Send(command);
        return Ok(new { success = true, data = result, message = "Tạo album thành công!" });
    }

    public class AddTrackRequest
    {
        public Guid TrackId { get; set; }
    }

    [HttpPost("{id}/tracks")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddTrackToAlbum(Guid id, [FromBody] AddTrackRequest request)
    {
        var command = new AddTrackToAlbumCommand(id, request.TrackId);
        await mediator.Send(command);
        return Ok(new { success = true, message = "Đã thêm bài hát vào album" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAlbum(Guid id)
    {
        var command = new TuneVault.Application.Features.Albums.Commands.DeleteAlbum.DeleteAlbumCommand(id);
        await mediator.Send(command);
        return Ok(new { success = true, message = "Xóa album thành công" });
    }
}
