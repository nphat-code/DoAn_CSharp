using FluentValidation;

namespace TuneVault.Application.Features.Media.Commands.UploadMedia;

public class UploadMediaCommandValidator : AbstractValidator<UploadMediaCommand>
{
    public UploadMediaCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề không được để trống.");

        RuleFor(x => x.FileName)
            .NotEmpty().WithMessage("Phải có file đính kèm.")
            .Must(HaveValidMediaExtension).WithMessage("Định dạng file không được hỗ trợ. Vui lòng dùng mp3, mp4, wav.");

        RuleFor(x => x.ContentType)
            .NotEmpty()
            .Must(HaveValidMimeType).WithMessage("MIME type không được hỗ trợ.");

        RuleFor(x => x.CoverImageFileName)
            .Must(HaveValidImageExtension).When(x => !string.IsNullOrEmpty(x.CoverImageFileName))
            .WithMessage("Định dạng ảnh bìa phải là jpg, jpeg, png, webp.");
    }

    private bool HaveValidMediaExtension(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName)) return false;
        
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext is ".mp3" or ".mp4" or ".wav" or ".webm";
    }

    private bool HaveValidMimeType(string contentType)
    {
        if (string.IsNullOrWhiteSpace(contentType)) return false;
        return contentType.StartsWith("audio/") || contentType.StartsWith("video/");
    }

    private bool HaveValidImageExtension(string? fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName)) return true; // Optional
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext is ".jpg" or ".jpeg" or ".png" or ".webp";
    }
}
