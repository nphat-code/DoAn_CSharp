using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TuneVault.Infrastructure.Hubs;

[Authorize] // Yêu cầu phải có Token JWT mới được kết nối
public class NotificationHub : Hub
{
    // Cấu hình SignalR tự động map Connection với UserId lấy từ JWT (ClaimTypes.NameIdentifier)
    public override async Task OnConnectedAsync()
    {
        // Bạn có thể ghi log User vừa kết nối tại đây
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
