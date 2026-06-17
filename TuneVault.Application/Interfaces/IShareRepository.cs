using TuneVault.Application.Features.Share.DTOs;

namespace TuneVault.Application.Interfaces;

public interface IShareRepository
{
    Task<bool> ShareMediaAsync(Guid senderId, Guid receiverId, Guid mediaId, string message, Guid notificationId, string notificationMessage, DateTime createdAt);
    Task<IEnumerable<MediaShareDto>> GetSharedWithMeAsync(Guid receiverId, CancellationToken cancellationToken);
    Task<IEnumerable<MediaShareDto>> GetSharedByMeAsync(Guid senderId, CancellationToken cancellationToken);
}
