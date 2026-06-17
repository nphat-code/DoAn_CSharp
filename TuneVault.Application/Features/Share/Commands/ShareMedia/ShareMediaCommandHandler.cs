using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Share.Commands.ShareMedia;

public class ShareMediaCommandHandler(
    IShareRepository shareRepository,
    INotificationService notificationService) : IRequestHandler<ShareMediaCommand, bool>
{
    public async Task<bool> Handle(ShareMediaCommand request, CancellationToken cancellationToken)
    {
        var notifId = Guid.NewGuid();
        var notificationMessage = string.IsNullOrEmpty(request.Message) 
            ? "Ai đó đã gửi cho bạn một bài hát" 
            : $"Bạn nhận được một bài hát kèm lời nhắn: {request.Message}";
        var createdAt = DateTime.UtcNow;

        // 1 & 2. Gọi sang tầng Infrastructure để lưu DB (Bảo đảm Clean Architecture)
        var success = await shareRepository.ShareMediaAsync(
            request.SenderId, 
            request.ReceiverId, 
            request.MediaId, 
            request.Message, 
            notifId, 
            notificationMessage, 
            createdAt);

        if (!success)
        {
            // Trả về false nếu đã share rồi (idempotent), không gửi lại notification
            return false;
        }

        // 3. Đẩy thông báo Real-time cho Receiver
        await notificationService.SendNotificationToUserAsync(
            request.ReceiverId, 
            notificationMessage, 
            "Share", 
            cancellationToken);

        return true;
    }
}
