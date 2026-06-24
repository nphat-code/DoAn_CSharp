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
            
            return false;
        }

        
        await notificationService.SendNotificationToUserAsync(
            request.ReceiverId, 
            notifId,
            notificationMessage, 
            "Share", 
            createdAt,
            cancellationToken);

        return true;
    }
}
