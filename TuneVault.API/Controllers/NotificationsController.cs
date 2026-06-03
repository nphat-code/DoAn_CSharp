using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Data;
using Dapper;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController(IDbConnection dbConnection) : ControllerBase
{
    // Lấy danh sách thông báo chưa đọc
    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var sql = @"
            SELECT Id, UserId, Message, Type, IsRead, CreatedAt 
            FROM Notifications 
            WHERE UserId = @UserId 
            ORDER BY CreatedAt DESC";

        var notifications = await dbConnection.QueryAsync(sql, new { UserId = Guid.Parse(userIdString) });
        return Ok(notifications);
    }

    // Đánh dấu đã đọc
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

        var sql = "UPDATE Notifications SET IsRead = 1 WHERE Id = @Id AND UserId = @UserId";
        await dbConnection.ExecuteAsync(sql, new { Id = id, UserId = Guid.Parse(userIdString) });
        
        return Ok();
    }
}
