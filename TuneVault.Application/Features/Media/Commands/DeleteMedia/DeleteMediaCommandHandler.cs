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

        
        if (mediaItem.UploaderId != request.RequesterId && !request.IsAdmin) 
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa bài hát của người khác.");
        }

        
        if (!string.IsNullOrEmpty(mediaItem.FileUrl))
        {
            await fileStorageService.DeleteFileAsync(mediaItem.FileUrl, cancellationToken);
        }

        
        await mediaItemRepository.DeleteAsync(request.Id, cancellationToken);

        return true;
    }
}
