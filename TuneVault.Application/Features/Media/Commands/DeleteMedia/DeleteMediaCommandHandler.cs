using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Commands.DeleteMedia;

public class DeleteMediaCommandHandler(
    IMediaItemRepository mediaItemRepository,
    IFileStorageService fileStorageService) : IRequestHandler<DeleteMediaCommand, bool>
{
    public async Task<bool> Handle(DeleteMediaCommand request, CancellationToken cancellationToken)
    {
        var mediaItem = await mediaItemRepository.GetByIdAsync(request.Id, cancellationToken);
        
        if (mediaItem == null)
            return false;

        // Chỉ người upload mới được phép xóa bài nhạc của mình
        if (mediaItem.UploaderId != request.RequesterId) 
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa bài hát của người khác.");
        }

        // Xóa file vật lý
        if (!string.IsNullOrEmpty(mediaItem.FileUrl))
        {
            await fileStorageService.DeleteFileAsync(mediaItem.FileUrl, cancellationToken);
        }

        // Xóa trong DB
        await mediaItemRepository.DeleteAsync(request.Id, cancellationToken);

        return true;
    }
}
